import { Router } from "express";
import { trackOrder } from "../controllers/orderController.mjs";
const router = Router();

router.get("/track", trackOrder);

export default router;
