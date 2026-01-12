import cors from "cors";
import express from "express";
import morgan from "morgan";
import path from "path";

import productRouter from "./routes/productRoute";
import usersRouter from "./routes/userRoute";
import categoryRouter from "./routes/categoryRoute";
import orderRouter from "./routes/orderRouter";
import cartRouter from "./routes/cartRoute";
import predictRouter from "./routes/predictRouter";

import AppError from "./utils/AppError";
import globalErrorHandler from "./middleware/errorMiddleware";

const app = express();

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  // eslint-disable-next-line no-console
  console.log(`Mode: ${process.env.NODE_ENV}`);
}

app.use("/api/products", productRouter);
app.use("/api/users", usersRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/model", predictRouter);

app.use("*", (req, _res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
