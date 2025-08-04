import Order from "../models/order.mjs";

export const trackOrder = async (req, res) => {
  try {
    const orderNumber = req.query.orderNumber;
    console.log(orderNumber);
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
