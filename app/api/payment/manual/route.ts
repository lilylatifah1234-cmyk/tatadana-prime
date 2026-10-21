import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const orders = await db.getPaymentOrders();
    return NextResponse.json({ ok: true, data: orders });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { planType, grossAmount, proofImageUrl } = body;
    const user = await db.getProfile();

    const orderId = `MANUAL-${Date.now()}`;
    const newOrder = await db.createPaymentOrder({
      userId: user.id,
      userName: user.fullName,
      orderId,
      grossAmount,
      planType,
      paymentMethod: "manual_transfer",
      paymentStatus: "pending",
      proofImageUrl: proofImageUrl || "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80",
    });

    return NextResponse.json({
      ok: true,
      data: newOrder,
      message: "Bukti transfer berhasil dikirim. Tim admin akan memverifikasi dalam <15 menit.",
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, action } = body; // action: 'approve' | 'reject'

    const newStatus = action === "approve" ? "settlement" : "rejected";
    const success = await db.updatePaymentOrderStatus(orderId, newStatus);

    if (success) {
      await db.addAdminLog({
        adminId: "adm-root-001",
        adminName: "Superadmin",
        action: action === "approve" ? "APPROVE_MANUAL_PAYMENT" : "REJECT_MANUAL_PAYMENT",
        reason: `Verifikasi manual transfer order ${orderId}`,
      });
    }

    return NextResponse.json({
      ok: success,
      message: action === "approve" ? "Pembayaran disetujui, akun user otomatis diupgrade!" : "Pembayaran ditolak.",
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
}
