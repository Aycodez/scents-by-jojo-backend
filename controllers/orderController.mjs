import Order from "../models/order.mjs";

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
