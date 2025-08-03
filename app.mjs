import express from "express";
import http from "http";
import cors from "cors";
import connectDB from "./config/db.mjs";
import dotenv from "dotenv";

//routes
import authRoute from "./routes/auth.mjs";
import productsRoute from "./routes/products.mjs";

dotenv.config();
const app = express();
const httpServer = http.Server(app);

const allowedOrigins = [
  "http://localhost:3000",
  "https://scents-by-jojo-frontend.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors(corsOptions));
// app.use(cors());

connectDB();

app.use("/api/", authRoute);
app.use("/api/products/", productsRoute);

app.use((req, res, next) => {
  res.status(404).json({
    status: "error",
    message: "API was not found",
  });
});
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log("Server running on Port: " + PORT);
});
