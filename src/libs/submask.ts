import { Address } from "./address.ts";
import { addressEquals, memoize } from "./functions/common.ts";
import {
  ADDRESS_VERSIONS,
  CIDR_TO_MASK,
  IPv4_CLASS_TO_SUBMASK,
  SUBMASK_POSSIBLE_BLOCKS,
} from "./const.ts";
import { ContextError, NonImplementedStaticMethodError } from "./error.ts";
import { isCorrectSubmask } from "./functions/check.ts";
import {
  binaryStringToUint,
  byteArrayToUint16Array,
  hexStringToUint,
  uint16ArrayToByteArray,
} from "./functions/conversion.ts";
import { parseIPv4Address, parseIPv6Address } from "./functions/parsing.ts";
import {
  stringifyIPv4Address,
  stringifyIPv6Address,
} from "./functions/stringify.ts";
import { arrayToUint, toUint, UintToArray } from "./functions/uint.ts";
import type {
  AddressArrayForVersion,
  AddressVersions,
  IPv4AddressClasses,
  NumberTypeForVersion,
} from "./types/address.ts";
import type {
  GenerateSubmaskFromHostsResult,
  NumberTypes,
} from "./types/common.ts";
import type {
  AddressOtherProperties,
  IPv6SubmaskKnownProperties,
  SubmaskKnownProperties,
} from "./types/otherProperties.ts";

/**
 * Calculates the number of available hosts for a given CIDR and IP version.
 *
 * @param version - IP version (4 or 6)
 * @param cidr - CIDR value
 * @returns {NumberTypes} Number of available hosts (number for IPv4, bigint for IPv6)
 */
