import { ADDRESS_VERSIONS, SUBMASK_POSSIBLE_BLOCKS } from "../const.ts";
import type { AddressArrayForVersion, AddressVersions } from "../types/address.ts";

/**
 * Create the submask typed array for the IP version and the cidr
 *
 * @param version IP version
 * @param cidr The cidr
 * @returns {AddressArrays} Submask typed array
 */
function createSubmaskArray<T extends AddressVersions>(
  version: T,
  cidr: number,
): AddressArrayForVersion<T> {
  const { arrayConstructor, arrayLength, bitsByItem } =
    ADDRESS_VERSIONS[version];
  const possibleBlocks = SUBMASK_POSSIBLE_BLOCKS[version];
  const res = new arrayConstructor(arrayLength);

  let remainingBits = cidr;

  for (let i = 0; i < arrayLength; i++) {
    const bitsToSet = Math.min(remainingBits, bitsByItem);
    res[i] = possibleBlocks[bitsToSet];
    remainingBits -= bitsToSet;
    if (remainingBits === 0) {
      break;
    }
  }

  return res as AddressArrayForVersion<T>;
}

/**
 * Generate the submask array for all cidr
 *
 * @param version - IP version to generate this array
 * @returns {(Uint8Array | Uint16Array)[]} Submask array for all cidr
 */
export function createSubmaskArrays<T extends AddressVersions>(
  version: T,
): AddressArrayForVersion<T>[] {
  const { totalBits } = ADDRESS_VERSIONS[version];
  const res = new Array(totalBits + 1);

  for (let i = 0; i <= totalBits; i++) {
    res[i] = createSubmaskArray(version, i);
  }

  return res;
}