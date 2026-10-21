import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const summary = await db.getStoreSummary();
    const fullStore = await db.getFullStore();
    return NextResponse.json({
      ok: true,
      summary,
      fullStore,
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "reset") {
      db.resetToDefaults();
      return NextResponse.json({
        ok: true,
        message: "Database lokal berhasil direset ke pengaturan awal (Lily Latifah PRO VIP).",
      });
    }

    if (action === "update_profile") {
      const { profileUpdates, planType } = body;
      if (profileUpdates) {
        await db.updateProfile(profileUpdates);
      }
      if (planType) {
        await db.upgradeSubscription(planType);
      }
      return NextResponse.json({
        ok: true,
        message: "Data profil dan status langganan berhasil diperbarui di database lokal.",
      });
    }

    if (action === "create_test_mutation") {
      const wallets = await db.getWallets();
      const defaultWallet = wallets.find((w) => w.isDefault) || wallets[0];
      const categories = await db.getCategories();
      const cat = categories[0];

      const newTx = await db.createTransaction({
        walletId: defaultWallet.id,
        walletName: defaultWallet.name,
        categoryId: cat.id,
        categoryName: cat.name,
        categoryEmoji: cat.iconEmoji,
        categoryColor: cat.colorHex,
        type: body.type || "expense",
        amount: body.amount || 250000,
        note: body.note || "Mutasi uji coba live Telegram Webhook via Admin Console",
        source: "telegram_text",
      });

      return NextResponse.json({
        ok: true,
        message: "Mutasi saldo uji coba berhasil dibuat dan tersimpan permanen ke disk!",
        data: newTx,
      });
    }

    if (action === "delete_transaction") {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ ok: false, message: "ID transaksi dibutuhkan" }, { status: 400 });
      }
      const success = await db.deleteTransaction(id);
      return NextResponse.json({
        ok: success,
        message: success ? "Transaksi berhasil dihapus dan saldo dompet di-rollback." : "Transaksi tidak ditemukan.",
      });
    }

    return NextResponse.json({ ok: false, message: "Aksi tidak dikenal" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
