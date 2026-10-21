import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const wallets = await db.getWallets();
    return NextResponse.json({ ok: true, data: wallets });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Jika tipe transfer antar dompet
    if (body.action === "transfer") {
      const { fromWalletId, toWalletId, amount, adminFee, note } = body;
      const wallets = await db.getWallets();
      const origin = wallets.find((w) => w.id === fromWalletId);
      const target = wallets.find((w) => w.id === toWalletId);

      if (!origin || !target) {
        return NextResponse.json({ ok: false, message: "Dompet tidak ditemukan" }, { status: 400 });
      }

      if (origin.balance < amount + (adminFee || 0)) {
        return NextResponse.json({ ok: false, message: "Saldo dompet asal tidak mencukupi" }, { status: 400 });
      }

      const categories = await db.getCategories();
      const transferCat = categories[0];

      const tx = await db.createTransaction({
        walletId: origin.id,
        walletName: origin.name,
        categoryId: transferCat.id,
        categoryName: transferCat.name,
        categoryEmoji: "🔄",
        categoryColor: "#6366F1",
        type: "transfer",
        amount,
        toWalletId: target.id,
        toWalletName: target.name,
        adminFee: adminFee || 0,
        note: note || `Transfer dari ${origin.name} ke ${target.name}`,
        source: "web_manual",
      });

      return NextResponse.json({ ok: true, data: tx });
    }

    // Normal create wallet
    const newWallet = await db.createWallet(body);
    return NextResponse.json({ ok: true, data: newWallet });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    const updated = await db.updateWallet(id, updates);
    return NextResponse.json({ ok: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, message: "ID wallet wajib diisi" }, { status: 400 });

    const success = await db.deleteWallet(id);
    return NextResponse.json({ ok: success });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
