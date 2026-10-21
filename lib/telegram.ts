import { ParsedTransactionPayload, Transaction, TransactionType } from "@/types";

/**
 * Format angka ke format mata uang Rupiah Indonesia (misal: Rp1.500.000)
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount).replace(/\s+/g, "");
}

/**
 * Format tanggal & jam ke standar WIB (Asia/Jakarta)
 */
export function formatWIBTime(dateInput: Date | string | number = new Date()): { day: string; dateStr: string; timeStr: string } {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  let date: Date;
  if (dateInput instanceof Date) {
    date = isNaN(dateInput.getTime()) ? new Date() : dateInput;
  } else if (typeof dateInput === "string" || typeof dateInput === "number") {
    const parsed = new Date(dateInput);
    date = isNaN(parsed.getTime()) ? new Date() : parsed;
  } else {
    date = new Date();
  }

  // WIB is UTC+7
  const wibOffset = 7 * 60; // minutes
  const localOffset = date.getTimezoneOffset(); // minutes
  const wibDate = new Date(date.getTime() + (wibOffset + localOffset) * 60000);

  const day = days[wibDate.getDay()];
  const dateStr = `${wibDate.getDate()} ${months[wibDate.getMonth()]} ${wibDate.getFullYear()}`;
  const hours = String(wibDate.getHours()).padStart(2, "0");
  const minutes = String(wibDate.getMinutes()).padStart(2, "0");
  const timeStr = `${hours}:${minutes} WIB`;

  return { day, dateStr, timeStr };
}

/**
 * Membuat visual progress bar ASCII / Unicode resolusi tinggi
 * e.g. [████████░░░░░░░░] 50%
 */
export function renderProgressBar(percentage: number, totalBlocks = 16): string {
  const clamped = Math.max(0, Math.min(percentage, 100));
  const filledBlocks = Math.round((clamped / 100) * totalBlocks);
  const emptyBlocks = totalBlocks - filledBlocks;
  const bar = "█".repeat(filledBlocks) + "░".repeat(emptyBlocks);
  return `[${bar}] ${percentage}%`;
}

/**
 * Parser teks bahasa alami dengan dukungan penuh nominal slang Indonesia
 */
