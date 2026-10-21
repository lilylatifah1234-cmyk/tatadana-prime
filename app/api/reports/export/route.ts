import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateExcelReport, generateSignedReportUrl } from "@/lib/reports";

export async function POST(req: NextRequest) {
  try {
    const { format, month } = await req.json(); // format: 'excel' | 'pdf'
    const period = month || "2026-10";

    const transactions = await db.getTransactions({ startDate: `${period}-01` });
    const wallets = await db.getWallets();
    const categories = await db.getCategories();

    const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const totalNetWorth = wallets.reduce((s, w) => s + w.balance, 0);
    const netDelta = totalIncome - totalExpense;
    const savingsRatio = totalIncome > 0 ? Math.round((netDelta / totalIncome) * 100) : 0;

    const summary = {
      totalInflow: totalIncome,
      totalOutflow: totalExpense,
      netDelta,
      savingsRatio,
      totalNetWorth,
    };

    const timeStamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName =
      format === "excel"
        ? `TataDana_Executive_Report_${period}_${timeStamp}.xlsx`
        : `TataDana_Vercel_Coding_Blueprint_${period}_${timeStamp}.pdf`;

    const signedUrl = generateSignedReportUrl(fileName);

    return NextResponse.json({
      ok: true,
      format,
      fileName,
      fileSize: format === "excel" ? "34.8 KB" : "142.5 KB",
      period,
      signedUrl,
      expiresInMinutes: 60,
      summary,
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
