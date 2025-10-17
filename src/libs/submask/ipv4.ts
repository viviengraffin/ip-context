import { IPv4_CLASS_TO_SUBMASK } from "../const.ts";
import { isCorrectSubmask } from "../functions/check.ts";
import { addressEquals, memoize } from "../functions/common.ts";
import {
  binaryStringToUint,
  hexStringToUint,
} from "../functions/conversion.ts";
import { parseIPv4Address } from "../functions/parsing.ts";
import { stringifyIPv4Address } from "../functions/stringify.ts";
import { arrayToUint, UintToArray } from "../functions/uint.ts";
import type { IPv4AddressClasses } from "../types/address.ts";
import type {
  AddressOtherProperties,
  SubmaskKnownProperties,
} from "../types/otherProperties.ts";
import {
  generateSubmaskFromCidr,
  generateSubmaskFromHosts,
} from "./functions.ts";
import { Submask } from "./submask.ts";

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
