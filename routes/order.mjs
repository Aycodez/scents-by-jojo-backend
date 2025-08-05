import { Router } from "express";
import {
  getAllOrders,
  trackOrder,
  updateOrder,
} from "../controllers/orderController.mjs";
import { authenticate, authorizeAdmin } from "../middlewares/index.mjs";
import { getAnalytics } from "../controllers/analyticsController.mjs";
const router = Router();

router.get("/all", authenticate, authorizeAdmin, getAllOrders);
router.get("/track", trackOrder);
router.put("/update/:id", authenticate, authorizeAdmin, updateOrder);
router.get("/analytics", authenticate, authorizeAdmin, getAnalytics);
export default router;
