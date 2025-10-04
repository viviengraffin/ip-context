import type {
  AddressArrays,
  AddressVersionDefinition,
  AddressVersions,
  IPv4AddressClasses,
} from "./types.ts";

/**
 * Definition of IP address versions and their properties.
 * Contains configuration for both IPv4 and IPv6 address formats.
 *
 * @constant {Record<AddressVersions, AddressVersionDefinition>}
 */
export const ADDRESS_VERSIONS = {
  4: {
    arrayLength: 4,
    bitsByItem: 8,
    itemMax: 255,
    totalBits: 32,
    arrayConstructor: Uint8Array,
    numberConstructor: Number,
  },
  6: {
    arrayLength: 8,
    bitsByItem: 16,
    itemMax: 65535,
    totalBits: 128,
    arrayConstructor: Uint16Array,
    numberConstructor: BigInt,
  },
} as const satisfies Record<AddressVersions, AddressVersionDefinition>;

/**
 * List of possible block values for valid submasks.
 * Contains valid values for both IPv4 and IPv6 submasks.
 *
 * @constant {Record<AddressVersions, AddressArrays>}
 */
export const SUBMASK_POSSIBLE_BLOCKS = {
  4: new Uint8Array([
    0,
    128,
    192,
    224,
    240,
    248,
    252,
    254,
    255,
  ]),
  6: new Uint16Array([
    0,
    0x8000,
    0xC000,
    0xE000,
    0xF000,
    0xF800,
    0xFC00,
    0xFE00,
    0xFF00,
    0xFF80,
    0xFFC0,
    0xFFE0,
    0xFFF0,
    0xFFF8,
    0xFFFC,
    0xFFFE,
    0xFFFF,
  ]),
} as const as Record<AddressVersions, AddressArrays>;

/**
 * Create the submask typed array for the IP version and the cidr
 *
 * @param version IP version
 * @param cidr The cidr
 * @returns {AddressArrays} Submask typed array
 */
function createSubmaskArray(
  version: AddressVersions,
  cidr: number,
): AddressArrays {
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

  return res;
}

/**
 * Generate the submask array for all cidr
 *
 * @param version - IP version to generate this array
 * @returns {Uint16Array[]} Submask array for all cidr
 */
function createSubmaskArrays(version: 6): Uint16Array[];
/**
 * Generate the submask array for all cidr
 *
 * @param version - IP version to generate this array
 * @returns {Uint8Array[]} Submask array for all cidr
 */
function createSubmaskArrays(version: 4): Uint8Array[];
function createSubmaskArrays(version: AddressVersions): AddressArrays[] {
  const { totalBits } = ADDRESS_VERSIONS[version];
  const res = new Array(totalBits + 1);

  for (let i = 0; i <= totalBits; i++) {
    res[i] = createSubmaskArray(version, i);
  }

  return res;
}

/**
 * Cache of precomputed CIDR to subnet mask mappings.
 * Contains common CIDR values for both IPv4 and IPv6.
 *
 * @constant {Record<AddressVersions,Array<AddressArrays>>}
 */
export const CIDR_TO_MASK = {
  4: createSubmaskArrays(4),
  6: createSubmaskArrays(6),
} as const satisfies Record<AddressVersions, Array<AddressArrays>>;

/**
 * Regexp of forbidden chars for IP address string
 *
 * @constant {Record<AddressVersions,RegExp>}
 */
export const FORBIDDEN_CHARS = {
  4: /[-+^*:/]/,
  6: /[-+^*./g-zG-Z]/,
} as const satisfies Record<AddressVersions, RegExp>;

export const IPv4_CLASS_TO_SUBMASK = {
  "A": CIDR_TO_MASK[4][8],
  "B": CIDR_TO_MASK[4][16],
  "C": CIDR_TO_MASK[4][24],
} as const satisfies Record<Exclude<IPv4AddressClasses, "D" | "E">, Uint8Array>;
