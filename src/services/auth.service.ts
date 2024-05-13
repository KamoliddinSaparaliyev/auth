import prisma from "../../prisma/client";
import HttpException from "../models/http-exeption.model";
import { AuthUtil } from "../utils/auth.util";

export class AuthService {
  private authUtil: AuthUtil;

  constructor(authUtil: AuthUtil) {
    this.authUtil = authUtil;
  }

  async checkUserUniqueness(email: string, username: string) {
    const existingUserByEmail = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    const existingUserByUsername = await prisma.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
      },
    });

    if (existingUserByEmail || existingUserByUsername) {
      throw new HttpException(422, {
        errors: {
          ...(existingUserByEmail ? { email: ["has already been taken"] } : {}),
          ...(existingUserByUsername
            ? { username: ["has already been taken"] }
            : {}),
        },
      });
    }
  }

  async createUser(payload: any) {
    const { email, password, confirmPassword, username, name } = payload;

    await this.checkUserUniqueness(email, username);

    if (password !== confirmPassword) {
      throw new HttpException(400, "Passwords do not match");
    }

    const hashedPassword = await this.authUtil.checkPasswordAndHash(password);

    await prisma.user.create({
      data: { email, password: hashedPassword, username, name },
    });
  }
}
