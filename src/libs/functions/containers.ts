import { ContextError } from "../error.ts";
import { IPv4Submask, IPv6Submask } from "../submask/index.ts";

export function getIPv4Submask(
  arg: string | number | number[] | Uint8Array | IPv4Submask,
): IPv4Submask {
  switch (typeof arg) {
    case "string":
      return IPv4Submask.fromString(arg);
    case "number":
      return IPv4Submask.fromCidr(arg);
    case "object":
      if (Array.isArray(arg) || arg instanceof Uint8Array) {
        return new IPv4Submask(arg);
      }
      if (arg instanceof IPv4Submask) {
        return arg;
      }

      throw new ContextError({
        type: "unexpected-arg",
        arg,
      });
    default:
      throw new ContextError({
        type: "unexpected-arg",
        arg,
      });
  }
}

export function getIPv6Submask(
  arg: string | number | number[] | Uint16Array | IPv6Submask,
): IPv6Submask {
  switch (typeof arg) {
    case "string":
      return IPv6Submask.fromString(arg);
    case "number":
      return IPv6Submask.fromCidr(arg);
    case "object":
      if (Array.isArray(arg) || arg instanceof Uint16Array) {
        return new IPv6Submask(arg);
      }
      if (arg instanceof IPv6Submask) {
        return arg;
      }
      throw new ContextError({
        type: "unexpected-arg",
        arg,
      });
    default:
      throw new ContextError({
        type: "unexpected-arg",
        arg,
      });
  }
}