function generateSubmaskFromCidr<T extends AddressVersions>(
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
function getSizeFromCidr<T extends AddressVersions>(
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
function generateSubmaskFromHosts<T extends AddressVersions>(
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

function getHostsFromSizeAndCidr<T extends AddressVersions>(
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

/**
 * Abstract class representing an IP submask.
 * Provides methods to create, validate, and manipulate subnets.
 */
export abstract class Submask<
  Version extends AddressVersions = AddressVersions,
> extends Address<Version> {
  static fromCidr(_cidr: number): Submask {
    throw new NonImplementedStaticMethodError();
  }

  static fromHosts(_hosts: NumberTypes): Submask {
    throw new NonImplementedStaticMethodError();
  }

  protected _cidr?: number;
  protected _size?: NumberTypeForVersion<Version>;
  protected _hosts?: NumberTypeForVersion<Version>;

  constructor(
    version: Version,
    items: number[] | AddressArrayForVersion<Version>,
    otherProperties: AddressOtherProperties<
      SubmaskKnownProperties<number> | IPv6SubmaskKnownProperties
    > = {},
  ) {
    super(version, items, isCorrectSubmask, otherProperties);

    if (otherProperties.knownProperties !== undefined) {
      if (otherProperties.knownProperties._cidr !== undefined) {
        this._cidr = otherProperties.knownProperties._cidr;
      }
      if (otherProperties.knownProperties._size !== undefined) {
        this._size = otherProperties.knownProperties
          ._size as NumberTypeForVersion<Version>;
      }
      if (otherProperties.knownProperties._hosts !== undefined) {
        this._hosts = otherProperties.knownProperties
          ._hosts as NumberTypeForVersion<Version>;
      }
    }
  }

  get cidr(): number {
    return memoize(this._cidr, () => {
      const possibleBlocks = SUBMASK_POSSIBLE_BLOCKS[this.version];
      let value = 0;

      for (let i = 0; i < this.array.length; i++) {
        const bitsToAdd = possibleBlocks.indexOf(this.array[i]);
        if (bitsToAdd === 0) {
          break;
        }
        value += bitsToAdd;
      }

      this._cidr = value;
    }, () => this._cidr!);
  }

  /**
   * Get the network size with this submask
   *
   * @returns {HostNumberType}
   */
  get size(): NumberTypeForVersion<Version> {
    return memoize(
      this._size,
      () => this._size = getSizeFromCidr(this.version, this.cidr),
      () => this._size!,
    );
  }

  get hosts(): NumberTypeForVersion<Version> {
    return memoize(
      this._hosts,
      () =>
        this._hosts = getHostsFromSizeAndCidr(
          this.version,
          this.size,
          this.cidr,
        ),
      () => this._hosts!,
    );
  }

  override toString(): string {
    throw new NonImplementedStaticMethodError();
  }
}

/**
 * Class representing an IPv4 submask.
 * Provides methods to create, validate, and manipulate IPv4 subnets.
 */
export class IPv4Submask extends Submask<4> {
  /**
   * Creates an IPv4Submask from a CIDR value.
   *
   * @param cidr - CIDR value (for example: 24)
   * @returns {IPv4Submask} New IPv4Submask instance
   */
  static override fromCidr(cidr: number): IPv4Submask {
    return new IPv4Submask(generateSubmaskFromCidr(4, cidr), {
      check: false,
      knownProperties: {
        _cidr: cidr,
      },
    });
  }

  /**
   * Creates an IPv4Submask from a desired number of hosts.
   *
   * @param hosts - Desired number of hosts
   * @returns {IPv4Submask} New IPv4Submask instance
   */
  static override fromHosts(hosts: number): IPv4Submask {
    const { submask, size, hosts: availableHosts, cidr } =
      generateSubmaskFromHosts(4, hosts);
    return new IPv4Submask(submask, {
      check: false,
      knownProperties: {
        _size: size,
        _hosts: availableHosts,
        _cidr: cidr,
      },
    });
  }

  /**
   * Creates an IPv4Submask from a string representation.
   *
   * @param string - String representation (for example: "255.255.255.0")
   * @returns {IPv4Submask} New IPv4Submask instance
   */
  static override fromString(string: string): IPv4Submask {
    return new IPv4Submask(parseIPv4Address(string), { check: true });
  }

  /**
   * Creates an IPv4Submask from a byte array.
   *
   * @param bytes - Uint8Array representing the submask
   * @returns {IPv4Submask} New IPv4Submask instance
   */
  static override fromByteArray(bytes: Uint8Array): IPv4Submask {
    return new IPv4Submask(Array.from(bytes));
  }

  /**
   * Creates an IPv4Submask from a standard address class (A, B, C).
   *
   * @param addressClass - Address class ("A", "B", or "C")
   * @returns {IPv4Submask | null} New IPv4Submask instance, or null if class is invalid
   */
  static fromClass(addressClass: IPv4AddressClasses): IPv4Submask | null {
    switch (addressClass) {
      case "A":
      case "B":
      case "C":
        return new IPv4Submask(IPv4_CLASS_TO_SUBMASK[addressClass], {
          check: false,
        });
      default:
        return null;
    }
  }

  static override fromUint(uint: number): IPv4Submask {
    return new this(Array.from(UintToArray(4, uint)), {
      check: false,
      knownProperties: {
        _uint: uint,
      },
    });
  }

  static override fromBinaryString(binaryString: string): IPv4Submask {
    return this.fromUint(binaryStringToUint(4, binaryString));
  }

  static override fromHexString(hexString: string): IPv4Submask {
    return this.fromUint(hexStringToUint(4, hexString));
  }

  /**
   * Validates an IPv4 submask.
   *
   * @param submask - Submask to validate (as array or string)
   * @returns {boolean} True if valid, false otherwise
   */
  static override isValidAddress(submask: number[] | string): boolean {
    if (typeof submask === "string") {
      submask = submask.split(".").map(Number);
    }

    return isCorrectSubmask(4, submask).valid;
  }

  /**
   * Check if the addresses are the same
   *
   * @param a Address to compare
   * @param b Address to compare
   * @returns {boolean} True if these addresses are the same, false otherwise.
   */
  static override equals(a: IPv4Submask, b: IPv4Submask): boolean {
    return addressEquals<4>(a.array, b.array);
  }

  /**
   * Creates a new IPv4Submask instance.
   *
   * @param items - Array or Uint8Array representing the submask
   */
  constructor(
    items: number[] | Uint8Array,
    otherProperties?: AddressOtherProperties<SubmaskKnownProperties<number>>,
  ) {
    super(4, items, otherProperties);
  }

  /**
   * Converts the submask to its string representation.
   *
   * @returns {string} String representation (for example: "255.255.255.0")
   */
  override toString(): string {
    return memoize(
      this._string,
      () => this._string = stringifyIPv4Address(this.array),
      () => this._string!,
    );
  }

  /**
   * Converts the submask to a 32-bit unsigned integer.
   *
   * @returns {number} 32-bit unsigned integer representation
   */
  override toUint(): number {
    if (this._uint === undefined) {
      this._uint = arrayToUint(4, this.array);
    }
    return this._uint as number;
  }

  /**
   * Converts the submask to a byte array.
   *
   * @returns {Uint8Array} Byte array representation
   */
  override toByteArray(): Uint8Array {
    return this.array;
  }
}

/**
 * Class representing an IPv6 submask.
 * Provides methods to create, validate, and manipulate IPv6 subnets.
 */
export class IPv6Submask extends Submask<6> {
  /**
   * Creates an IPv6Submask from a CIDR value.
   *
   * @param cidr - CIDR value (for example: 64)
   * @returns {IPv6Submask} New IPv6Submask instance
   */
  static override fromCidr(cidr: number): IPv6Submask {
    return new IPv6Submask(generateSubmaskFromCidr(6, cidr) as Uint16Array, {
      check: false,
      knownProperties: {
        _cidr: cidr,
      },
    });
  }

  /**
   * Creates an IPv6Submask from a desired number of hosts.
   *
   * @param hosts - Desired number of hosts (as bigint)
   * @returns {IPv6Submask} New IPv6Submask instance
   */
  static override fromHosts(hosts: bigint): IPv6Submask {
    const { submask, size, hosts: availableHosts, cidr } =
      generateSubmaskFromHosts(6, hosts);
    return new IPv6Submask(submask, {
      check: false,
      knownProperties: {
        _hosts: availableHosts,
        _size: size,
        _cidr: cidr,
      },
    });
  }

  /**
   * Creates an IPv6Submask from a string representation.
   *
   * @param string - String representation (for example: "ffff:ffff:ffff:ffff::")
   * @returns {IPv6Submask} New IPv6Submask instance
   */
  static override fromString(string: string): IPv6Submask {
    return new IPv6Submask(parseIPv6Address(string), {
      check: true,
    });
  }

  /**
   * Creates an IPv6Submask from a byte array.
   *
   * @param bytes - Uint8Array representing the submask
   * @returns {IPv6Submask} New IPv6Submask instance
   */
  static override fromByteArray(bytes: Uint8Array): IPv6Submask {
    return new IPv6Submask(byteArrayToUint16Array(bytes), {
      check: true,
      knownProperties: {
        _byteArray: bytes,
      },
    });
  }

  /**
   * Creates an IPv6Submask from a 128-bit unsigned integer.
   *
   * @param uint - 128-bit unsigned integer representation
   * @returns {IPv6Submask} New IPv6Submask instance
   */
  static override fromUint(uint: bigint): IPv6Submask {
    return new IPv6Submask(Array.from(UintToArray(6, uint)), {
      check: true,
      knownProperties: {
        _uint: uint,
      },
    });
  }

  static override fromBinaryString(binaryString: string): IPv6Submask {
    return this.fromUint(binaryStringToUint(6, binaryString));
  }

  static override fromHexString(hexString: string): IPv6Submask {
    return this.fromUint(hexStringToUint(6, hexString));
  }

  /**
   * Validates an IPv6 submask.
   *
   * @param submask - Submask to validate (as array or string)
   * @returns {boolean} True if valid, false otherwise
   */
  static override isValidAddress(submask: number[] | string): boolean {
    if (typeof submask === "string") {
      try {
        return this.isValidAddress(parseIPv6Address(submask, true));
      } catch (_e) {
        return false;
      }
    }

    return isCorrectSubmask(6, submask).valid;
  }

  /**
   * Check if the addresses are the same
   *
   * @param a Address to compare
   * @param b Address to compare
   * @returns {boolean} True if these addresses are the same, false otherwise.
   */
  static override equals(a: IPv6Submask, b: IPv6Submask): boolean {
    return addressEquals<6>(a.array, b.array);
  }

  protected _byteArray?: Uint8Array;

  /**
   * Creates a new IPv6Submask instance.
   *
   * @param items - Array or Uint16Array representing the submask
   */
  constructor(
    items: number[] | Uint16Array,
    otherProperties: AddressOtherProperties<IPv6SubmaskKnownProperties> = {},
  ) {
    super(6, items, otherProperties);

    if (
      otherProperties.knownProperties !== undefined &&
      otherProperties.knownProperties._byteArray !== undefined
    ) {
      this._byteArray = otherProperties.knownProperties._byteArray;
    }
  }

  /**
   * Converts the submask to its string representation.
   *
   * @returns {string} String representation (for example: "ffff:ffff:ffff:ffff::")
   */
  override toString(): string {
    return stringifyIPv6Address(this.array);
  }

  /**
   * Converts the submask to a 128-bit unsigned integer.
   *
   * @returns {bigint} 128-bit unsigned integer representation
   */
  override toUint(): bigint {
    if (this._uint === undefined) {
      this._uint = arrayToUint(6, this.array);
    }
    return this._uint as bigint;
  }

  /**
   * Converts the submask to a byte array.
   *
   * @returns {Uint8Array} Byte array representation
   */
  override toByteArray(): Uint8Array {
    return memoize(
      this._byteArray,
      () => this._byteArray = uint16ArrayToByteArray(this.array),
      () => this._byteArray!,
    );
  }
}
