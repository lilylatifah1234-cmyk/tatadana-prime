import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawEmail = (body.email || "").toString().trim().toLowerCase();
    const rawPhone = (body.phone || body.phoneWhatsapp || "").toString().trim();
    const rawPassword = (body.password || "").toString().trim();

    // 1. Validasi input wajib
    if (!rawEmail && !rawPhone) {
      return NextResponse.json(
        { ok: false, error: "Alamat email atau nomor WhatsApp wajib diisi." },
        { status: 400 }
      );
    }

    if (!rawPassword) {
      return NextResponse.json(
        { ok: false, error: "Kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    // 2. Autentikasi Owner / Superadmin (Lily Latifah)
    if (
      rawEmail === "lilylatifah1234@gmail.com" ||
      rawPhone === "082116696646" ||
      rawEmail.includes("lilylatifah")
    ) {
      // Validasi kata sandi khusus admin
      if (rawPassword !== "lily1234#") {
        return NextResponse.json(
          { ok: false, error: "Kata sandi yang Anda masukkan salah. Silakan periksa kembali." },
          { status: 401 }
        );
      }

      const ownerName = "Lily Latifah";
      const ownerPhone = "082116696646";
      const currentProfile = await db.getProfile();

      const updatedProfile = await db.updateProfile({
        id: "usr-lily-001",
        fullName: ownerName,
        email: "lilylatifah1234@gmail.com",
        phoneWhatsapp: ownerPhone,
        role: "superadmin",
        approvalStatus: "approved",
        avatarUrl:
          currentProfile.email === "lilylatifah1234@gmail.com" && currentProfile.avatarUrl
            ? currentProfile.avatarUrl
            : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
      });

      const upgradedSub = await db.upgradeSubscription("pro");

      await db.addAdminLog({
        adminId: "adm-root-001",
        adminName: `Owner ${ownerName}`,
        targetUserId: updatedProfile.id,
        targetUserName: updatedProfile.fullName,
        action: "SUPERADMIN_LOGIN_PRO_VIP",
        reason: `Autentikasi Owner ${ownerName} berhasil dengan paket PRO VIP`,
        ipAddress: "127.0.0.1",
      });

      return NextResponse.json({
        ok: true,
        message: `Login berhasil sebagai Owner (${ownerName})! Paket PRO VIP aktif.`,
        profile: updatedProfile,
        subscription: upgradedSub,
      });
    }

    // 3. Autentikasi Pengguna Reguler (Wajib Terdaftar Terlebih Dahulu)
    const users = await db.getRegisteredUsers();
    const targetUser = users.find(
      (u) =>
        (rawEmail && u.email.toLowerCase() === rawEmail) ||
        (rawPhone && u.phoneWhatsapp && u.phoneWhatsapp === rawPhone)
    );

    // Jika belum terdaftar -> tolak dan instruksikan daftar akun baru
    if (!targetUser) {
      return NextResponse.json(
        {
          ok: false,
          notRegistered: true,
          error: `Alamat email "${rawEmail || rawPhone}" belum terdaftar di sistem TataDana. Silakan daftar akun baru terlebih dahulu dengan menggunakan nomor token resmi (47893).`,
        },
        { status: 404 }
      );
    }

    // 4. Cek kecocokan kata sandi
    let passwordMatches = false;
    if (targetUser.password) {
      passwordMatches = rawPassword === targetUser.password;
    } else {
      // Default password fallback untuk akun seed demo
      const prefix = targetUser.email.split("@")[0].toLowerCase();
      passwordMatches =
        rawPassword === "user123#" ||
        rawPassword === "47893" ||
        rawPassword.toLowerCase() === `${prefix}123#`;
    }

    if (!passwordMatches) {
      return NextResponse.json(
        { ok: false, error: "Kata sandi yang Anda masukkan salah. Silakan periksa kembali." },
        { status: 401 }
      );
    }

    // 5. Cek Status Persetujuan Akun
    if (targetUser.approvalStatus === "pending") {
      return NextResponse.json(
        {
          ok: false,
          pendingApproval: true,
          email: targetUser.email,
          name: targetUser.fullName,
          message:
            "Akun Anda sedang dalam antrean aktivasi oleh Superadmin (Pending Approval). Mohon hubungi admin untuk aktivasi sebelum masuk ke Dashboard.",
        },
        { status: 403 }
      );
    }

    if (targetUser.approvalStatus === "rejected") {
      return NextResponse.json(
        {
          ok: false,
          error: `Pendaftaran akun Anda ditolak oleh Superadmin.${
            targetUser.rejectionReason ? ` Alasan: ${targetUser.rejectionReason}` : ""
          }`,
        },
        { status: 403 }
      );
    }

    // 6. Akun Approved -> Izinkan Masuk ke Dashboard
    const activeProfile = await db.switchActiveUser(targetUser.id);

    return NextResponse.json({
      ok: true,
      message: `Login berhasil sebagai ${targetUser.fullName}.`,
      profile: activeProfile,
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
