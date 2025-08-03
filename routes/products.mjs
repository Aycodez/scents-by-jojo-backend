import express from "express";
import upload from "../middlewares/upload.mjs";
import {
  createProduct,
  getAllProducts,
} from "../controllers/productsController.mjs";
import { authenticate, authorizeAdmin } from "../middlewares/index.mjs";

const router = express.Router();

router.post(
  "/create",
  upload.array("images", 2),
  authenticate,
  authorizeAdmin,
  createProduct
);
router.get("/all-products", getAllProducts);
export default router;
