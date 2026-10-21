/**
 * TataDana Prime - Telegram Webhook Connector Script
 * Penggunaan:
 *   node scripts/set-webhook.js <URL_NGROK_HTTPS>
 * Contoh:
 *   node scripts/set-webhook.js https://abc-123.ngrok-free.app
 * 
 * Atau tanpa argumen untuk mengecek status webhook saat ini:
 *   node scripts/set-webhook.js
 */

const fs = require("fs");
const path = require("path");

// Load .env.local jika ada
const envPath = path.resolve(__dirname, "../.env.local");
let token = process.env.TELEGRAM_BOT_TOKEN;

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("TELEGRAM_BOT_TOKEN=")) {
      token = trimmed.split("=")[1]?.trim();
    }
  }
}

if (!token) {
  console.error("❌ Error: TELEGRAM_BOT_TOKEN tidak ditemukan di .env.local atau environment variable.");
  process.exit(1);
}

const inputUrl = process.argv[2];

async function run() {
  if (!inputUrl) {
    // Mode pengecekan status webhook saat ini
    console.log("🔍 Mengecek status webhook Telegram saat ini...");
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
      const data = await res.json();
      console.log("────────────────────────────────────────────");
      console.log("Status Webhook Telegram:");
      console.log(JSON.stringify(data, null, 2));
      console.log("────────────────────────────────────────────");
      if (data.result?.url) {
        console.log(`✅ Webhook aktif ke: ${data.result.url}`);
      } else {
        console.log("ℹ️ Belum ada webhook terdaftar. Jalankan:");
        console.log("   node scripts/set-webhook.js https://<DOMAIN_NGROK>");
      }
    } catch (err) {
      console.error("Gagal memeriksa status webhook:", err.message);
    }
    return;
  }

  let finalUrl = inputUrl.trim();
  if (!finalUrl.startsWith("https://")) {
    console.error("❌ Error: Telegram mensyaratkan protokol HTTPS! (contoh: https://abc-123.ngrok-free.app)");
    process.exit(1);
  }

  if (!finalUrl.endsWith("/api/telegram/webhook")) {
    finalUrl = `${finalUrl.replace(/\/+$/, "")}/api/telegram/webhook`;
  }

  console.log(`🚀 Mendaftarkan webhook ke Telegram API...`);
  console.log(`📌 Target Webhook: ${finalUrl}`);

  try {
    const setRes = await fetch(
      `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(finalUrl)}&drop_pending_updates=false`
    );
    const result = await setRes.json();

    if (result.ok) {
      console.log("────────────────────────────────────────────");
      console.log("🎉 SUKSES! Webhook Telegram Berhasil Dipasang!");
      console.log(`Bot Telegram Anda (@lilybhotom_bot) sekarang terhubung langsung ke:`);
      console.log(`➡️  ${finalUrl}`);
      console.log("────────────────────────────────────────────");
      console.log("Silakan buka aplikasi Telegram dan kirim pesan:");
      console.log("  • /start");
      console.log("  • /saldo");
      console.log("  • makan siang 35k pake bca");
    } else {
      console.error("❌ Gagal mendaftarkan webhook:", result.description);
    }
  } catch (err) {
    console.error("❌ Terjadi kesalahan jaringan:", err.message);
  }
}

run();
