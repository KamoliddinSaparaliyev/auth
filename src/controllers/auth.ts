import { Request, Response } from "express";
import { compare } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";
import asyncHandler from "express-async-handler";

import HttpException from "../models/http-exeption.model";
import prisma from "../../prisma/client";
import httpValidator from "../shared/htto-validator";
import { AuthValidator } from "../validators/auth.validator";
import { AuthService } from "../services/auth.service";

/**
 * Controller class for handling authentication-related operations.
 */
export class AuthController {
  private authService: AuthService;
  private authValidator: AuthValidator;

  constructor(authService: AuthService, authValidator: AuthValidator) {
    this.authService = authService;
    this.authValidator = authValidator;
  }

  /**
   * Handles the login functionality.
   *
   * @param req - The Express Request object.
   * @param res - The Express Response object.
   * @returns A JSON response indicating the success of the login operation and providing access and refresh tokens.
   * @throws HttpException with status 404 if the username or password is incorrect.
   * @throws HttpException with status 401 if the username or password is incorrect.
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    httpValidator({ body: req.body }, { body: this.authValidator.loginSchema });

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
      // expiresIn: "30 seconds",
      expiresIn: 60 * 0.5,
    });

    const refresh_token = sign(
      { user: { id: user.id } },
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
  async regiter(req: Request, res: Response) {
    httpValidator(
      { body: req.body },
      { body: this.authValidator.registerSchema }
    );
    const result = await this.authService.createUser(req.body);
    res.status(201).json({ success: true, message: "Register successful" });
  }

  getMe = asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findFirst({
      where: {
        id: req.user.id,
      },
    });

    if (!user) {
      throw new HttpException(404, "User not found");
    }

    const result = {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      created_at: user.created_at,
    };

    res.status(200).json({ success: true, data: result });
  });

  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    httpValidator(
      { body: req.body },
      { body: this.authValidator.refreshTokenSchema }
    );
    const { refresh_token } = req.body;

    try {
      const decoded: any = verify(
        refresh_token,
        process.env.JWT_REFRESH_SECRET
      );

      const user = await prisma.user.findFirst({
        where: {
          id: decoded.user.id,
        },
      });

      if (!user) {
        throw new HttpException(404, "User not found");
      }

      const access_token = sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      res.status(200).json({
        success: true,
        message: "Token refreshed",
        access_token,
      });
    } catch (error) {
      throw new HttpException(401, "Invalid token");
    }
  });
}
