import { generateToken } from "../utils/index.mjs";
import User from "../models/user.mjs";
import bcrypt from "bcrypt";
import { asyncHandler } from "../middlewares/index.mjs";
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password || !name) {
    throw new Error("Please fill all the fields");
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400).send("User already exists");
    return;
  }

  // Hash the User password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser = new User({ name, email, password: hashedPassword });

  try {
    await newUser.save();
    res.status(201).json({
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
    });
  } catch (error) {
    console.log(error);
    res.status(400);
    throw new Error("Invalid User data");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password, securityKey } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const isPasswordValid = await bcrypt.compare(
        password,
        existingUser.password
      );
      const isSecurityKeyValid = securityKey === process.env.SECURITY_KEY;
      if (isPasswordValid && isSecurityKeyValid) {
        const token = generateToken(res, existingUser._id);
        res.status(200).json({
          _id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          isAdmin: existingUser.isAdmin,
          token,
        });
      } else {
        res.status(401).json({ message: "Invalid Password or security key" });
      }
    } else {
      res.status(401).json({ message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

export { loginUser, registerUser };
