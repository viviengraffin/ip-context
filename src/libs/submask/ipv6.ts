import { isCorrectSubmask } from "../functions/check.ts";
import { addressEquals, memoize } from "../functions/common.ts";
import {
  binaryStringToUint,
  byteArrayToUint16Array,
  hexStringToUint,
  uint16ArrayToByteArray,
} from "../functions/conversion.ts";
import { parseIPv6Address } from "../functions/parsing.ts";
import { stringifyIPv6Address } from "../functions/stringify.ts";
import { arrayToUint, UintToArray } from "../functions/uint.ts";
import type {
  AddressOtherProperties,
  IPv6SubmaskKnownProperties,
} from "../types/otherProperties.ts";
import {
  generateSubmaskFromCidr,
  generateSubmaskFromHosts,
} from "./functions.ts";
import { Submask } from "./submask.ts";

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
