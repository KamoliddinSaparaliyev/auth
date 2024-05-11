import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import HttpException from "../models/http-exeption.model";
import { JsonWebTokenError } from "jsonwebtoken";
import { PrismaClientValidationError } from "@prisma/client/runtime/library";

/**
 * Express error handling middleware.
 * @param {Error} err - The error object.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next middleware function.
 */
const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };

  if (err instanceof Joi.ValidationError) {
    error = new HttpException(
      400,
      err.details
        .map((e) => capitalizeFirstLetter(e.message.replace(/\"/g, "")))
        .join(", ")
    );
  } else if (err instanceof JsonWebTokenError) {
    error = new HttpException(401, "Invalid token");
  } else if (err instanceof PrismaClientValidationError) {
    error = new HttpException(400, err.message.replace(/\n/g, ""));
  }

  const { message, statusCode } = err;

  res.status(error.statusCode || 500).json({
    success: false,
    error:
      {
        message,
        statusCode,
      } || "Internal Server Error",
  });
};

/**
 * Capitalizes the first letter of a string.
 * @param {string} string - The input string.
 * @returns {string} The string with the first letter capitalized.
 */
const capitalizeFirstLetter = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export default errorHandler;
