import { ADDRESS_VERSIONS, CIDR_TO_MASK } from "../const.ts";
import { ContextError } from "../error.ts";
import { toUint } from "../functions/uint.ts";
import type {
  AddressArrayForVersion,
  AddressVersions,
  NumberTypeForVersion,
} from "../types/address.ts";
import type {
  GenerateSubmaskFromHostsResult,
  NumberTypes,
} from "../types/common.ts";

/**
 * Calculates the number of available hosts for a given CIDR and IP version.
 *
 * @param version - IP version (4 or 6)
 * @param cidr - CIDR value
 * @returns {NumberTypes} Number of available hosts (number for IPv4, bigint for IPv6)
 */
export function generateSubmaskFromCidr<T extends AddressVersions>(
  version: T,
  cidr: number,
): AddressArrayForVersion<T> {
  if (CIDR_TO_MASK[version][cidr] !== undefined) {
    return CIDR_TO_MASK[version][cidr] as AddressArrayForVersion<T>;
  }

  throw new ContextError({
    type: "invalid-cidr",
    cidr,
  });
}

/**
 * Calculates the number of available hosts for a given CIDR and IP version.
 *
 * @param version - IP version (4 or 6)
 * @param cidr - CIDR value
 * @returns {NumberTypes} Number of available hosts (number for IPv4, bigint for IPv6)
 */
export function getSizeFromCidr<T extends AddressVersions>(
  version: T,
  cidr: number,
): NumberTypeForVersion<T> {
  const { totalBits } = ADDRESS_VERSIONS[version];
  const uIntTotalBits = toUint(version, totalBits);
  const uIntCidr = toUint(version, cidr);
  return toUint(version, 1) <<
    (uIntTotalBits - uIntCidr) as NumberTypeForVersion<T>;
}

/**
 * Generates a submask from a desired number of hosts for the specified IP version.
 *
 * @param version - IP version (4 or 6)
 * @param hosts - Desired number of hosts (number for IPv4, bigint for IPv6)
 * @returns {AddressArrays} Typed array representing the submask
 * @throws {ContextError} If the number of hosts is invalid
 */
export function generateSubmaskFromHosts<T extends AddressVersions>(
  version: T,
  hosts: NumberTypeForVersion<T>,
): GenerateSubmaskFromHostsResult<
  AddressArrayForVersion<T>,
  NumberTypeForVersion<T>
> {
  const { totalBits } = ADDRESS_VERSIONS[version];
  const maxHosts =
    (version === 4
      ? Number(1n << BigInt(totalBits))
      : (1n << BigInt(totalBits))) as NumberTypeForVersion<T>;
  const diff = (version === 4 ? 2 : 1n) as NumberTypeForVersion<T>;

  if (hosts < 0 || hosts > maxHosts) {
    throw new ContextError({
      type: "invalid-hosts-number",
      value: hosts,
    });
  }

  for (let cidr = totalBits; cidr >= 0; cidr--) {
    const size = getSizeFromCidr(version, cidr);
    const availableHosts: NumberTypes = size - diff;

    if (availableHosts >= hosts) {
      return {
        submask: generateSubmaskFromCidr(version, cidr),
        hosts: availableHosts as NumberTypeForVersion<T>,
        size,
        cidr,
      };
    }
  }
  throw new Error();
}

export function getHostsFromSizeAndCidr<T extends AddressVersions>(
  version: T,
  size: NumberTypeForVersion<T>,
  cidr: number,
): NumberTypeForVersion<T> {
  if (version === 4) {
    return (cidr === 32
      ? 1
      : (cidr === 31
        ? 2
        : Math.max(0, (size as number) - 2))) as NumberTypeForVersion<T>;
  } else {
    const bSize = size as bigint;
    return (cidr === 128
      ? 1n
      : (cidr === 127
        ? 0n
        : (bSize > 0n ? bSize - 1n : 0n))) as NumberTypeForVersion<T>;
  }
}
