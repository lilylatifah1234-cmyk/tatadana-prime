import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email")?.toLowerCase().trim();
    const id = searchParams.get("id");

    const users = await db.getRegisteredUsers();
    let user = users.find(
      (u) =>
        (email && u.email.toLowerCase() === email) ||
        (id && u.id === id)
    );

    if (!user) {
      const activeProfile = await db.getProfile();
      if (
        (email && activeProfile.email.toLowerCase() === email) ||
        (id && activeProfile.id === id)
      ) {
        user = activeProfile;
      }
    }

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Pengguna tidak ditemukan dalam daftar antrean." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      status: user.approvalStatus || "pending",
      user,
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
