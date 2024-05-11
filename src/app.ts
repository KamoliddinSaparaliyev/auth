import express, {
  json,
  urlencoded,
  static as static_,
  Response,
  Request,
} from "express";
import cors from "cors";
import router from "./routes";
import expressAsyncHandler from "express-async-handler";
import errorHandler from "./shared/errorHandler";
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

app.use(
  "*",
  expressAsyncHandler(async (req: Request, res: Response) => {
    throw new HttpException(404, `Cannot ${req.method} ${req.originalUrl}`);
  })
);

app.use(errorHandler);

app.get("/", (req: Request, res: Response) => {
  res.json({ success: true, status: "API is running on /api" });
});

export default app;
