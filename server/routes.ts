import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { z } from "zod";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024 },
});

async function sendTelegramNotification(
  body: Record<string, string>,
  file?: Express.Multer.File
) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("Telegram env vars not set — skipping notification");
    return;
  }

  const lines = [
    `🚨 <b>NEW ORDER: ${body.orderId || "N/A"}</b>`,
    "",
    `📦 <b>Product:</b> ${[body.productName, body.planName].filter(Boolean).join(" ")}`,
    `💰 <b>Price:</b> ${body.price || "—"}`,
    `📱 <b>Contact:</b> ${body.contactPlatform || "—"} → @${body.contactUsername || "—"}`,
    `💳 <b>Payment:</b> ${body.paymentMethod || "—"}`,
  ];

  if (body.mlbbUserId) {
    lines.push(`🎮 <b>MLBB User ID:</b> ${body.mlbbUserId}`);
    lines.push(`🌐 <b>MLBB Server ID:</b> ${body.mlbbServerId || "—"}`);
  }

  const caption = lines.join("\n");

  if (file) {
    const blob = new Blob([file.buffer], { type: file.mimetype || "image/jpeg" });
    const form = new FormData();
    form.append("chat_id", chatId);
    form.append("photo", blob, file.originalname || "payment_screenshot.jpg");
    form.append("caption", caption);
    form.append("parse_mode", "HTML");

    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendPhoto`,
      { method: "POST", body: form }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Telegram sendPhoto failed: ${err}`);
    }
  } else {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: caption, parse_mode: "HTML" }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Telegram sendMessage failed: ${err}`);
    }
  }
}

const checkoutBodySchema = z.object({
  orderId: z.string().optional(),
  productName: z.string().min(1),
  planName: z.string().min(1),
  price: z.string().min(1),
  contactPlatform: z.string().min(1),
  contactUsername: z.string().min(1),
  paymentMethod: z.string().min(1),
  mlbbUserId: z.string().optional(),
  mlbbServerId: z.string().optional(),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/checkout", upload.single("paymentScreenshot"), async (req, res) => {
    try {
      const parsed = checkoutBodySchema.parse(req.body);

      const order = await storage.createOrder({
        orderId: parsed.orderId ?? null,
        productName: parsed.productName,
        planName: parsed.planName,
        price: parsed.price,
        contactPlatform: parsed.contactPlatform,
        contactUsername: parsed.contactUsername,
        paymentMethod: parsed.paymentMethod,
        paymentScreenshot: null,
      });

      try {
        await sendTelegramNotification(req.body as Record<string, string>, req.file);
      } catch (telegramErr) {
        console.error("Telegram notification failed (order still saved):", telegramErr);
      }

      res.json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: err.errors });
      }
      console.error("Error creating order:", err);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const order = await storage.createOrder(req.body);
      res.json(order);
    } catch (err) {
      console.error("Error creating order:", err);
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      const allOrders = await storage.getOrders();
      res.json(allOrders);
    } catch (err) {
      console.error("Error fetching orders:", err);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.patch("/api/orders/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!["pending", "confirmed", "cancelled"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      const order = await storage.updateOrderStatus(id, status);
      if (!order) return res.status(404).json({ error: "Order not found" });
      res.json(order);
    } catch (err) {
      console.error("Error updating order:", err);
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  return httpServer;
}
