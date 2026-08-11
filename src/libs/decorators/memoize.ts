// deno-lint-ignore-file no-explicit-any
type MemoizeContext = ClassGetterDecoratorContext | ClassMethodDecoratorContext;

export function memoize(cacheName?: string | symbol) {
  return function <T>(getter: () => T, context: MemoizeContext) {
    const key = cacheName ?? Symbol(`memoize:${String(context.name)}`);

    return function (this: any): T {
      if (this[key] === undefined) {
        this[key] = getter.call(this);
      }

      return this[key];
    };
  };
}
