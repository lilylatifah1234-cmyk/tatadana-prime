import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Inisialisasi Snap Token untuk Checkout Langganan
    if (body.action === "create_snap") {
      const { planType, billingCycle } = body;
      const user = await db.getProfile();

      let grossAmount = 249000; // Pro monthly default
      if (planType === "starter") {
        grossAmount = billingCycle === "yearly" ? 990000 : 99000;
      } else if (planType === "pro") {
        grossAmount = billingCycle === "yearly" ? 2490000 : 249000;
      } else if (planType === "lifetime") {
        grossAmount = 1499000;
      }

      const orderId = `TATA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const snapToken = `SNAP-MOCK-${orderId}`;

      const order = await db.createPaymentOrder({
        userId: user.id,
        userName: user.fullName,
        orderId,
        grossAmount,
        planType,
        paymentMethod: "midtrans_snap",
        snapToken,
        paymentStatus: "pending",
      });

      return NextResponse.json({
        ok: true,
        snapToken,
        orderId,
        grossAmount,
        clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "SB-Mid-client-sandbox-key",
      });
    }

    // 2. Webhook Ingress dari Midtrans Notifications
    if (body.order_id && body.transaction_status) {
      const { order_id, transaction_status } = body;
      let status: "pending" | "settlement" | "expire" | "cancel" = "pending";

      if (transaction_status === "capture" || transaction_status === "settlement") {
        status = "settlement";
      } else if (transaction_status === "pending") {
        status = "pending";
      } else if (transaction_status === "deny" || transaction_status === "cancel") {
        status = "cancel";
      } else if (transaction_status === "expire") {
        status = "expire";
      }

      await db.updatePaymentOrderStatus(order_id, status);

      return NextResponse.json({ ok: true, message: "Notification handled" });
    }

    return NextResponse.json({ ok: false, message: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
