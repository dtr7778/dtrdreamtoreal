import {
  EntityTypeEnumType,
  PrivateEntityTypeEnumSchema,
  PublicEntityTypeEnumSchema,
} from "@workspace/drizzle/zod-db-enums";

export function determineStorageType(
  entityType: EntityTypeEnumType
): "public" | "private" {
  if (PrivateEntityTypeEnumSchema.safeParse(entityType)) {
    return "private";
  }
  if (PublicEntityTypeEnumSchema.safeParse(entityType)) {
    return "public";
  }

  return "private";
}
