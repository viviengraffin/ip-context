type MemoizeContext = ClassGetterDecoratorContext | ClassMethodDecoratorContext;

export function memoize(cacheName?: string) {
  return function <T>(getter: () => T, context: MemoizeContext) {
    const key = cacheName ?? `_${String(context.name)}`;

    return function (this: any): T {
      if (this[key] === undefined) {
        this[key] = getter.call(this);
      }

      return this[key];
    };
  };
}
