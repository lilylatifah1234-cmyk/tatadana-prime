import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || undefined;
    const categoryId = searchParams.get("categoryId") || undefined;
    const walletId = searchParams.get("walletId") || undefined;
    const search = searchParams.get("search") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const txs = await db.getTransactions({
      type,
      categoryId,
      walletId,
      search,
      startDate,
      endDate,
    });

    return NextResponse.json({ ok: true, data: txs });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newTx = await db.createTransaction(body);
    return NextResponse.json({ ok: true, data: newTx });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, message: "ID transaksi wajib diisi" }, { status: 400 });

    const success = await db.deleteTransaction(id);
    return NextResponse.json({ ok: success });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
