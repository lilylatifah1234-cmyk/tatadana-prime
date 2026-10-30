import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Store in-memory OTP codes mapped by email / phone
const activeOtpStore = new Map<string, { code: string; expiresAt: number }>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawIdentifier = (body.identifier || "").toString().trim();
    let rawEmail = (body.email || "").toString().trim().toLowerCase();
    let rawPhone = (body.phone || body.phoneWhatsapp || "").toString().trim();

    if (!rawEmail && rawIdentifier.includes("@")) {
      rawEmail = rawIdentifier.toLowerCase();
    }
    if (!rawPhone && (rawIdentifier.startsWith("08") || rawIdentifier.startsWith("+62") || rawIdentifier.startsWith("62") || /^\d+$/.test(rawIdentifier))) {
      rawPhone = rawIdentifier;
    }

    const identifier = rawEmail || rawPhone || rawIdentifier;

    if (!identifier) {
      return NextResponse.json(
        { ok: false, error: "Alamat email atau nomor telepon wajib diisi." },
        { status: 400 }
      );
    }

    // Kode OTP demo default adalah 123456 agar mudah digunakan
    const otpCode = "123456";
    const expiresAt = Date.now() + 15 * 60 * 1000; // berlaku 15 menit

    activeOtpStore.set(identifier, { code: otpCode, expiresAt });
    if (rawEmail) activeOtpStore.set(rawEmail, { code: otpCode, expiresAt });
    if (rawPhone) activeOtpStore.set(rawPhone, { code: otpCode, expiresAt });

    // Tentukan sandi yang cocok dengan email agar pengguna mudah masuk
    let matchedPassword = "user123#";
    if (identifier.includes("lilylatifah") || identifier.includes("082116696646")) {
      matchedPassword = "lily1234#";
    } else if (rawEmail.includes("@")) {
      matchedPassword = `${rawEmail.split("@")[0]}123#`;
    }

    // Jika pengguna baru belum terdaftar, daftarkan otomatis
    const users = await db.getRegisteredUsers();
    let user = users.find((u) => u.email.toLowerCase() === rawEmail || (rawPhone && u.phoneWhatsapp === rawPhone));

    if (!user && rawEmail) {
      user = await db.registerUser({
        email: rawEmail,
        fullName: rawEmail.split("@")[0].replace(/[._]/g, " ").toUpperCase(),
        phoneWhatsapp: rawPhone || "",
      });
    }

    return NextResponse.json({
      ok: true,
      otp: otpCode,
      matchedPassword,
      message: `Kode OTP (${otpCode}) telah dikirimkan ke akun ${rawEmail || rawPhone}. Sandi akun yang cocok: ${matchedPassword}`,
      email: rawEmail,
      phone: rawPhone,
      expiresInMinutes: 15,
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
