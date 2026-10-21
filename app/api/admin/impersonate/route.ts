import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { targetUserId, reason } = await req.json();

    if (!reason || reason.trim().length < 5) {
      return NextResponse.json(
        { ok: false, message: "Alasan audit wajib dicatat minimal 5 karakter untuk kepatuhan regulasi privasi." },
        { status: 400 }
      );
    }

    const profile = await db.getProfile();

    // Catat ke admin audit log
    await db.addAdminLog({
      adminId: "adm-root-001",
      adminName: "Superadmin",
      targetUserId: targetUserId || profile.id,
      targetUserName: profile.fullName,
      action: "USER_IMPERSONATION_ACTIVE",
      reason,
      ipAddress: "127.0.0.1",
    });

    return NextResponse.json({
      ok: true,
      message: `Impersonation mode aktif untuk akun: ${profile.fullName}`,
      targetUser: profile,
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const logs = await db.getAdminLogs();
    return NextResponse.json({ ok: true, data: logs });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