export function parseIndonesianFinancialSlang(text: string): ParsedTransactionPayload | null {
  const cleaned = text.trim();
  const lower = cleaned.toLowerCase();

  // 1. Deteksi kata kunci tipe transaksi
  let jenis: TransactionType = "expense";
  if (
    lower.includes("gaji") ||
    lower.includes("terima") ||
    lower.includes("masuk") ||
    lower.includes("inflow") ||
    lower.includes("dividen") ||
    lower.includes("dapat komisi")
  ) {
    jenis = "income";
  } else if (
    lower.includes("transfer") ||
    lower.includes("tf") ||
    lower.includes("pindah dana") ||
    lower.includes("top up") ||
    lower.includes("topup")
  ) {
    jenis = "transfer";
  }

  // 2. Ekstraksi Nominal Slang Indonesia
  let nominal = 0;

  // Pola slang kata per kata (ceban, goceng, gocap, cepek, dll)
  const slangWords: Record<string, number> = {
    seceng: 1000,
    goceng: 5000,
    ceban: 10000,
    gocap: 50000,
    cepek: 100000,
    pekgo: 150000,
    secenggo: 1500,
  };

  for (const [slang, val] of Object.entries(slangWords)) {
    const regex = new RegExp(`\\b${slang}\\b`, "i");
    if (regex.test(lower)) {
      nominal = val;
      break;
    }
  }

  // Pola angka dengan suffix: "15rb", "15k", "1.5jt", "1,5 juta", "500k", "2.5m"
  if (nominal === 0) {
    const jtRegex = /(\d+(?:[.,]\d+)?)\s*(?:jt|juta)\b/i;
    const jtMatch = lower.match(jtRegex);
    if (jtMatch) {
      const numStr = jtMatch[1].replace(",", ".");
      nominal = parseFloat(numStr) * 1000000;
    }
  }

  if (nominal === 0) {
    const kRegex = /(\d+(?:[.,]\d+)?)\s*(?:k|rb|ribu)\b/i;
    const kMatch = lower.match(kRegex);
    if (kMatch) {
      const numStr = kMatch[1].replace(",", ".");
      nominal = parseFloat(numStr) * 1000;
    }
  }

  // Pola format angka murni atau berpemisah ribuan: "Rp 150.000", "50000", "150,000"
  if (nominal === 0) {
    const rawRegex = /(?:rp\.?\s*)?(\d{1,3}(?:[.,]\d{3})+(?:[.,]\d+)?|\d{4,12})/i;
    const rawMatch = lower.match(rawRegex);
    if (rawMatch) {
      let numStr = rawMatch[1];
      if (numStr.includes(".") && !numStr.includes(",")) {
        numStr = numStr.replace(/\./g, "");
      } else if (numStr.includes(",") && !numStr.includes(".")) {
        numStr = numStr.replace(/,/g, "");
      } else if (numStr.includes(".") && numStr.includes(",")) {
        numStr = numStr.replace(/\./g, "").replace(",", ".");
      }
      nominal = parseFloat(numStr);
    }
  }

  if (nominal <= 0) {
    return null;
  }

  // 3. Deteksi Kategori
  let kategori = "Executive Dining & Coffee";
  if (jenis === "income") {
    if (lower.includes("dividen") || lower.includes("saham") || lower.includes("yield")) {
      kategori = "Dividen Bisnis & Retainer";
    } else {
      kategori = "Executive Director Salary";
    }
  } else {
    if (lower.includes("aws") || lower.includes("cloud") || lower.includes("openai") || lower.includes("saas") || lower.includes("gpt") || lower.includes("server") || lower.includes("zoom")) {
      kategori = "SaaS & Cloud Services";
    } else if (lower.includes("dokter") || lower.includes("obat") || lower.includes("rs") || lower.includes("klinik") || lower.includes("medis") || lower.includes("vitamin")) {
      kategori = "Family & Health Care";
    } else if (lower.includes("tiket") || lower.includes("pesawat") || lower.includes("hotel") || lower.includes("flight") || lower.includes("travel") || lower.includes("garuda")) {
      kategori = "Luxury Travel & Flight";
    } else if (lower.includes("bensin") || lower.includes("shell") || lower.includes("pertamina") || lower.includes("tol") || lower.includes("parkir") || lower.includes("mobil")) {
      kategori = "Automotive & Fuel";
    } else {
      kategori = "Executive Dining & Coffee";
    }
  }

  // 4. Deteksi Wallet Asal & Tujuan
  let walletAsal: string | null = null;
  let walletTujuan: string | null = null;

  if (lower.includes("bca")) walletAsal = "BCA Prioritas";
  else if (lower.includes("mandiri")) walletAsal = "Mandiri Bisnis Operasional";
  else if (lower.includes("gopay") || lower.includes("ovo")) walletAsal = "GoPay & OVO Executive";
  else if (lower.includes("bibit")) walletAsal = "Bibit Reksadana & SBN";
  else if (lower.includes("tunai") || lower.includes("cash")) walletAsal = "Kas Tunai Pribadi";
  else if (lower.includes("valas") || lower.includes("usd")) walletAsal = "Rekening Valas USD ($12,500)";

  if (jenis === "transfer") {
    if (lower.includes("ke bibit") || lower.includes("ke reksadana")) walletTujuan = "Bibit Reksadana & SBN";
    else if (lower.includes("ke mandiri")) walletTujuan = "Mandiri Bisnis Operasional";
    else if (lower.includes("ke bca")) walletTujuan = "BCA Prioritas";
    else if (lower.includes("ke gopay")) walletTujuan = "GoPay & OVO Executive";
  }

  // 5. Catatan
  const catatan = cleaned;

  return {
    jenis,
    nominal,
    kategori,
    wallet_asal: walletAsal,
    wallet_tujuan: walletTujuan,
    catatan,
  };
}

/**
 * Format balasan bot untuk Transaksi Pengeluaran
 */
export function formatExpenseBotReply(
  tx: Transaction,
  remainingBalance: number,
  budget: { capAmount: number; spentAmount: number; remainingAmount: number; percentage: number }
): string {
  const { day, dateStr, timeStr } = formatWIBTime(new Date(tx.txTimestamp));
  const progressBar = renderProgressBar(budget.percentage);

  let motivationalMsg = "💡 Kecepatan burn-rate terkendali dengan sangat baik. Pertahankan disiplin kas kamu!";
  if (budget.percentage >= 100) {
    motivationalMsg = "⚠️ PERINGATAN KRITIS: Budget kategori ini telah terlampaui (100%+)! Tinjau kembali alokasi pengeluaran non-esensial.";
  } else if (budget.percentage >= 80) {
    motivationalMsg = "⚡ AMBANG PERINGATAN: Pemakaian budget telah menyentuh 80%. Kurangi pengeluaran impulsif s/d akhir bulan.";
  }

  return `📅 ${day}, ${dateStr} — ${timeStr}
💸 Pengeluaran Tercatat!
├ Nominal  : ${formatRupiah(tx.amount)}
├ Kategori : ${tx.categoryEmoji} ${tx.categoryName}
├ Dompet   : 👛 ${tx.walletName}
├ Catatan  : ${tx.note || "-"}
└ Saldo    : ${formatRupiah(remainingBalance)}

📊 Status Budget ${tx.categoryName} Bulan Ini:
${progressBar} — Sisa ${formatRupiah(budget.remainingAmount)}
${motivationalMsg}`;
}

