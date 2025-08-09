import express from "express";
import axios from "axios";
import Order from "../models/order.mjs";
import { sendEmail } from "../utils/email.mjs";
import { EMAIL_TEMPLATE } from "../constants/index.mjs";
import { formatDate } from "../utils/index.mjs";

const router = express.Router();

// Initialize transaction (card or bank)
router.post("/initialize", async (req, res) => {
  const { email, amount, method, orderDetails } = req.body;

  try {
    if (method === "card") {
      const response = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
          email,
          amount: amount * 100, // Paystack expects amount in kobo
          channels: ["card"],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      delete orderDetails.bankAccount;
      const newOrder = new Order({
        ...orderDetails,
        referenceId: response.data.data.reference,
      });
      await newOrder.save();

      res.json({ success: true, data: response.data.data });
    } else {
      const newOrder = new Order({
        ...orderDetails,
        status: "Pending",
      });
      await newOrder.save();
      res.json({ success: true, data: { orderId: newOrder.orderNumber } });
    }
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ success: false, message: "Payment init failed" });
  }
});

// Verify transaction
router.get("/verify/:reference", async (req, res) => {
  const { reference } = req.params;

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );
    const order = await Order.findOne({ referenceId: reference });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    if (order.isPaid)
      return res
        .status(400)
        .json({ success: false, message: "Order has been paid" });

    order.isPaid = true;
    await order.save();
    const itemsHtml = order.orderItems
      .map(
        (item) => `
  <tr>
    <td>${item.name}</td>
    <td align="center">${item.quantity}</td>
    <td align="right">₦${item.price}</td>
  </tr>
`
      )
      .join("");
    const htmlContent = EMAIL_TEMPLATE.replace(
      "{{customerName}}",
      order.shipping.fullName
    )
      .replace("{{orderId}}", order.orderNumber)
      .replace("{{orderDate}}", formatDate(order.createdAt))
      .replace("{{trackingNumber}}", order.orderNumber)
      .replace("{{shippingAddress}}", order.shipping.address)
      .replace("{{deliveryDate}}", order.shipping.estimatedDelivery)
      .replace("{{city}}", order.shipping.city)
      .replace("{{state}}", order.shipping.state)
      .replace("{{items}}", itemsHtml)
      .replace("{{currentYear}}", new Date().getFullYear().toString());

    await sendEmail({
      to: order.email,
      subject: "Order Confirmation",
      html: htmlContent,
      customerName: order.shipping.fullName,
    });
    res.json({
      success: true,
      data: { orderId: order.orderNumber, fullName: order.shipping.fullName },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: "Verification failed" });
  }
});

export default router;
