import { ADDRESS_VERSIONS, FORBIDDEN_CHARS } from "./const.ts";
import { ContextError, IncorrectAddressError } from "./error.ts";
import {
  ADDRESS_CONSTRUCTORS,
  type IPv4Address,
  type IPv6Address,
} from "./ipaddress.ts";
import type {
  AddressArrayForVersion,
  AddressArrays,
  AddressVersions,
  CheckAddressFunction,
  ExtractCidrFromStringResult,
  NumberTypeForVersion,
  Undefineded,
  Valid,
} from "./types.ts";

/**
 * Verify if the address is correct
 * @param version IP Version of this address
 * @param items Array of address blocks (for example: [192,168,1,1] for IPv4)
 * @returns {Valid<Error>} { valid:true } if this is address is correct
 */
export function isCorrectAddress<T extends AddressVersions>(
  version: T,
  items: number[] | AddressArrayForVersion<T>,
): Valid<Error> {
  const { itemMax, arrayLength } = ADDRESS_VERSIONS[version];

  if (items.length !== arrayLength) {
    return {
      valid: false,
      reason: new IncorrectAddressError({
        type: "incorrect-format",
        version,
        address: items,
      }),
    };
  }

  for (const item of items) {
    if (!Number.isInteger(item) || item < 0 || item > itemMax) {
      return {
        valid: false,
        reason: new IncorrectAddressError({
          type: "incorrect-item",
          version,
          item,
          address: items,
        }),
      };
    }
  }

  return {
    valid: true,
  };
}

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
  const constructor = ADDRESS_CONSTRUCTORS[version];
  // deno-lint-ignore ban-ts-comment
  // @ts-expect-error
  return new constructor(value);
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
 * extract cidr and the address from a stringWithCidr representation
 * @param stringWithCidr ip with cidr reprensentation (for example: "192.168.1.0/24")
 * @returns {ExtractCidrFromStringResult} { address, cidr }
 */
