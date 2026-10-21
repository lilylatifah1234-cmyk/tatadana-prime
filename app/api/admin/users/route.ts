import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const users = await db.getRegisteredUsers();
    const activeProfile = await db.getProfile();

    const pendingCount = users.filter((u) => u.approvalStatus === "pending").length;
    const approvedCount = users.filter((u) => u.approvalStatus === "approved").length;
    const rejectedCount = users.filter((u) => u.approvalStatus === "rejected").length;

    return NextResponse.json({
      ok: true,
      users,
      activeProfile,
      summary: {
        total: users.length,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, action, reason } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { ok: false, error: "Parameter userId dan action diperlukan." },
        { status: 400 }
      );
    }

    if (action === "approve") {
      const updated = await db.updateUserApproval(userId, "approved", reason);
      return NextResponse.json({
        ok: true,
        message: `Pendaftaran pengguna ${updated?.fullName} berhasil disetujui (APPROVED)! Akun kini dapat mengakses Dashboard.`,
        user: updated,
      });
    }

    if (action === "reject") {
      const updated = await db.updateUserApproval(
        userId,
        "rejected",
        reason || "Pendaftaran ditolak oleh Superadmin."
      );
      return NextResponse.json({
        ok: true,
        message: `Pendaftaran pengguna ${updated?.fullName} telah ditolak (REJECTED).`,
        user: updated,
      });
    }

    return NextResponse.json(
      { ok: false, error: "Action tidak valid. Gunakan 'approve' atau 'reject'." },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, userId } = body;

    if (action === "switch_session") {
      if (!userId) {
        return NextResponse.json({ ok: false, error: "userId diperlukan." }, { status: 400 });
      }
      const switched = await db.switchActiveUser(userId);
      if (!switched) {
        return NextResponse.json({ ok: false, error: "User tidak ditemukan." }, { status: 404 });
      }

      await db.addAdminLog({
        adminId: "adm-root-001",
        adminName: "Superadmin Lily Latifah",
        targetUserId: switched.id,
        targetUserName: switched.fullName,
        action: "SWITCH_SESSION_PREVIEW",
        reason: `Beralih sesi aktif ke ${switched.fullName} (${switched.role}) untuk pengujian tampilan`,
        ipAddress: "127.0.0.1",
      });

      return NextResponse.json({
        ok: true,
        message: `Sesi aktif dialihkan ke ${switched.fullName} (Role: ${switched.role.toUpperCase()})`,
        profile: switched,
      });
    }

    return NextResponse.json({ ok: false, error: "Aksi tidak dikenali." }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
