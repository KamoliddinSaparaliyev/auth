import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import { JsonWebTokenError } from "jsonwebtoken";
import { PrismaClientValidationError } from "@prisma/client/runtime/library";
import HttpException from "../models/http-exeption.model";

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
  if (err instanceof Joi.ValidationError) {
    err = new HttpException(
      400,
      err.details
        .map((e) => capitalizeFirstLetter(e.message.replace(/"/g, "")))
        .join(", ")
    );
  } else if (err instanceof JsonWebTokenError) {
    err = new HttpException(401, "Invalid token");
  } else if (err instanceof PrismaClientValidationError) {
    err = new HttpException(400, err.message.replace(/\n/g, ""));
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};

/**
 * Handles the not found API endpoint.
 *
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 */
export const notFoundApi = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new HttpException(
    404,
    `Cannot ${req.method} ${req.originalUrl}`
  );
  next(error);
};

/**
 * Handles development errors by formatting and rendering error details.
 *
 * @param err - The error object.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 */
export const developmentErrors = (
  err: HttpException,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.stack = err.stack || "";
  const errorDetails = {
    message: err.message,
    status: err.statusCode,
    stackHighlighted: err.stack.replace(
      /[a-z_-\d]+.js:\d+:\d+/gi,
      "<mark>$&</mark>"
    ),
  };
  res.status(err.statusCode || 500);
  console.log(errorDetails);
  res.format({
    "text/html": () => {
      res.render("error", errorDetails);
    },
    "application/json": () => res.json(errorDetails),
  });
};

/**
 * Handles production errors by setting the response status and sending a JSON response.
 * @param err - The error object.
 * @param req - The request object.
 * @param res - The response object.
 * @param next - The next function.
 */
export const productionErrors = (
  err: HttpException, // Change the type of 'err' parameter to 'HttpException'
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(err.statusCode || 500);
  res.json({
    status: err.statusCode || 500,
    message: "Oops ! Error in Server",
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
