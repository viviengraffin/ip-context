import { Mapped } from "./tunneling.ts";
import { ADDRESS_VERSIONS } from "./const.ts";
import { IPv4Address, IPv6Address } from "./ipaddress.ts";
import type {
  AddressArrayForVersion,
  AddressArrays,
  AddressVersions,
  CheckAddressFunction,
  NumberTypes,
} from "./types.ts";
import { getIP6ArpaStringParts } from "./functions/parsing.ts";
import { isCorrectAddress } from "./functions/check.ts";
import type { Address } from "./address.ts";

/**
 * Creates a typed array for an IP address.
 * @param version IP version (4 or 6)
 * @param address Array of address blocks (for example: [192, 168, 1, 1] for IPv4). If undefined, returns 0.0.0.0 or ::.
 * @param check Function to validate the address. Defaults to `isCorrectAddress`.
 * @returns Uint8Array for IPv4, Uint16Array for IPv6
 * @throws {IncorrectAddressError} If the address is invalid and check fails.
 */
export function createAddressArray<T extends AddressVersions>(
  version: T,
  address?: number[] | AddressArrayForVersion<T>,
  check: CheckAddressFunction<T> = isCorrectAddress,
): AddressArrayForVersion<T> {
  const { arrayConstructor, arrayLength } = ADDRESS_VERSIONS[version];
  if (address !== undefined) {
    const rCheck = check(version, address);
    if (!rCheck.valid) {
      throw rCheck.reason;
    }
  }

  return (address === undefined
    ? new arrayConstructor(arrayLength) as AddressArrayForVersion<T>
    : (
      address instanceof arrayConstructor
        ? address
        : new arrayConstructor(address)
    ) as AddressArrayForVersion<T>);
}

export function createAddress(
  version: AddressVersions,
  value: AddressArrays,
): IPv4Address | IPv6Address {
  return version === 4
    ? new IPv4Address(value as Uint8Array)
    : new IPv6Address(value as Uint16Array);
}

export function createAddressFromUint(
  version: AddressVersions,
  value: NumberTypes,
): IPv4Address | IPv6Address {
  return version === 4
    ? IPv4Address.fromUint(value as number)
    : IPv6Address.fromUint(value as bigint);
}

export function createAddressFromString(
  version: AddressVersions,
  value: string,
): IPv4Address | IPv6Address {
  return version === 4
    ? IPv4Address.fromString(value)
    : IPv6Address.fromString(value);
}

/**
 * Copy the address in a new typed array
 * @param version IP version address
 * @param address Address representation to copy
 */
export function copyAddress<T extends AddressVersions>(
  version: T,
  address: number[] | AddressArrayForVersion<T>,
): AddressArrayForVersion<T> {
  if (Array.isArray(address)) {
    // deno-lint-ignore ban-ts-comment
    // @ts-ignore
    return createAddress(version, address, (_address) => ({ valid: true }));
  }

  const { arrayConstructor } = ADDRESS_VERSIONS[version];
  return new arrayConstructor(Array.from(address)) as AddressArrayForVersion<T>;
}

/**
 * Check if this string contains a cidr
 * @param string string to check
 * @returns {boolean} True if the string contains a CIDR notation (for example:. '192.168.1.0/24').
 */
export function hasCidrInString(string: string): boolean {
  return string.includes("/");
}

/**
 * Check if this address string is an IPv4 address
 * @param address address to check
 * @returns {boolean}
 */
export function isIPv4StringAddress(address: string): boolean {
  return address.includes(".");
}

/**
 * Create a memoized method
 * @param value value to check
 * @param assignCallback callback to define the value
 * @param returnCallback callback to return the value
 * @returns the returnCallback result
 */
export function memoize<T>(
  value: T | undefined,
  assignCallback: () => void,
  returnCallback: () => T,
): T {
  if (value === undefined) {
    assignCallback();
  }
  return returnCallback();
}

export function addressEquals<T extends AddressVersions>(
  a: AddressArrayForVersion<T>,
  b: AddressArrayForVersion<T>,
): boolean {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }

  return true;
}

export function getIPv6AddressStringType(
  address: string,
): "ip6.arpa" | "mapped" | "normal" {
  if (getIP6ArpaStringParts(address) !== null) {
    return "ip6.arpa";
  }
  if (Mapped.isValidString(address)) {
    return "mapped";
  } else {
    return "normal";
  }
}

export function getAddressFromAddressContainers(
  version: AddressVersions,
  address: string | Address,
): Address {
  if (typeof address === "string") {
    return createAddressFromString(version, address);
  }
  return address;
}
