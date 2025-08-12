import { EMAIL_TEMPLATE } from "../constants/index.mjs";
import Order from "../models/order.mjs";
import { sendEmail } from "../utils/email.mjs";
import { formatDate } from "../utils/index.mjs";

export const trackOrder = async (req, res) => {
  try {
    const orderNumber = req.query.orderNumber;
    const order = await Order.findOne({ orderNumber });
    if (!order)
      res.status(404).json({
        success: false,
        message: "Not found",
      });

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};
export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      Order.countDocuments(),
    ]);
    res.json({
      success: true,
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Not found",
      });
    }
    if (order.status === "Pending" && req.body.status === "Pending") {
      order.isPaid = true;
      order.status = "Order Placed";
    } else {
      order.status = req.body.status;
      console.log("Order updated");
    }
    await order.save();
    if (req.body.status === "Pending") {
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
      console.log("New order email sent");
    }
    if (req.body.status === "Shipped") {
      const html = `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
      <div style="background-color: #007BFF; color: white; padding: 15px; text-align: center; font-size: 20px;">
        Your Order Has Shipped!
      </div>
      <div style="padding: 20px; color: #333;">
        <p>Hi <strong>${order.shipping.fullName}</strong>,</p>
        <p>We’re excited to let you know that your order <strong>#${order.orderNumber}</strong> has been shipped!</p>
        <p><strong>Tracking Number:</strong> ${order.orderNumber}</p>
        <p>You can track your shipment by clicking the link below:</p>
        <p style="text-align: center;">
          <a href="https://scentsbyjojo.com/tracking?id=${order.orderNumber}" style="background: #007BFF; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Track Your Order</a>
        </p>
        <p>Thank you for shopping with us! We hope you enjoy your purchase.</p>
        <p>Best regards,<br>Scent's By Jojo</p>
      </div>
      <div style="background: #f0f0f0; padding: 10px; text-align: center; font-size: 12px; color: #777;">
        This is an automated message, please do not reply.
      </div>
    </div>
  </div>
  `;
      await sendEmail({
        to: order.email,
        subject: `Your Order ${order.orderNumber} Has Been Shipped 🚚`,
        html,
        customerName: order.shipping.fullName,
      });
      console.log("Order shipped email sent");
    }
    if (req.body.status === "Delivered") {
      const html = `
            <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
              <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <div style="background-color: #28A745; color: white; padding: 15px; text-align: center; font-size: 20px;">
                  Your Order Has Been Delivered!
                </div>
                <div style="padding: 20px; color: #333;">
                  <p>Hi <strong>${order.shipping.fullName}</strong>,</p>
                  <p>We’re happy to let you know that your order <strong>#${order.orderNumber}</strong> has been successfully delivered to your address.</p>
                  <p>We hope you love your purchase! If you have any issues or feedback, feel free to reach out to us.</p>
               
                  <p>Thank you for shopping with us!</p>
                  <p>Best regards,<br>Scent's By Jojo</p>
                </div>
                <div style="background: #f0f0f0; padding: 10px; text-align: center; font-size: 12px; color: #777;">
                  This is an automated message, please do not reply.
                </div>
              </div>
            </div>
            `;
      await sendEmail({
        to: order.email,
        subject: `Your Order #${order.orderNumber} Has Been Delivered ✅`,
        html,
        customerName: order.shipping.fullName,
      });
      console.log("Order delivered email sent");
    }

    return res.json({
      success: true,
      message: "Updated successfully",
    });
  } catch (error) {
    console.error("Error updating orders:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update orders",
    });
  }
};
