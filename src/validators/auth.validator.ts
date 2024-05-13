import Joi from "joi";

export class AuthValidator {
  /**
   * Schema for validating login data.
   */
  loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  /**
   * Schema for user registration.
   */
  // check password and confirm password write in the joi schema

  registerSchema = Joi.object({
    email: Joi.string().email().required(),
    username: Joi.string().required(),
    password: Joi.string().required().valid(Joi.ref("confirmPassword")),
    confirmPassword: Joi.string().required(),
    name: Joi.string().required(),
  });

  /**
   * Schema for validating refresh token.
   */
  refreshTokenSchema = Joi.object({
    refresh_token: Joi.string().required(),
  });
}
