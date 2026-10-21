import { NextRequest, NextResponse } from "next/server";
import { getAIGatewayConfig, updateAIGatewayConfig } from "@/lib/ai-engine";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const config = getAIGatewayConfig();
    const logs = await db.getAILogs();

    // Sembunyikan API key penuh demi keamanan enterprise
    const maskedConfig = {
      mode: config.mode,
      dedicatedProvider: config.dedicatedProvider,
      hasGeminiKey: Boolean(config.geminiKey && config.geminiKey.length > 5),
      hasOpenaiKey: Boolean(config.openaiKey && config.openaiKey.length > 5),
      hasDeepseekKey: Boolean(config.deepseekKey && config.deepseekKey.length > 5),
    };

    return NextResponse.json({
      ok: true,
      config: maskedConfig,
      logs,
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = updateAIGatewayConfig(body);

    await db.addAdminLog({
      adminId: "adm-root-001",
      adminName: "Superadmin",
      action: "UPDATE_AI_GATEWAY_CONFIG",
      reason: `Mengubah mode AI Gateway ke ${body.mode || updated.mode}`,
    });

    return NextResponse.json({
      ok: true,
      message: "Konfigurasi AI Gateway berhasil diperbarui",
      mode: updated.mode,
      dedicatedProvider: updated.dedicatedProvider,
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
}
