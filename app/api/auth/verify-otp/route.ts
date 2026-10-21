import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { otp, email } = body;

    const trimmedOtp = (otp || "").toString().trim();

    // Kode verifikasi OTP pengujian demo adalah 123456
    if (trimmedOtp !== "123456") {
      return NextResponse.json(
        {
          ok: false,
          error: "Kode OTP tidak ditemukan atau sudah kedaluwarsa. Silakan minta kode baru.",
        },
        { status: 400 }
      );
    }

    // Cari user yang sedang diverifikasi
    const users = await db.getRegisteredUsers();
    let targetUser = users.find(
      (u) => u.email.toLowerCase() === (email || "").toLowerCase().trim()
    );

    if (!targetUser) {
      // Jika email tidak spesifik, cari user pertama dengan status pending
      targetUser = users.find((u) => u.approvalStatus === "pending") || users[0];
    }

    if (targetUser) {
      // Setujui pendaftaran akun
      await db.updateUserApproval(targetUser.id, "approved", "Verifikasi OTP Mandiri Berhasil (123456)");
      await db.switchActiveUser(targetUser.id);

      return NextResponse.json({
        ok: true,
        message: "Verifikasi OTP berhasil! Akun Anda telah aktif.",
        user: {
          ...targetUser,
          approvalStatus: "approved",
        },
      });
    }

    return NextResponse.json({
      ok: true,
      message: "Verifikasi OTP berhasil! Mengalihkan ke Dashboard...",
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