export function extractCidrFromString(
  stringWithCidr: string,
): ExtractCidrFromStringResult {
  const splittedString = stringWithCidr.split("/");

  if (splittedString.length !== 2) {
    throw new ContextError({
      type: "invalid-string-with-cidr",
      value: stringWithCidr,
    });
  }

  const cidr = Number(splittedString[1]);

  if (!Number.isInteger(cidr)) {
    throw new ContextError({
      type: "invalid-cidr",
      cidr,
    });
  }

  return {
    address: splittedString[0],
    cidr,
  };
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
 * stringify the IPv4 from the typed array representation
 * @param array IPv4 with typed array representation
 * @returns {string} IPv4 string representation
 */
export function stringifyIPv4Address(array: Uint8Array): string {
  return array.join(".");
}

/**
 * Search the max zero suite of this address typed array representation
 * @param address IPv6 address Uint16Array representation
 * @returns {[number,number] | null} [start,end] or null
 */
function searchMaxZeroSuite(address: Uint16Array): [number, number] | null {
  let res: [number, number] | null = null;
  let currentSuite: [number, number] | null = null;

  for (let index = 0; index < address.length; index++) {
    const item = address[index];
    if (currentSuite === null) {
      if (item === 0) {
        currentSuite = [index, index];
      }
    } else {
      if (item === 0) {
        currentSuite[1] = index;
      } else {
        if (res === null) {
          res = currentSuite;
        } else if (res[1] - res[0] < currentSuite[1] - currentSuite[0]) {
          res = currentSuite;
        }
        currentSuite = null;
      }
    }
  }

  if (
    currentSuite !== null &&
    (res === null || (res[1] - res[0] < currentSuite[1] - currentSuite[0]))
  ) {
    res = currentSuite;
  }

  return res;
}

/**
 * Stringify the IPv6 types array representation
 * @param address IPv6 Uint16Array representation
 * @returns {string} IPv6 string representation (for example: "2001:db::1")
 */
export function stringifyIPv6Address(address: Uint16Array): string {
  const skipIndexes = searchMaxZeroSuite(address);
  let index = 0;
  const res: string[] = [];

  while (index < address.length) {
    const item = address[index];
    if (skipIndexes === null || index !== skipIndexes[0]) {
      res.push(item.toString(16));
      index++;
    } else {
      if (skipIndexes[0] != 0) {
        res.push("");
      } else {
        res.push(":");
      }
      index = skipIndexes[1] + 1;
      if (skipIndexes[1] === 7) {
        res.push("");
      }
    }
  }

  return res.join(":");
}

/**
 * Count the number of zero blocks to add in typed array representation
 * @param address IPv6 string representation
 * @returns {number} Number of zero blocks to insert to make a valid IPv6 address
 */
function countZeroToAdd(address: string): number {
  if (address === "::") {
    return 8;
  }

  const index = address.indexOf("::");

  if (index === -1) {
    return 0;
  }

  const right = address.substring(0, index);
  const left = address.substring(index + 2);

  if (left[0] === ":") {
    throw new IncorrectAddressError({
      type: "too-many-shortcuts",
      address,
    });
  }

  if (left.indexOf("::") !== -1) {
    throw new IncorrectAddressError({
      type: "too-many-shortcuts",
      address,
    });
  }

  return 8 - (right.split(":").length + left.split(":").length);
}

/**
 * Parse IPv6 string to IPv6 Uint16Array
 * @param address IPv6 string representation
 * @param getArray if true, returns a number array (default: false)
 * @returns Uint16Array or number[] representation of the IPv6 address
 */
export function parseIPv6Address(address: string): Uint16Array;
export function parseIPv6Address(address: string, getArray: true): number[];
export function parseIPv6Address(
  address: string,
  getArray: boolean = false,
): Uint16Array | number[] {
  if (FORBIDDEN_CHARS[6].test(address)) {
    throw new IncorrectAddressError({
      type: "incorrect-format",
      version: 6,
      address,
    });
  }

  let nbZeroToAdd = countZeroToAdd(address);
  const res = new Uint16Array(8);
  const parts: string[] = address.split(":");

  if (parts[0] === "") {
    parts.shift();
    nbZeroToAdd += 1;
  }

  let index = 0;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    if (part === "") {
      for (let j = 0; j < nbZeroToAdd; j++) {
        res[index++] = 0;
      }
    } else {
      const parsed = parseInt(part, 16);
      if (isNaN(parsed) || parsed < 0 || parsed > 65535) {
        throw new IncorrectAddressError({
          type: "incorrect-item",
          version: 6,
          item: parsed,
          address,
        });
      }
      res[index++] = parsed;
    }
  }

  return getArray ? Array.from(res) : res;
}

/**
 * Parse IPv4 string to IPv4 Uint8Array
 * @param address IPv4 string
 * @param getArray if true, returns a number array (by default: false)
 * @returns Uint16Array or number[] representation of the IPv4 address
 */
export function parseIPv4Address(address: string): Uint8Array;
export function parseIPv4Address(address: string, getArray: true): number[];
export function parseIPv4Address(
  address: string,
  getArray: boolean = false,
): Uint8Array | number[] {
  if (FORBIDDEN_CHARS[4].test(address)) {
    throw new IncorrectAddressError({
      type: "incorrect-format",
      version: 4,
      address,
    });
  }

  const splittedAddress = address.split(".");
  if (splittedAddress.length != 4) {
    throw new IncorrectAddressError({
      type: "incorrect-format",
      version: 4,
      address,
    });
  }

  const res = new Uint8Array(4);
  for (let i = 0; i < splittedAddress.length; i++) {
    const nItem = Number(splittedAddress[i]);
    if (!Number.isInteger(nItem) || nItem < 0 || nItem > 255) {
      throw new IncorrectAddressError({
        type: "incorrect-item",
        version: 4,
        item: nItem,
        address,
      });
    }
    res[i] = nItem;
  }

  return getArray ? Array.from(res) : res;
}

/**
 * Check if this address has a zone id
 * @param address address to check
 * @returns {[string,string] | null} [address,zoneId] or null
 */
export function hasZoneId(address: string): [string, string] | null {
  const idx = address.indexOf("%");
  if (idx === -1) return null;

  const addressPart = address.substring(0, idx);
  const zonePart = address.substring(idx + 1);

  return [addressPart, zonePart];
}

