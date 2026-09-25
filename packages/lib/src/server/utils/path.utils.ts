export function pathNormalize(path: string): string {
  const pathSegments: string[] = path
    .split("/")
    .filter((segment: string) => segment.length > 0);

  return "/" + pathSegments.join("/");
}

export function pathCombine(...pathSegments: string[]): string {
  return pathNormalize(pathSegments.join("/"));
}
