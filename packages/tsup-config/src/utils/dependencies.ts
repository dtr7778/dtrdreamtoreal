export interface PackageDeps {
  internalPackages: string[];
  externalPackages: string[];
}

export function getPackageDeps(
  dependencies: Record<string, string>,
  internalScope: string = "@movingaccelerator",
): PackageDeps {
  const deps = Object.keys(dependencies);

  const internalPackages: string[] = [];
  const externalPackages: string[] = [];

  deps.forEach((dep) => {
    if (dep.startsWith(internalScope)) {
      internalPackages.push(dep);
    } else {
      externalPackages.push(dep);
    }
  });

  return { internalPackages, externalPackages };
}
