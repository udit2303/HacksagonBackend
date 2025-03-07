require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { authenticateToken } = require("./middleware/auth");
const app = express();
const port = process.env.PORT || 3000;
const authRoutes = require("./routes/auth");
// const userRoutes = require("./routes/user");
const couponRoutes = require("./routes/coupon");
app.use(express.json());
app.use(cors());
app.on("error", (err) => {
    console.error(err);
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
app.use("/auth", authRoutes);
// Use middleware authenticateToken for all routes starting with /coupon
app.use("/coupon",authenticateToken, couponRoutes);
