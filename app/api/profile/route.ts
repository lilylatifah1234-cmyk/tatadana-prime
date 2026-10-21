import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [profile, subscription] = await Promise.all([
      db.getProfile(),
      db.getSubscription(),
    ]);
    return NextResponse.json({ ok: true, data: profile, subscription });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = await db.updateProfile(body);
    return NextResponse.json({ ok: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  return PUT(req);
}
