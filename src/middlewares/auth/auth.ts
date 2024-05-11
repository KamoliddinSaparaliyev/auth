import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import expressAsyncHandler from "express-async-handler";

import HttpException from "../../models/http-exeption.model";
import prisma from "../../../prisma/client";

export const protect = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;
    // Check for Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      // Set token from header
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new HttpException(401, "Not authorized to access this route");
    }

    // Verify token
    const decoded: any = verify(token, process.env.JWT_SECRET);

    // Find user from database using the decoded user ID
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.id,
      },
    });

    // Check if user exists
    if (!user) throw new HttpException(404, "User not found");

    // Set user in request object for use in subsequent middleware
    req.user = user;

    next();
  }
);
