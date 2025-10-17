import { isIPv4StringAddress } from "../functions/common.ts";
import { createIPAddressFromString } from "../functions/parsing.ts";
import { Mapped } from "../tunneling/mapped.ts";
import { IPv4Address } from "./ipv4.ts";
import { IPv6Address } from "./ipv6.ts";

/**
 * Creates an IP address (IPv4 or IPv6) from a string representation.
 *
 * @param ip - String representation of the IP address (for example:. "192.168.1.1" or "2001:db8::1")
 * @returns {IPv4Address | IPv6Address} New IP address instance
 *
 * @example Use with IPv4
 *
 * ```ts
 * import { ip } from "@viviengraffin/ip-context";
 *
 * const ip4=ip("192.168.1.1"); // Instance of IPv4Address
 * ```
 *
 * @example Use with IPv6
 *
 * ```ts
 * import { ip } from "@viviengraffin/ip-context";
 *
 * const ip6=ip("2001:db6::1"); // Instance of IPv6Address
 * ```
 *
 * @example Use with IPv4-mapped string
 *
 * ```ts
 * import { ip } from "@viviengraffin/ip-context";
 *
 * const ip6=ip("::ffff:192.168.1.1"); // Instance of IPv6Address
 * ```
 *
 * @example Use with ip6.arpa string
 *
 * ```ts
 * import { ip } from "@viviengraffin/ip-context";
 *
 * const ip6=ip("b.a.9.8.7.6.5.0.4.0.0.0.3.0.0.0.2.0.0.0.1.0.0.0.0.0.0.0.1.2.3.4.ip6.arpa"); // Instance of IPv6Address
 * ```
 */
export function ip(address: string): IPv4Address | IPv6Address {
  return createIPAddressFromString(address);
}

/**
 * Checks if the given string is a valid IP address (IPv4 or IPv6).
 *
 * @param ip - String to validate
 * @returns {boolean} True if the string is a valid IP address, false otherwise
 */
export function isValidAddress(ip: string): boolean {
  try {
    if (Mapped.isValidString(ip)) {
      return true;
    }
    if (isIPv4StringAddress(ip)) {
      return IPv4Address.isValidAddress(ip);
    } else {
      return IPv6Address.isValidAddress(ip);
    }
  } catch (_e) {
    return false;
  }
}
