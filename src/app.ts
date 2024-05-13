import express, {
  json,
  urlencoded,
  static as static_,
  Response,
  Request,
} from "express";
import cors from "cors";
import expressAsyncHandler from "express-async-handler";
import router from "./routes";
import errorHandler, {
  developmentErrors,
  notFoundApi,
  productionErrors,
} from "./handlers/errorHandler";
import HttpException from "./models/http-exeption.model";

const app = express();

/**
 * App Configuration
 */

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

// Routes

app.use("/api", router);

// Server image files from the public directory
app.use(static_("public"));

// Get error message from HttpException

app.use(notFoundApi);

// app.use(developmentErrors);

// app.use(productionErrors);

app.use(errorHandler);

app.get("/", (req: Request, res: Response) => {
  res.json({ success: true, status: "API is running on /api" });
});

export default app;
