import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") || "2026-10";
    const budgets = await db.getBudgets(month);
    return NextResponse.json({ ok: true, data: budgets });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { categoryId, capAmount, periodMonth } = body;
    await db.updateBudgetCap(categoryId, capAmount, periodMonth);
    return NextResponse.json({ ok: true, message: "Budget cap berhasil diperbarui" });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
}
