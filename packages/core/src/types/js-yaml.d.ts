declare module "js-yaml" {
  export function load(
    input: string | Buffer,
    options?: Record<string, unknown>,
  ): unknown;
}