/**
 * Format balasan bot untuk Transaksi Pemasukan
 */
export function formatIncomeBotReply(tx: Transaction, newBalance: number): string {
  const { day, dateStr, timeStr } = formatWIBTime(new Date(tx.txTimestamp));

  return `📅 ${day}, ${dateStr} — ${timeStr}
💰 Pemasukan Tercatat!
├ Nominal    : ${formatRupiah(tx.amount)}
├ Kategori   : ${tx.categoryEmoji} ${tx.categoryName}
├ Dompet     : 👛 ${tx.walletName}
└ Saldo Baru : ${formatRupiah(newBalance)}

✨ Alokasikan sebagian ke instrumen investasi atau tabungan darurat kamu hari ini.`;
}

/**
 * Format balasan bot untuk Transaksi Transfer Antar Dompet
 */
export function formatTransferBotReply(tx: Transaction, originBalance: number, targetBalance: number): string {
  const { day, dateStr, timeStr } = formatWIBTime(new Date(tx.txTimestamp));

  return `📅 ${day}, ${dateStr} — ${timeStr}
🔄 Mutasi Saldo Berhasil!
├ Nominal    : ${formatRupiah(tx.amount)}
├ Dari       : 👛 ${tx.walletName} (Sisa: ${formatRupiah(originBalance)})
├ Tujuan     : 📥 ${tx.toWalletName || "Dompet Tujuan"} (Saldo: ${formatRupiah(targetBalance)})
├ Biaya Adm  : ${formatRupiah(tx.adminFee || 0)}
└ Catatan    : ${tx.note || "-"}`;
}

/**
 * Eksekusi Perintah Terpadu Telegram
 */
