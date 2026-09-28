export function pathNormalize(path: string): string {
  const pathSegments: string[] = path
    .split("/")
    .filter((segment: string) => segment.length > 0);

  return "/" + pathSegments.join("/");
}

export function pathCombine(...pathSegments: string[]): string {
  return pathNormalize(pathSegments.join("/"));
}

/**
 * Converts Express route params (`/users/:id`) into OpenAPI path templates
 * (`/users/{id}`).
 */
export function toOpenApiPath(path: string): string {
  return path.replace(/:([A-Za-z0-9_]+)/g, "{$1}");
}
