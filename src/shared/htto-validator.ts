import { Request } from "express";
import Joi, { ValidationResult, ObjectSchema } from "joi";
import HttpException from "../models/http-exeption.model";

/**
 * Data structure representing request data.
 */
interface RequestData {
  body?: Request["body"];
  params?: Request["params"];
  query?: Request["query"];
}

/**
 * Data structure representing validation schema.
 */
interface ValidationSchema {
  body?: ObjectSchema;
  params?: ObjectSchema;
  query?: ObjectSchema;
}

/**
 * Validates the request data against the provided schema.
 * @param {RequestData} schemaData - Request data to be validated.
 * @param {ValidationSchema} validationSchema - Validation schema to validate against.
 */
const httpValidator = (
  schemaData: RequestData,
  validationSchema: ValidationSchema
): void => {
  /**
   * Validates the data against the provided schema.
   * @param {any} data - Data to be validated.
   * @param {ObjectSchema | undefined} schema - Joi schema to validate against.
   * @returns {ValidationResult} - Validation result.
   */
  const validate = (data: any, schema?: ObjectSchema): ValidationResult => {
    const result = schema?.validate(data, { abortEarly: false });
    return (
      result || { error: new Joi.ValidationError("", [], data), value: data }
    );
  };

  Object.keys(schemaData).forEach((key) => {
    const schema = schemaData[key as keyof RequestData];
    const validSchema = validationSchema[key as keyof ValidationSchema];

    if (schema && validSchema) {
      const { error } = validate(schema, validSchema);
      if (error) {
        throw error;
      }
    }
  });
};

export default httpValidator;
