import express, {
  json,
  urlencoded,
  static as static_,
  Response,
  Request,
} from "express";
import cors from "cors";
import router from "./routes";
import HttpException from "./models/http-exeption.model";
import expressAsyncHandler from "express-async-handler";

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
  (
    err: HttpException,
    req: Request,
    res: Response,
    next: express.NextFunction
  ) => {
    res.status(err.statusCode || 500).json({
      success: false,
      stack: err.stack,
      message: err.message.replace(/\n/g, ""),
    });
  }
);

// Error handling
app.use(
  "*",
  expressAsyncHandler(async (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Cannot ${req.method} ${req.originalUrl}`,
    });
  })
);

app.get("/", (req: Request, res: Response) => {
  res.json({ success: true, status: "API is running on /api" });
});

export default app;