/**
 * Check if the zone id is valid
 * @param zoneId zone id to check
 * @returns {boolean} if true, the zone id is valid
 */
export function verifyZoneId(zoneId: unknown): boolean {
  if (zoneId === null || zoneId === undefined) {
    return true;
  }
  if (typeof zoneId !== "string") {
    return false;
  }

  return /^[a-zA-Z0-9]+$/.test(zoneId);
}

/**
 * Create a memoized method
 * @param value value to check
 * @param assignCallback callback to define the value
 * @param returnCallback callback to return the value
 * @returns the returnCallback result
 */
export function memoize<T>(
  value: Undefineded<T>,
  assignCallback: () => void,
  returnCallback: () => T,
): T {
  if (value === undefined || value === null) {
    assignCallback();
  }
  return returnCallback();
}

/**
 * Convert an IPv6 typed array to bytes array
 * @param array IPv6 typed array
 * @param getArray if true, result is an array number (by default: false)
 * @returns if getArray is true, number[], else Uint8Array
 */
export function uint16ArrayToByteArray(array: Uint16Array): Uint8Array;
export function uint16ArrayToByteArray(
  array: Uint16Array,
  getArray: true,
): number[];
export function uint16ArrayToByteArray(
  array: Uint16Array,
  getArray: boolean = false,
): Uint8Array | number[] {
  const res = new Uint8Array(16);
  let index = 0;

  for (let i = 0; i < array.length; i++) {
    res[index++] = array[i] >> 8;
    res[index++] = array[i] & 0x00FF;
  }

  return getArray ? Array.from(res) : res;
}

/**
 * Convert an IPv6 bytes typed array to IPv6 Uint16Array
 * @param bytes IPv6 bytes Uint8Array
 * @param getArray if true, result is an array number (by default: false)
 * @returns if getArray is true, number[], else Uint16Array
 */
export function byteArrayToUint16Array(bytes: Uint8Array): Uint16Array;
export function byteArrayToUint16Array(
  bytes: Uint8Array,
  getArray: true,
): number[];
export function byteArrayToUint16Array(
  bytes: Uint8Array,
  getArray: boolean = false,
): Uint16Array | number[] {
  const res = new Uint16Array(8);
  let index = 0;

  for (let i = 0; i < bytes.length - 1; i += 2) {
    res[index++] = (bytes[i] << 8) | bytes[i + 1];
  }

  return getArray ? Array.from(res) : res;
}

export function binaryStringToUint<T extends AddressVersions>(
  version: T,
  binaryString: string,
): NumberTypeForVersion<T> {
  const { totalBits, numberConstructor } = ADDRESS_VERSIONS[version];
  if (binaryString.length !== totalBits) {
    throw new IncorrectAddressError({
      type: "incorrect-binary-string",
      version: version,
      value: binaryString,
    });
  }
  try {
    const res = numberConstructor("0b" + binaryString);
    if (typeof res === "number" && isNaN(res)) {
      throw new IncorrectAddressError({
        type: "incorrect-binary-string",
        version: version,
        value: binaryString,
      });
    }

    return res as NumberTypeForVersion<T>;
  } catch (_e) {
    throw new IncorrectAddressError({
      type: "incorrect-binary-string",
      version,
      value: binaryString,
    });
  }
}

export function hexStringToUint<T extends AddressVersions>(
  version: T,
  hexString: string,
): NumberTypeForVersion<T> {
  const { totalBits, numberConstructor } = ADDRESS_VERSIONS[version];
  if (hexString.length !== totalBits / 4) {
    throw new IncorrectAddressError({
      type: "incorrect-binary-string",
      version,
      value: hexString,
    });
  }
  try {
    const res = numberConstructor("0x" + hexString);
    if (typeof res === "number" && isNaN(res)) {
      throw new IncorrectAddressError({
        type: "incorrect-binary-string",
        version,
        value: hexString,
      });
    }

    return res as NumberTypeForVersion<T>;
  } catch (_e) {
    throw new IncorrectAddressError({
      type: "incorrect-binary-string",
      version,
      value: hexString,
    });
  }
}