export async function handleBotCommand(command: string): Promise<string> {
  const { db } = await import("./db");
  const cmd = command.trim().toLowerCase().split(" ")[0];
  const { day, dateStr, timeStr } = formatWIBTime();
  const profile = await db.getProfile();
  const greetingName = profile?.fullName || "Lily Latifah";

  if (cmd === "/start") {
    return `🏛️ SELAMAT DATANG DI TATADANA PRIME
Executive Personal Wealth & Cashflow OS

Halo ${greetingName}! Bot resmi TataDana (@lilybhotom_bot) siap mencatat & memantau keuangan eksekutif Anda.

🚀 CARA CEPAT MENCATAT:
Kirimkan pesan natural kapan saja:
• "kopi senopati 45rb pake bca"
• "makan siang seafood 250k tunai"
• "gaji dividen 25jt masuk mandiri"
• "transfer 5jt dari bca ke bibit"
• Atau kirim Voice Note / Foto Struk Belanja 🧾

⚡ DAFTAR PERINTAH EKSEKUTIF:
/saldo — Ringkasan saldo & Net Worth
/hari_ini — Rekap transaksi 24 jam terakhir
/minggu_ini — Analisis arus kas 7 hari
/bulan_ini — Laporan eksekutif bulan berjalan
/budget — Status kuota anggaran kategori
/bantuan — Panduan lengkap fitur`;
  }

  if (cmd === "/saldo") {
    const wallets = await db.getWallets();
    const totalNetWorth = wallets.reduce((sum, w) => sum + w.balance, 0);

    const walletLines = wallets
      .map((w) => `├ ${w.isDefault ? "⭐ " : ""}${w.name}: ${formatRupiah(w.balance)}`)
      .join("\n");

    return `🏛️ RINGKASAN SALDO & NET WORTH
📅 ${day}, ${dateStr} — ${timeStr}

${walletLines}
└──────────────────────────
💎 TOTAL NET WORTH: ${formatRupiah(totalNetWorth)}`;
  }

  if (cmd === "/hari_ini") {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const txs = await db.getTransactions({ startDate: startOfDay });

    const totalExpense = txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const totalIncome = txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);

    return `📊 REKAPITULASI HARI INI
📅 ${day}, ${dateStr}
──────────────────────────
🟢 Total Masuk  : ${formatRupiah(totalIncome)}
🔴 Total Keluar : ${formatRupiah(totalExpense)}
📌 Jumlah Transaksi: ${txs.length} transaksi

${txs.slice(0, 5).map((t) => `• [${t.type === "expense" ? "KELUAR" : "MASUK"}] ${t.categoryEmoji} ${formatRupiah(t.amount)} — ${t.note}`).join("\n") || "Belum ada transaksi hari ini."}`;
  }

  if (cmd === "/minggu_ini") {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const txs = await db.getTransactions({ startDate: weekAgo });

    const totalExpense = txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const totalIncome = txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const netFlow = totalIncome - totalExpense;

    return `📈 ANALISIS 7 HARI TERAKHIR
──────────────────────────
🟢 Total Inflow   : ${formatRupiah(totalIncome)}
🔴 Total Outflow  : ${formatRupiah(totalExpense)}
⚖️ Net Cashflow   : ${formatRupiah(netFlow)} (${netFlow >= 0 ? "Surplus" : "Defisit"})
📌 Total Catatan  : ${txs.length} transaksi tercatat`;
  }

  if (cmd === "/bulan_ini") {
    const currentMonth = "2026-10";
    const txs = await db.getTransactions({ startDate: `${currentMonth}-01` });
    const budgets = await db.getBudgets(currentMonth);

    const totalExpense = txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const totalIncome = txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);

    return `🎯 EXECUTIVE SUMMARY OKTOBER 2026
──────────────────────────
💰 Total Inflow  : ${formatRupiah(totalIncome)}
💸 Total Outflow : ${formatRupiah(totalExpense)}
💼 Rasio Simpanan: ${totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0}%

Kategori Terbesar:
${budgets.slice(0, 4).map((b) => `• ${b.categoryEmoji} ${b.categoryName}: ${formatRupiah(b.spentAmount)} (${b.percentage}%)`).join("\n")}`;
  }

  if (cmd === "/budget") {
    const budgets = await db.getBudgets();
    const budgetCards = budgets
      .map(
        (b) =>
          `📌 ${b.categoryEmoji} ${b.categoryName}
${renderProgressBar(b.percentage)}
Terpakai: ${formatRupiah(b.spentAmount)} / ${formatRupiah(b.capAmount)} (Sisa: ${formatRupiah(b.remainingAmount)})`
      )
      .join("\n\n");

    return `🎯 KARTU KONTROL ANGGARAN BULAN INI\n\n${budgetCards}`;
  }

  if (cmd === "/bantuan") {
    return `ℹ️ PANDUAN PENGGUNAAN TATADANA PRIME
──────────────────────────
Anda dapat mencatat transaksi semudah mengirim pesan teks, voice note, atau foto struk belanja:

1. 💬 Teks Natural (Mendukung Slang Indonesia):
   • "makan siang 35k pake bca"
   • "bensin shell 500rb pake gopay"
   • "gaji direktur 65jt masuk bca"
   • "transfer 15jt dari bca ke bibit fee 2500"
   • "kopi senopati ceban tunai"

2. 🎙️ Voice Note:
   Kirim rekaman suara s/d 60 detik. Bot akan mentranskripsi suara Anda dan mencatatnya otomatis.

3. 🧾 Foto Struk Belanja:
   Kirim foto struk restoran, supermarket, atau cafe. Vision AI akan mendeteksi rincian barang, pajak, dan total pembayaran.

4. ⚡ Perintah Terpadu:
   /saldo — Cek rincian saldo & net worth
   /hari_ini — Rekap transaksi 24 jam
   /minggu_ini — Analisis arus kas 7 hari
   /bulan_ini — Laporan performa bulan berjalan
   /budget — Status kuota anggaran kategori
   /bantuan — Menampilkan pesan ini`;
  }

  return `Perintah '${command}' tidak dikenali. Ketik /bantuan untuk melihat daftar perintah yang tersedia.`;
}

/**
 * Mengirim pesan balasan ke chat Telegram via Telegram Bot API
 */
export async function sendTelegramMessage(
  chatId: number | string,
  text: string,
  token?: string
): Promise<{ ok: boolean; description?: string }> {
  const botToken = token || process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    console.warn("[Telegram] TELEGRAM_BOT_TOKEN belum dikonfigurasi.");
    return { ok: false, description: "Token bot belum diset" };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      console.error("[Telegram API Error]:", data);
    }
    return { ok: data.ok, description: data.description };
  } catch (error: any) {
    console.error("[Telegram Network Error]:", error);
    return { ok: false, description: error.message };
  }
}
