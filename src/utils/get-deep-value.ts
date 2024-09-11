/**
 * This function is a utility that allows us to access deeply nested properties in an object
 * primarily for use with the context.payload object. It should not be overused and the developer
 * should be aware of the potential performance implications of using this function.
 *
 * Example usage:
 *
 * - `getDeepValue(context, "payload.repository.owner.login")` will return the owner
 * - `getDeepValue(context, ["payload", "repository", "owner", "login"])` will return the owner
 */
export function getDeepValue<T, TK extends string | string[]>(obj: T, path: TK | TK[]) {
  if (!obj || !path) return undefined;

  const pathArray = Array.isArray(path) ? path : path.split(".");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return pathArray.reduce((prev, key) => prev?.[key], obj as any);
}
