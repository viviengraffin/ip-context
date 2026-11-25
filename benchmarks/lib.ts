import { bench as mitataBench } from "mitata";

export function benchGenerateValue<T>(
  instanceCallback: () => T,
  benchs: { name: string; callback: (value: T) => void }[],
) {
  for (const bench of benchs) {
    const value = instanceCallback();

    mitataBench(bench.name, () => {
      bench.callback(value);
    });
  }
}
