import {
  FORBIDDEN_CHARS,
  URL_IPv4_REGEXP,
  URL_IPv6_REGEXP,
  URL_REGEXP_DELETE_HOOKS,
} from "../const.ts";
import { ContextError, IncorrectAddressError, URLError } from "../error.ts";
import { IPv4Address, IPv6Address } from "../ipaddress.ts";
import type {
  AddressVersions,
  ExtractCidrFromStringResult,
  ParseUrlResult,
} from "../types.ts";
import { getIPv6AddressStringType } from "./check.ts";

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

function splitIP6ArpaString(string: string): string[] | null {
  const parts = string.split(".");

  if (parts.length !== 32) {
    return null;
  }

  return parts;
}

export function getIP6ArpaStringParts(string: string): string[] | null {
  if (string.endsWith(".ip6.arpa") && string.length === 72) {
    return splitIP6ArpaString(string.replace(".ip6.arpa", ""));
  }

  return null;
}

export function parseUrl<Version extends AddressVersions>(
  version: Version,
  url: string,
): ParseUrlResult {
  const regexp = version === 4 ? URL_IPv4_REGEXP : URL_IPv6_REGEXP;

  const matched = url.match(regexp);

  if (matched === null) {
    throw new URLError({
      type: "invalid-format",
      url,
    });
  }

  const address = version === 4
    ? matched[4]
    : matched[4].replace(URL_REGEXP_DELETE_HOOKS, "");
  const port = matched[5];
  const pathname = matched[6]?.substring(1);
  const search = matched[7]?.substring(1);
  const hash = matched[8]?.substring(1);

  return {
    protocol: matched[3],
    address,
    port: port ? Number(port.substring(1)) : undefined,
    pathname,
    search,
    hash,
  };
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
 * Check if this address has a zone id
 * @param address address to check
 * @returns {[string,string] | null} [address,zoneId] or null
 */
export function hasZoneId(
  address: string,
): [string, string] | [string, undefined] {
  const idx = address.indexOf("%");
  if (idx === -1) return [address, undefined];

  const addressPart = address.substring(0, idx);
  const zonePart = address.substring(idx + 1);

  return [addressPart, zonePart];
}

export function createIPAddressFromString(
  address: string,
): IPv4Address | IPv6Address {
  const ip6type = getIPv6AddressStringType(address);
  if (ip6type !== null) {
    switch (ip6type) {
      case "ip6.arpa":
        return IPv6Address.fromIP6ArpaString(address);
      case "mapped":
        return IPv6Address.fromIPv4MappedString(address);
      case "normal":
        return IPv6Address.fromString(address);
    }
  }

  return IPv4Address.fromString(address);
}
