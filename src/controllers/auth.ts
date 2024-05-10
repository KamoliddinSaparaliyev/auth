import { Request, Response } from "express";
import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import expressAsyncHandler from "express-async-handler";
import PasswordValidator from "password-validator";

import HttpException from "../models/http-exeption.model";
import prisma from "../../prisma/client";
import httpValidator from "../shared/htto-validator";
import AuthValidator from "../validators/auth";

/**
 * Controller class for handling authentication-related operations.
 */
export class AuthController {
  /**
   * Handles the login functionality.
   *
   * @param req - The Express Request object.
   * @param res - The Express Response object.
   * @returns A JSON response indicating the success of the login operation and providing access and refresh tokens.
   * @throws HttpException with status 404 if the username or password is incorrect.
   * @throws HttpException with status 401 if the username or password is incorrect.
   */
  static login = expressAsyncHandler(async (req: Request, res: Response) => {
    httpValidator({ body: req.body }, { body: AuthValidator.loginSchema });

    const { email, password } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      throw new HttpException(404, "Username or password is incorrect");
    }

    const isPasswordMatch = await compare(password, user.password);
    if (!isPasswordMatch) {
      throw new HttpException(401, "Username or password is incorrect");
    }

    const access_token = sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    const refresh_token = sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
      }
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      access_token,
      refresh_token,
    });
  });

  /**
   * Registers a new user.
   *
   * @param req - The request object containing the user's information.
   * @param res - The response object used to send the registration status.
   * @returns A JSON response indicating the success or failure of the registration.
   * @throws HttpException with status 400 if the user already exists, passwords do not match, or password validation fails.
   */
  static regiter = expressAsyncHandler(async (req: Request, res: Response) => {
    const { email, password, coniformPassword, username } = req.body;

    const userEmail = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    const userName = await prisma.user.findFirst({
      where: {
        username,
      },
    });

    if (userEmail || userName) {
      throw new HttpException(400, "User already exists");
    }

    if (password !== coniformPassword) {
      throw new HttpException(400, "Passwords do not match");
    }

    const passwordSchema = new PasswordValidator();

    passwordSchema
      .is()
      .min(8)
      .is()
      .max(100)
      .has()
      .uppercase()
      .has()
      .lowercase()
      .has()
      .digits()
      .has()
      .not()
      .spaces();

    const result: boolean | any[] = passwordSchema.validate(password, {
      details: true,
    });

    const isArray = Array.isArray(result);

    if (isArray && result.length > 0) {
      const errorMessage = result.map((m) => m.message).join(", ");
      throw new HttpException(400, {
        success: false,
        message: errorMessage,
      });
    }

    await prisma.user.create({ data: req.body });

    res.status(201).json({ success: true, message: "Register successful" });
  });
}
