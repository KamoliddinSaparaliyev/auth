import express from "express";
import cors from "cors";
import { Request, Response } from "express";

const app = express();

/**
 * App Configuration
 */

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Server image files from the public directory
app.use(express.static("public"));

app.get("/", (req: Request, res: Response) => {
  res.json({ success: true, status: "API is running on /api" });
});

export default app;
