import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import appRouter from "./apis/app.router";
import { globalErrorHandler } from "./utils/error";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(helmet());
app.use(morgan("common"));

app.use("/api", appRouter);

app.use(globalErrorHandler);

export default app;
