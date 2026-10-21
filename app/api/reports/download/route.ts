import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateExcelReport, generateVercelCodePdfReport } from "@/lib/reports";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");
    const fileName = searchParams.get("file") || "TataDana_Report.xlsx";

    if (!token) {
      return NextResponse.json({ error: "Missing signed access token" }, { status: 401 });
    }

    // Decode token and verify 60m expiry
    try {
      const decoded = Buffer.from(token, "base64url").toString("utf-8");
      const [tokenFile, expiresAtStr] = decoded.split(":");
      const expiresAt = parseInt(expiresAtStr, 10);
      if (Date.now() > expiresAt) {
        return NextResponse.json(
          { error: "Signed URL has expired. Silakan buat tautan unduh baru." },
          { status: 410 }
        );
      }
    } catch {
      return NextResponse.json({ error: "Invalid signed token" }, { status: 403 });
    }

    const transactions = await db.getTransactions();
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

    if (fileName.endsWith(".xlsx")) {
      const buffer = generateExcelReport(transactions, wallets, categories, summary);
      return new NextResponse(buffer as any, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
      });
    }

    if (fileName.endsWith(".pdf") || fileName.includes("Vercel") || fileName.includes("TataDana")) {
      const pdfBuffer = generateVercelCodePdfReport(transactions, wallets, categories, summary);
      return new NextResponse(pdfBuffer as any, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
      });
    }

    // Plain text / CSV fallback
    const content = `TATADANA PRIME — OFFICIAL BANK STATEMENT\nPeriode: Oktober 2026\nNet Worth: Rp ${totalNetWorth}\nInflow: Rp ${totalIncome}\nOutflow: Rp ${totalExpense}\nDelta: Rp ${netDelta}`;
    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}.txt"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
