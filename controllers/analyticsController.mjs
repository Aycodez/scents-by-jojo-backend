import Order from "../models/order.mjs";

export const getAnalytics = async (req, res) => {
  try {
    const [orders, total] = await Promise.all([
      Order.aggregate([
        { $match: { isPaid: true } }, // Only paid orders
        {
          $group: {
            _id: null,
            total: { $sum: "$totalPrice" },
          },
        },
      ]),
      Order.countDocuments(),
    ]);
    res.json({
      success: true,
      analytics: { totalSales: orders[0]?.total || 0, totalOrders: total },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};
