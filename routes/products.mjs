import express from "express";
import upload from "../middlewares/upload.mjs";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  updateProduct,
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
router.put(
  "/update/:id",
  upload.array("images", 2),
  authenticate,
  authorizeAdmin,
  updateProduct
);
router.get("/all-products", getAllProducts);
router.delete("/delete/:id", authenticate, authorizeAdmin, deleteProduct);
export default router;
