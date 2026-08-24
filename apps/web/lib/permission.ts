import type { PermissionDataModel } from "@workspace/drizzle/schemas";
import {
  ActionTypeEnumSchema,
  ActionTypeEnumType,
  PermissionLevelEnumSchema,
  PermissionLevelEnumType,
  ResourceTypeEnumType,
} from "@workspace/drizzle/zod-db-enums";

import { PermissionType } from "@/types";

const separator = ".";

type PermissionDataType = Pick<
  PermissionDataModel,
  "name" | "level" | "resource" | "action"
>;

export type PermissionStrType =
  `${PermissionLevelEnumType}${typeof separator}${ResourceTypeEnumType}${typeof separator}${ActionTypeEnumType}`;

function buildPermissionMap(
  permissions: Array<PermissionDataType | PermissionType>
): Map<string, Set<ActionTypeEnumType>> {
  const permissionMap = new Map<string, Set<ActionTypeEnumType>>();

  for (const p of permissions) {
    const key = `${p.level}${separator}${p.resource}`;

    if (!permissionMap.has(key)) {
      permissionMap.set(key, new Set());
    }

    // Handle manage wildcard
    if (p.action === ActionTypeEnumSchema.enum.manage) {
      for (const action of ActionTypeEnumSchema.options) {
        permissionMap.get(key)!.add(action);
      }
    } else {
      permissionMap.get(key)!.add(p.action);
    }
  }

  return permissionMap;
}

export function hasPermission(
  userPermissions: Array<PermissionDataType>,
  requiredPermissions: Array<PermissionStrType>,
  context: { userId?: string; resourceId?: string }
): boolean {
  if (requiredPermissions.length === 0) return true;
  if (userPermissions.length === 0) return false;

  const permissionMap = buildPermissionMap(userPermissions);

  for (const required of requiredPermissions) {
    const [level, resource, action] = required.split(separator) as [
      PermissionLevelEnumType,
      ResourceTypeEnumType,
      ActionTypeEnumType,
    ];

    // Handle self-level permissions
    if (level === PermissionLevelEnumSchema.enum.self) {
      if (
        context?.userId &&
        context?.resourceId &&
        context?.userId !== context?.resourceId
      ) {
        continue;
      }
    }

    const key = `${level}${separator}${resource}`;
    const actions = permissionMap.get(key);

    if (actions && actions.has(action)) {
      return true;
    }
  }

  return false;
}
