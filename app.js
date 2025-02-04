require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const productRouter = require("./routes/productRoute");
const usersRouter = require("./routes/userRoute");
const categoryRouter = require("./routes/categoryRoute");
const orderRouter = require("./routes/orderRouter");
const cartRouter = require("./routes/cartRoute");
const postRoutes = require("./routes/predictRouter");
const globalErrorHandler = require("./middleware/errorMiddleware");
const morgan = require("morgan");
const AppError = require("./utils/AppError");
const path = require("path");
const port = 4000;

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`Mode: ${process.env.NODE_ENV}`);
}

app.use("/api/products", productRouter);
app.use("/api/users", usersRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/model", postRoutes);
app.use("*", (req, _res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
app.use(globalErrorHandler);

const PORT = process.env.PORT || port;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
