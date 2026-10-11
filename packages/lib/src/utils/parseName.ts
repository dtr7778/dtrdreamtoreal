interface NameParts {
  firstName: string;
  middleName?: string;
  lastName?: string;
}

export function parseName(fullName: string): NameParts {
  if (!fullName || fullName.trim() === "") {
    throw new Error("fullName cannot be an empty string");
  }

  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return { firstName: parts[0]!, middleName: undefined, lastName: undefined };
  }

  if (parts.length === 2) {
    return { firstName: parts[0]!, middleName: undefined, lastName: parts[1]! };
  }

  const firstName = parts[0]!;
  const lastName = parts[parts.length - 1]!;
  const middleName = parts.slice(1, -1).join(" ");

  return { firstName, middleName, lastName };
}

export function buildName(nameParts: NameParts): string {
  const { firstName, middleName, lastName } = nameParts;

  return [firstName, middleName, lastName]
    .filter((part): part is string => Boolean(part))
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .join(" ");
}
