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
    if (!order)
      res.status(404).json({
        success: false,
        message: "Not found",
      });
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
        .replace("{{items}}", itemsHtml)
        .replace("{{currentYear}}", new Date().getFullYear().toString());

      await sendEmail({
        to: order.email,
        subject: "Order Confirmation",
        html: htmlContent,
        customerName: order.shipping.fullName,
      });
    }

    res.json({
      success: true,
      message: "Updated successfully",
    });
  } catch (error) {
    console.error("Error updating orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update orders",
    });
  }
};
