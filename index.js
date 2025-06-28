require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require('cookie-parser');
const { authenticateToken } = require("./middleware/auth");
const app = express();
const port = process.env.PORT || 5000;
const authRoutes = require("./routes/auth");
const machineRoutes = require("./routes/machine");
const testRoutes = require("./routes/test");
const userRoutes = require("./routes/user");
// const userRoutes = require("./routes/user");
const couponRoutes = require("./routes/coupon");
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: true,
    credentials: true
}));
app.on("error", (err) => {
    console.error(err);
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
app.use("/auth", authRoutes);
app.use("/machine", machineRoutes);
app.use("/test", testRoutes);
// Use middleware authenticateToken for all routes starting with /coupon
app.use("/coupon",authenticateToken, couponRoutes);
app.use("/user", authenticateToken, userRoutes);