import TelegramBot from "node-telegram-bot-api";

const token = process.env.TELEGRAM_BOT_TOKEN;
const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

let bot: TelegramBot | null = null;

if (token) {
  bot = new TelegramBot(token);
  console.log("✅ Telegram bot initialized");
} else {
  console.warn("⚠️ TELEGRAM_BOT_TOKEN not set — notifications disabled");
}

interface OrderNotification {
  orderId?: string;
  packName: string;
  email: string;
  username: string;
  price: string;
  paymentMethod: string;
  paymentScreenshot?: string | null;
}

export async function sendOrderNotification(order: OrderNotification): Promise<void> {
  if (!bot || !adminChatId) {
    console.warn("Telegram bot or admin chat ID not configured — skipping notification");
    return;
  }

  const caption = [
    `🔔 <b>New Order Received!</b>`,
    ``,
    ...(order.orderId ? [`🆔 <b>Order ID:</b> ${order.orderId}`] : []),
    `📦 <b>Pack:</b> ${order.packName}`,
    `📧 <b>Email:</b> ${order.email}`,
    `👤 <b>User:</b> ${order.username}`,
    `💰 <b>Price:</b> ${order.price} KS`,
    `💳 <b>Payment:</b> ${order.paymentMethod}`,
  ].join("\n");

  try {
    if (order.paymentScreenshot) {
      // Extract the raw base64 data from the data URI (strip "data:image/...;base64,")
      const base64Match = order.paymentScreenshot.match(/^data:[^;]+;base64,(.+)$/);
      if (base64Match) {
        const imageBuffer = Buffer.from(base64Match[1], "base64");
        await bot.sendPhoto(adminChatId, imageBuffer, {
          caption,
          parse_mode: "HTML",
        });
        console.log(`📨 Telegram photo notification sent for order ${order.orderId ?? "N/A"}`);
        return;
      }
    }

    // Fallback: no screenshot — send text only
    await bot.sendMessage(adminChatId, caption, { parse_mode: "HTML" });
    console.log(`📨 Telegram text notification sent for order ${order.orderId ?? "N/A"}`);
  } catch (err) {
    console.error("Failed to send Telegram notification:", err);
  }
}
