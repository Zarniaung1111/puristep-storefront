import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { z } from "zod";
import { sendOrderNotification } from "./lib/telegram";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024 },
});

const checkoutBodySchema = z.object({
  orderId: z.string().optional(),
  productName: z.string().min(1),
  planName: z.string().min(1),
  price: z.string().min(1),
  contactPlatform: z.string().min(1),
  contactUsername: z.string().min(1),
  clientEmail: z.string().email().optional(),
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

      // Convert uploaded screenshot to base64 data URI if present
      let screenshotData: string | null = null;
      if (req.file) {
        const base64 = req.file.buffer.toString("base64");
        screenshotData = `data:${req.file.mimetype};base64,${base64}`;
      }

      const order = await storage.createOrder({
        orderId: parsed.orderId ?? null,
        productName: parsed.productName,
        planName: parsed.planName,
        price: parsed.price,
        contactPlatform: parsed.contactPlatform,
        contactUsername: parsed.contactUsername,
        paymentMethod: parsed.paymentMethod,
        paymentScreenshot: screenshotData,
      });

      try {
        await sendOrderNotification({
          orderId: parsed.orderId ?? undefined,
          packName: `${parsed.productName} ${parsed.planName}`,
          email: parsed.clientEmail ?? "—",
          username: parsed.contactUsername,
          price: parsed.price,
          paymentMethod: parsed.paymentMethod,
          paymentScreenshot: screenshotData,
        });
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

      try {
        await sendOrderNotification({
          packName: `${req.body.productName ?? ""} ${req.body.planName ?? ""}`.trim(),
          email: req.body.clientEmail ?? "—",
          username: req.body.contactUsername ?? "—",
          price: req.body.price ?? "—",
          paymentMethod: req.body.paymentMethod ?? "—",
        });
      } catch (telegramErr) {
        console.error("Telegram notification failed (order still saved):", telegramErr);
      }

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
