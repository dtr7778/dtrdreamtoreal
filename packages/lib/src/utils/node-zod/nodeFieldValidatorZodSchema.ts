import { stringArraySchema } from "../zod";

export function nodeFieldValidatorZodSchema<
  TKey extends "searchFields",
  TAllowed extends ReadonlyArray<string>,
>(key: TKey, allowedFields?: TAllowed) {
  const hasRestrictions =
    Array.isArray(allowedFields) && allowedFields.length > 0;

  return stringArraySchema
    .nullish()
    .refine(
      (values) => {
        if (!hasRestrictions || !values) return true;
        return values.every((value) => allowedFields.includes(value));
      },
      {
        message: hasRestrictions
          ? `Each value in '${key}' must be one of: ${
              allowedFields
                ? allowedFields.map((f) => `"${f}"`).join(", ")
                : "none"
            }`
          : `Each value in '${key}' must be one of: <no allowed fields provided>`,
      }
    )
    .openapi({
      param: {
        name: key,
        in: "query",
        required: false,
        description: `Allowed values: ${allowedFields ? allowedFields.join(", ") : "none"}`,
      },
      examples: allowedFields ? [...allowedFields] : [],
    });
}
