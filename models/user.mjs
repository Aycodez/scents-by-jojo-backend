import mongoose from "mongoose";
import { customAlphabet } from "nanoid";

const generateSecurityKey = customAlphabet(
  "1459ABCFGHJ&*+KLMNPQ@RS£/.'=+WXYZ~#",
  15
);
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
      maxLength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowerCase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minLength: [6, "Password must be at least 6 characters"],
    },
    securityKey: {
      type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", function (next) {
  if (this.isNew) {
    this.securityKey = generateSecurityKey();
  }
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
