import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  handleBotCommand,
  formatExpenseBotReply,
  formatIncomeBotReply,
  formatTransferBotReply,
  formatRupiah,
  sendTelegramMessage,
} from "@/lib/telegram";
import {
  parseNaturalLanguageTransaction,
  parseReceiptImage,
  transcribeAudioVoiceNote,
  evaluateWealthAdvisor,
} from "@/lib/ai-engine";
import { TelegramWebhookPayload } from "@/types";

// In-memory idempotency cache untuk mencegah duplicate execution dari network retry Telegram
const processedUpdateIds = new Set<number>();

export async function POST(req: NextRequest) {
  try {
    const payload: TelegramWebhookPayload = await req.json();

    // 1. Idempotency Check
    if (!payload.update_id) {
      return NextResponse.json({ ok: false, message: "Missing update_id" }, { status: 400 });
    }

    if (processedUpdateIds.has(payload.update_id)) {
      // Ignore duplicate silently dengan 200 OK sesuai standar perbankan idempotent
      return NextResponse.json({ ok: true, duplicate: true });
    }
    processedUpdateIds.add(payload.update_id);
    if (processedUpdateIds.size > 10000) {
      processedUpdateIds.clear();
    }

    const message = payload.message || (payload as any).edited_message;
    if (!message) {
      return NextResponse.json({ ok: true, ignored: true });
    }

    const chatId = message.chat?.id;
    const text = message.text || message.caption || "";
    const subscription = await db.getSubscription();

    let replyText = "";
    let txCreated = null;

    // Otomatis tautkan chat ID pengguna aktif ke database saat ada interaksi pertama
    if (chatId) {
      try {
        await db.updateProfile({
          telegramChatId: chatId,
          telegramConnected: true,
        });
      } catch (e) {
        console.error("Gagal update telegramChatId:", e);
      }
    }

    // 2. Handle Bot Slash Commands (/start, /saldo, /hari_ini, /minggu_ini, /bulan_ini, /budget, /bantuan)
    if (text.startsWith("/")) {
      replyText = await handleBotCommand(text);
    }
    // 3. Quota Enforcement for Starter Plan
    else if (subscription.planType === "starter" && subscription.monthlyTxCount >= 75) {
      replyText = `⚠️ KUOTA BULANAN TERCAPAI
Akun Starter Anda telah mencapai batas maksimal 75 transaksi bulan ini.
Silakan upgrade ke TataDana Pro untuk pencatatan tanpa batas, scan struk Vision AI, dan AI Wealth Advisor.
👉 Tautan Upgrade: /upgrade atau kunjungi tatadana.id/billing`;
    }
    // 4. Handle Voice Note
    else if (message.voice || message.audio) {
      const { transcriptText } = await transcribeAudioVoiceNote(
        message.voice?.duration || 10,
        text || undefined
      );

      const aiResult = await parseNaturalLanguageTransaction(transcriptText);
      const parsed = aiResult.data;

      const wallets = await db.getWallets();
      const originWallet =
        wallets.find((w) => w.name.toLowerCase() === parsed.wallet_asal?.toLowerCase()) ||
        wallets.find((w) => w.isDefault) ||
        wallets[0];

      const categories = await db.getCategories();
      const matchedCat =
        categories.find((c) => c.name.toLowerCase() === parsed.kategori.toLowerCase()) ||
        categories.find((c) => c.type === parsed.jenis) ||
        categories[0];

      txCreated = await db.createTransaction({
        walletId: originWallet.id,
        walletName: originWallet.name,
        categoryId: matchedCat.id,
        categoryName: matchedCat.name,
        categoryEmoji: matchedCat.iconEmoji,
        categoryColor: matchedCat.colorHex,
        type: parsed.jenis,
        amount: parsed.nominal,
        note: parsed.catatan,
        source: "telegram_voice",
      });

      const updatedWallets = await db.getWallets();
      const currentWallet = updatedWallets.find((w) => w.id === originWallet.id);
      const remainingBalance = currentWallet ? currentWallet.balance : originWallet.balance;

      const budgets = await db.getBudgets();
      const budgetProg = budgets.find((b) => b.categoryId === matchedCat.id) || {
        capAmount: matchedCat.monthlyBudgetCap,
        spentAmount: parsed.nominal,
        remainingAmount: matchedCat.monthlyBudgetCap - parsed.nominal,
        percentage: 50,
      };

      const baseReply =
        parsed.jenis === "income"
          ? formatIncomeBotReply(txCreated, remainingBalance)
          : formatExpenseBotReply(txCreated, remainingBalance, budgetProg);

      replyText = `🎙️ Transkrip: "${transcriptText}"\n\n${baseReply}`;
    }
    // 5. Handle Photo / Receipt OCR
    else if (message.photo && message.photo.length > 0) {
      if (subscription.planType === "starter") {
        replyText = `🔒 FITUR EKSKLUSIF PAKET PRO & LIFETIME
Pencatatan struk belanja multi-item menggunakan Vision OCR hanya tersedia untuk pengguna TataDana Pro.
Tingkatkan akun Anda sekarang untuk menikmati pencatatan instan dari foto struk belanja!
👉 Upgrade akun di: tatadana.id/billing`;
      } else {
        const receiptData = await parseReceiptImage("https://placeholder.receipt/image.jpg");

        const wallets = await db.getWallets();
        const defaultWallet = wallets.find((w) => w.isDefault) || wallets[0];
        const categories = await db.getCategories();
        const diningCat = categories.find((c) => c.name.includes("Dining")) || categories[0];

        txCreated = await db.createTransaction({
          walletId: defaultWallet.id,
          walletName: defaultWallet.name,
          categoryId: diningCat.id,
          categoryName: diningCat.name,
          categoryEmoji: diningCat.iconEmoji,
          categoryColor: diningCat.colorHex,
          type: "expense",
          amount: receiptData.totalAmount,
          note: `Struk: ${receiptData.merchantName} (${receiptData.items.length} item)`,
          source: "telegram_receipt",
          receiptImageUrl:
            "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80",
          items: receiptData.items.map((i) => ({
            itemName: i.itemName,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            totalPrice: i.totalPrice,
            categoryId: diningCat.id,
          })),
        });

        const updatedWallets = await db.getWallets();
        const curWallet = updatedWallets.find((w) => w.id === defaultWallet.id);
        const remainingBalance = curWallet?.balance || 0;

        const budgets = await db.getBudgets();
        const budgetProg = budgets.find((b) => b.categoryId === diningCat.id) || {
          capAmount: diningCat.monthlyBudgetCap,
          spentAmount: receiptData.totalAmount,
          remainingAmount: diningCat.monthlyBudgetCap - receiptData.totalAmount,
          percentage: 65,
        };

        const itemsListStr = receiptData.items
          .map(
            (it) =>
              `  • ${it.itemName} (${it.quantity}x @ ${formatRupiah(it.unitPrice)}) = ${formatRupiah(
                it.totalPrice
              )}`
          )
          .join("\n");

        replyText = `🧾 STRUK PEMBELIAN TERDETEKSI
🏪 Merchant: ${receiptData.merchantName}
${itemsListStr}
📦 Pajak / Layanan: ${formatRupiah(receiptData.taxAmount)}
──────────────────────────
${formatExpenseBotReply(txCreated, remainingBalance, budgetProg)}`;
      }
    }
    // 6. Handle Natural Language Text Transaction
    else if (text) {
      const aiResult = await parseNaturalLanguageTransaction(text);
      const parsed = aiResult.data;

      const wallets = await db.getWallets();
      const originWallet =
        wallets.find((w) => w.name.toLowerCase().includes(parsed.wallet_asal?.toLowerCase() || "")) ||
        wallets.find((w) => w.isDefault) ||
        wallets[0];

      const categories = await db.getCategories();
      const matchedCat =
        categories.find((c) => c.name.toLowerCase().includes(parsed.kategori.toLowerCase())) ||
        categories.find((c) => c.type === parsed.jenis) ||
        categories[0];

      let targetWallet = undefined;
      if (parsed.jenis === "transfer" && parsed.wallet_tujuan) {
        targetWallet = wallets.find((w) =>
          w.name.toLowerCase().includes(parsed.wallet_tujuan?.toLowerCase() || "")
        );
      }

      txCreated = await db.createTransaction({
        walletId: originWallet.id,
        walletName: originWallet.name,
        categoryId: matchedCat.id,
        categoryName: matchedCat.name,
        categoryEmoji: matchedCat.iconEmoji,
        categoryColor: matchedCat.colorHex,
        type: parsed.jenis,
        amount: parsed.nominal,
        toWalletId: targetWallet?.id,
        toWalletName: targetWallet?.name,
        adminFee: parsed.jenis === "transfer" ? 2500 : 0,
        note: parsed.catatan,
        source: "telegram_text",
      });

      const updatedWallets = await db.getWallets();
      const curWallet = updatedWallets.find((w) => w.id === originWallet.id);
      const remainingBalance = curWallet?.balance || 0;

      const budgets = await db.getBudgets();
      const budgetProg = budgets.find((b) => b.categoryId === matchedCat.id) || {
        capAmount: matchedCat.monthlyBudgetCap,
        spentAmount: parsed.nominal,
        remainingAmount: matchedCat.monthlyBudgetCap - parsed.nominal,
        percentage: 50,
      };

      if (parsed.jenis === "expense") {
        replyText = formatExpenseBotReply(txCreated, remainingBalance, budgetProg);
      } else if (parsed.jenis === "income") {
        replyText = formatIncomeBotReply(txCreated, remainingBalance);
      } else {
        const curTargetWallet = updatedWallets.find((w) => w.id === targetWallet?.id);
        replyText = formatTransferBotReply(
          txCreated,
          remainingBalance,
          curTargetWallet?.balance || 0
        );
      }

      // Check Autonomous Wealth Advisor
      if (subscription.planType !== "starter") {
        const advisor = await evaluateWealthAdvisor(
          txCreated.userId,
          txCreated.amount,
          txCreated.categoryName
        );
        if (advisor.shouldTrigger && advisor.insightMessage) {
          replyText += `\n\n${advisor.insightMessage}`;
        }
      }
    } else {
      replyText = "Format pesan tidak dikenali. Ketik /bantuan untuk melihat panduan pencatatan.";
    }

    // 7. Kirim Balasan Langsung ke Chat Telegram
    if (chatId && replyText) {
      await sendTelegramMessage(chatId, replyText);
    }

    // Kembalikan respon 200 OK dengan format standar Telegram webhook response
    return NextResponse.json({
      ok: true,
      method: "sendMessage",
      chat_id: chatId,
      text: replyText,
      reply: replyText,
      transaction: txCreated,
    });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message || "Gagal memproses webhook telegram",
      },
      { status: 200 } // Selalu 200 OK agar Telegram tidak melakukan retry loop bad request
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    gateway: "TataDana Prime Unified Telegram Ingress",
    botUsername: process.env.TELEGRAM_BOT_USERNAME || "lilybhotom_bot",
    standard: "Bank-Grade Idempotency & WIB UTC+7",
    timestamp: new Date().toISOString(),
  });
}
