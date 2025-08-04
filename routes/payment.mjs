import express from "express";
import axios from "axios";
import Order from "../models/order.mjs";

const router = express.Router();

// Initialize transaction (card or bank)
router.post("/initialize", async (req, res) => {
  const { email, amount, method, orderDetails } = req.body;

  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100, // Paystack expects amount in kobo
        channels: method === "bank" ? ["bank_transfer"] : ["card"],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const newOrder = new Order({
      ...orderDetails,
      referenceId: response.data.data.reference,
    });
    await newOrder.save();

    res.json({ success: true, data: response.data.data });
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
    const order = await Order.findOneAndUpdate(
      { referenceId: reference },
      { isPaid: true }
    );
    console.log(response.data);
    if (!order)
      res.status(404).json({ success: false, message: "Order not found" });

    // console.log(order);
    res.json({
      success: true,
      data: { orderId: order.orderNumber, fullName: order.shipping.fullName },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: "Verification failed" });
  }
});

export default router;
