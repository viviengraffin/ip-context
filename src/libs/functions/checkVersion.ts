import { IPv4Context, IPv6Context } from "../context.ts";
import { IPv4Address } from "../ipaddress/ipv4.ts";
import { IPv6Address } from "../ipaddress/ipv6.ts";
import { IPv4Submask } from "../submask/ipv4.ts";
import { IPv6Submask } from "../submask/ipv6.ts";

/**
 * Check if the context is an IPv6Context
 *
 * @param variable Variable to check
 */
export function isIPv6(
  variable: IPv6Context | IPv4Context,
): variable is IPv6Context;
/**
 * Check if the submask is an IPv6Submask
 *
 * @param variable Variable to check
 */
export function isIPv6(
  variable: IPv6Submask | IPv4Submask,
): variable is IPv6Submask;
/**
 * Check if the address is an IPv6Address
 *
 * @param variable Variable to check
 */
export function isIPv6(
  variable: IPv6Address | IPv4Address,
): variable is IPv6Address;
export function isIPv6(variable: unknown): boolean {
  return (
    variable instanceof IPv6Address ||
    variable instanceof IPv6Context ||
    variable instanceof IPv6Submask
  );
}

/**
 * Check if the submask is an IPv4Submask
 *
 * @param variable Variable to check
 */
export function isIPv4(
  variable: IPv6Submask | IPv4Submask,
): variable is IPv4Submask;
/**
 * Check if the context is an IPv4Context
 *
 * @param variable Variable to check
 */
export function isIPv4(
  variable: IPv6Context | IPv4Context,
): variable is IPv4Context;
/**
 * Check if the address is an IPv4Address
 *
 * @param variable Variable to check
 */
export function isIPv4(
  variable: IPv6Address | IPv4Address,
): variable is IPv4Address;
export function isIPv4(variable: unknown): boolean {
  return (
    variable instanceof IPv4Address ||
    variable instanceof IPv4Context ||
    variable instanceof IPv4Submask
  );
}
