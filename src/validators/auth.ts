import Joi from "joi";

class AuthValidator {
  /**
   * Schema for validating login data.
   */
  static loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  /**
   * Schema for user registration.
   */
  static registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    name: Joi.string().required(),
  });
}

export default AuthValidator;
