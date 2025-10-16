import { ADDRESS_VERSIONS, SUBMASK_POSSIBLE_BLOCKS } from "../const.ts";
import { IncorrectAddressError } from "../error.ts";
import type {
  AddressArrayForVersion,
  AddressVersions,
  Valid,
} from "../types.ts";

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
 * Checks if the given submask is valid for the specified IP version.
 * A valid submask must have all 1s before any 0, and no 1s after a 0.
 *
 * @param version - IP version (4 or 6)
 * @param items - Array of submask blocks (for example: [255, 255, 255, 0] for IPv4)
 * @returns {Valid<Error>} { valid: true } if valid, otherwise an error object
 */
export function isCorrectSubmask<T extends AddressVersions>(
  version: T,
  items: number[] | AddressArrayForVersion<T>,
): Valid<Error> {
  const { arrayLength, itemMax } = ADDRESS_VERSIONS[version];
  let hasZero = false;

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

    if (!hasZero) {
      if (item === itemMax) {
        continue;
      }

      if (SUBMASK_POSSIBLE_BLOCKS[version].includes(item)) {
        hasZero = true;
      } else {
        return {
          valid: false,
          reason: new IncorrectAddressError({
            type: "has-one-after-zero",
            version,
            address: items,
          }),
        };
      }
    } else if (item !== 0) {
      return {
        valid: false,
        reason: new IncorrectAddressError({
          type: "has-one-after-zero",
          version,
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

export function isCorrectPort(port: number): boolean {
  return Number.isInteger(port) && port >= 0 && port <= 0xFFFF;
}

export function getIPv6AddressStringType(
  address: string,
): "ip6.arpa" | "mapped" | "normal" | null {
  if (address.endsWith(".ip6.arpa")) {
    return "ip6.arpa";
  }
  if (address.startsWith("::ffff:")) {
    return "mapped";
  } else if (address.includes(":")) {
    return "normal";
  }
  return null;
}
