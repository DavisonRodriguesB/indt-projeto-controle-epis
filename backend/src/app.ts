import "express-async-errors";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import morgan from "morgan";
import { routes } from "./routes";
import { AppError, errorHandler } from "./middlewares/error-handler";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/api", routes);

app.use((request: Request, _response: Response, next: NextFunction) => {
  next(new AppError(404, `Rota nao encontrada: ${request.method} ${request.path}`, "ROUTE_NOT_FOUND"));
});

app.use((error: Error, request: Request, response: Response, next: NextFunction) => {
  errorHandler(error, request, response, next);
});

export { app };
