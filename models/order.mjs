import mongoose from "mongoose";
import { customAlphabet } from "nanoid";

const generateOrderNumber = customAlphabet(
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZ",
  10
);

const { Schema, model } = mongoose;

const orderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  type: { type: String, required: true },
});

const shippingSchema = new Schema({
  fullName: { type: String, required: true },
  address: { type: String, required: true },
  //   city: { type: String, required: true },
  //   postalCode: { type: String, required: true },
  //   country: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  estimatedDelivery: { type: String },
});

const bankAccountSchema = new Schema({
  bankName: { type: String, default: "" },
  accountNumber: { type: String, default: "" },
});

const orderSchema = new Schema(
  {
    // user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    email: { type: String, required: true },
    orderItems: [orderItemSchema],
    shipping: shippingSchema,
    referenceId: { type: String },
    paymentMethod: { type: String, required: true },
    itemsPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true },
    shippingPrice: { type: Number, default: 200 },
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    bankAccount: bankAccountSchema,
    status: {
      type: String,
      enum: [
        "Pending",
        "Order Placed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
      default: "Order Placed",
    },
    orderNumber: { type: String, unique: true },
  },
  { timestamps: true }
);

orderSchema.pre("save", async function (next) {
  if (this.isNew && !this.orderNumber) {
    // Ensure uniqueness
    let unique = false;
    while (!unique) {
      const tempOrderNumber = `ORD-${generateOrderNumber()}`;
      const existing = await mongoose.models.Order.findOne({
        orderNumber: tempOrderNumber,
      });
      if (!existing) {
        this.orderNumber = tempOrderNumber;
        unique = true;
      }
    }
  }
  next();
});

const Order = model("Order", orderSchema);
export default Order;
