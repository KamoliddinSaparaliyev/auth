import PasswordValidator from "password-validator";
import HttpException from "../models/http-exeption.model";
import { compare, hash } from "bcryptjs";
import { sign } from "jsonwebtoken";

export class AuthUtil {
  checkPasswordAndHash = async (password: string) => {
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
      throw new HttpException(400, result.map((e) => e.message).join(", "));
    }

    const hashedPassword = await hash(password, 10);

    return hashedPassword;
  };

  matchPasswords = async (password: string, hashedPassword: string) => {
    const isPasswordMatch = await compare(password, hashedPassword);

    if (!isPasswordMatch) {
      throw new HttpException(401, "Username or password is incorrect");
    }

    return isPasswordMatch;
  };

  generateTokens = (user: any) => {
    const access_token = sign(
      { user: { id: user.id } },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    const refresh_token = sign(
      { user: { id: user.id } },
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
      }
    );

    return { access_token, refresh_token };
  };
}
