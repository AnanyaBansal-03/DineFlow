const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const connectDB = require("./config/database");
const config = require("./config/config");
const globalErrorHandler = require("./middlewares/globalErrorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
app.set("trust proxy", 1);
const server = http.createServer(app);
const PORT = process.env.PORT || 8000;

// Allow multiple origins for CORS
const allowedOrigins = [
    "http://localhost:5173",
    "https://dine-flow-beige.vercel.app",
    process.env.FRONTEND_URL
].filter(Boolean);

// Socket.io setup
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
  transports: ["websocket", "polling"],
});

connectDB();

// Pass io to orderController
const orderController = require("./controllers/orderController");
orderController.setIo(io);

app.set("io", io);

// CORS middleware
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ message: "DineFlow API is running!" });
});

app.use("/api/user", require("./routes/userRoute"));
app.use("/api/order", require("./routes/orderRoute"));
app.use("/api/table", require("./routes/tableRoute"));
app.use("/api/menu", require("./routes/menuRoute"));
app.use("/api/category", require("./routes/categoryRoutes"));

app.use(globalErrorHandler);

io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`☑️ Server is listening on port ${PORT}`);
  console.log(`☑️ Socket.io is ready`);
});