import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawEmail = (body.email || "").toString().trim().toLowerCase();
    const rawPassword = (body.password || "").toString().trim();
    const rawPhone = (body.phone || body.phoneWhatsapp || "").toString().trim();
    const rawName = (body.fullName || body.name || "").toString().trim();
    const rawToken = (body.token || body.registrationToken || "").toString().trim();

    // 1. Validasi input wajib
    if (!rawEmail) {
      return NextResponse.json(
        { ok: false, error: "Alamat email wajib diisi untuk pendaftaran." },
        { status: 400 }
      );
    }
    if (!rawPassword) {
      return NextResponse.json(
        { ok: false, error: "Kata sandi wajib diisi." },
        { status: 400 }
      );
    }
    if (!rawPhone) {
      return NextResponse.json(
        { ok: false, error: "Nomor WhatsApp / HP wajib diisi." },
        { status: 400 }
      );
    }

    // 2. Validasi Token Registrasi Resmi: 47893
    const REQUIRED_TOKEN = "47893";
    if (rawToken !== REQUIRED_TOKEN) {
      return NextResponse.json(
        {
          ok: false,
          error: `Nomor token tidak valid (${rawToken || "kosong"}). Silakan masukkan nomor token resmi pendaftaran: ${REQUIRED_TOKEN}.`,
        },
        { status: 400 }
      );
    }

    // 3. Cek apakah email sudah terdaftar sebelumnya
    const users = await db.getRegisteredUsers();
    const existing = users.find((u) => u.email.toLowerCase() === rawEmail);
    if (existing) {
      return NextResponse.json(
        {
          ok: false,
          alreadyRegistered: true,
          error: `Alamat email ${rawEmail} sudah terdaftar. Silakan langsung masuk dengan email dan kata sandi Anda.`,
        },
        { status: 400 }
      );
    }

    // 4. Daftarkan akun baru
    const fullName = rawName || rawEmail.split("@")[0].replace(/[._]/g, " ").toUpperCase();
    const newUser = await db.registerUser({
      fullName,
      email: rawEmail,
      password: rawPassword,
      phoneWhatsapp: rawPhone,
      registrationToken: REQUIRED_TOKEN,
      approvalStatus: "pending",
    });

    return NextResponse.json({
      ok: true,
      message: `Pendaftaran berhasil untuk ${fullName} dengan nomor token ${REQUIRED_TOKEN}! Akun Anda dalam antrean persetujuan aktivasi admin.`,
      user: newUser,
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
