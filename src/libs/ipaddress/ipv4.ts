import { IPAddress } from "./ipaddress.ts";
import { IPv4Context } from "../context.ts";
import { IncorrectAddressError } from "../error.ts";
import { isCorrectAddress } from "../functions/check.ts";
import { addressEquals, memoize } from "../functions/common.ts";
import {
  binaryStringToUint,
  hexStringToUint,
} from "../functions/conversion.ts";
import { parseIPv4Address, parseUrl } from "../functions/parsing.ts";
import { stringifyIPv4Address } from "../functions/stringify.ts";
import { arrayToUint, UintToArray } from "../functions/uint.ts";
import { IPURL } from "../ipurl.ts";
import { IPv4Submask } from "../submask/index.ts";
import { Teredo } from "../tunneling/teredo.ts";
import type {
  AddressArrayForVersion,
  IPv4AddressClasses,
} from "../types/address.ts";
import type { IPv4AddressOtherProperties } from "../types/otherProperties.ts";
import type {
  TeredoDatas,
  TunnelingModeParams4To6,
  TunnelingModes,
  TunnelingModeWithoutParams4To6,
  TunnelingModeWithParams4To6,
} from "../types/tunneling.ts";
import type { IPv6Address } from "./ipv6.ts";

/**
 * Class representing an IPv4 address.
 * Provides methods to create, validate, and manipulate IPv4 addresses.
 */
export class IPv4Address extends IPAddress<4> {
  /**
   * Creates an IPv4Address from a string representation.
   *
   * @param string - String representation of the IPv4 address (for example: "192.168.1.1")
   * @returns {IPv4Address} New IPv4Address instance
   */
  static override fromString(string: string): IPv4Address {
    return new IPv4Address(parseIPv4Address(string), {
      check: false,
    });
  }

  /**
   * Create an Address instance from a binary string representation
   *
   * @param binaryString Binary string representation
   */
  static override fromBinaryString(binaryString: string): IPv4Address {
    return this.fromUint(binaryStringToUint(4, binaryString));
  }

  /**
   * Create an IPv4Address from an hex string representation
   *
   * @param hexString Hex string representation of the IPv4 address
   * @returns {IPv4Address} New IPv4Address instance
   */
  static override fromHexString(hexString: string): IPv4Address {
    return this.fromUint(hexStringToUint(4, hexString));
  }

  /**
   * Checks if the given address is a valid IPv4 address.
   *
   * @param address - Address to validate (as array or string)
   * @returns {boolean} True if valid, false otherwise
   */
  static override isValidAddress(address: number[] | string): boolean {
    if (typeof address === "string") {
      address = address.split(".").map(Number);
    }

    return isCorrectAddress(4, address).valid;
  }

  /**
   * Creates an IPv4Address from a 32-bit unsigned integer.
   *
   * @param uint - 32-bit unsigned integer representation of the address
   * @returns {IPv4Address} New IPv4Address instance
   */
  static override fromUint(uint: number): IPv4Address {
    return new this(UintToArray(4, uint), {
      check: false,
      knownProperties: {
        _uint: uint,
      },
    });
  }

  /**
   * Creates an IPv4Address from a byte array.
   *
   * @param bytes - Uint8Array representing the address
   * @returns {IPv4Address} New IPv4Address instance
   * @throws {IncorrectAddressError} If the byte array is not 4 bytes long
   */
  static override fromByteArray(bytes: Uint8Array): IPv4Address {
    if (bytes.length !== 4) {
      throw new IncorrectAddressError({
        type: "incorrect-format",
        version: 4,
        address: bytes,
      });
    }
    return new this(bytes, { check: false });
  }

  /**
   * Get an IPv4Address instance from an URL string
   *
   * @param url URL to parse
   * @returns {IPv4Address} New IPv4Address instance
   *
   * @example Use with complete URL
   *
   * ```ts
   * import { IPv4Address } from "@viviengraffin/ip-context";
   *
   * const url=IPv4Address.fromURL("http://192.168.1.1:8080");
   * console.log(url.address.toString()); // "192.168.1.1"
   * console.log(url.port); // 8080
   * console.log(url.protocol); // "http"
   * ```
   *
   * @example Use without protocol
   *
   * ```ts
   * import { IPv4Address } from "@viviengraffin/ip-context";
   *
   * const url=IPv4Address.fromURL("192.168.1.1:8080");
   * console.log(url.address.toString()); // "192.168.1.1"
   * console.log(url.port); // 8080
   * console.log(url.protocol); // undefined
   * ```
   *
   * @example Use without port
   *
   * ```ts
   * import { IPv4Address } from "@viviengraffin/ip-context";
   *
   * const url=IPv4Address.fromURL("http://192.168.1.1");
   * console.log(url.address.toString()); // "192.168.1.1"
   * console.log(url.port); // undefined
   * console.log(url.protocol); // "http"
   * ```
   */
  static override fromURL(url: string): IPURL<IPv4Address> {
    const { protocol, address: addressString, port, pathname, search, hash } =
      parseUrl(4, url);
    const address = this.fromString(addressString);
    return new IPURL(address, protocol, port, pathname, search, hash);
  }

  /**
   * Check if the addresses are the same
   *
   * @param a Address to compare
   * @param b Address to compare
   * @returns {boolean} True if these addresses are the same, false otherwise.
   */
  static override equals(a: IPv4Address, b: IPv4Address): boolean {
    return addressEquals<4>(a.array, b.array);
  }

  /**
   * Creates a new IPv4Address instance.
   *
   * @param items - Array or Uint8Array representing the address
   */
  constructor(
    items: number[] | AddressArrayForVersion<4>,
    otherProperties: IPv4AddressOtherProperties = {},
  ) {
    super(4, items, otherProperties);
  }

  /**
   * Gets the class (A, B, C, D, or E) of this IPv4 address.
   *
   * @returns {IPv4AddressClasses} The address class
   */
  get class(): IPv4AddressClasses {
    const firstItem = this.array[0];

    if (firstItem < 128) return "A";
    if (firstItem < 192) return "B";
    if (firstItem < 224) return "C";
    if (firstItem < 240) return "D";

    return "E";
  }

  /**
   * Returns the string representation of this IPv4 address.
   *
   * @returns {string} String representation (for example: "192.168.1.1")
   */
  override toString(): string {
    return memoize(
      this._string,
      () => this._string = stringifyIPv4Address(this.array),
      () => this._string as string,
    );
  }

  /**
   * Returns the 32-bit unsigned integer representation of this IPv4 address.
   *
   * @returns {number} 32-bit unsigned integer
   */
  override toUint(): number {
    if (this._uint === undefined) {
      this._uint = arrayToUint(4, this.array);
    }
    return this._uint as number;
  }

  /**
   * Converts this IPv4 address to an IPv6 address using the specified conversion mode.
   *
   * @param conversionMode - Conversion mode (for example: TUNNELING_MODES.TEREDO)
   * @param params - Parameters for the conversion (for example: teredo params)
   * @returns {IPv6Address} New IPv6Address instance
   * @throws {IncorrectAddressError} If the conversion mode is not supported
   */
  toIPv6Address<T extends TunnelingModeWithParams4To6>(
    tunnelingMode: T,
    params: TunnelingModeParams4To6<T>,
  ): IPv6Address;
  /**
   * Converts this IPv4 address to an IPv6 address using the specified conversion mode.
   *
   * @param tunnelingMode - Conversion mode (for example: TUNNELING_MODES.MAPPED,TUNNELING_MODES.SIX_TO_FOUR)
   * @returns {IPv6Address} New IPv6Address instance
   * @throws {IncorrectAddressError} If the conversion mode is not supported
   */
  toIPv6Address(tunnelingMode: TunnelingModeWithoutParams4To6): IPv6Address;
  toIPv6Address(
    tunnelingMode: TunnelingModes,
    params?: TeredoDatas,
  ): IPv6Address {
    return tunnelingMode === Teredo
      ? Teredo.toIPv6(this, params!)
      : (tunnelingMode as TunnelingModeWithoutParams4To6).toIPv6(this);
  }

  /**
   * Checks if this address is a loopback address
   *
   * @returns {boolean} True if the address is loopback, false otherwise
   */
  override isLoopback(): boolean {
    return this.toUint() === 2130706433;
  }

  /**
   * Checks if this address is a private address.
   *
   * @returns {boolean} True if the address is private, false otherwise
   */
  isPrivate(): boolean {
    return this.array[0] === 10 ||
      (this.array[0] === 172 && (this.array[1] & 0b11110000) === 16) ||
      (this.array[0] === 192 && this.array[1] === 168);
  }

  /**
   * Checks if this address is a multicast address.
   *
   * @returns {boolean} True if the address is multicast, false otherwise
   */
  isMulticast(): boolean {
    return (this.array[0] & 0b11110000) === 224;
  }

  /**
   * Creates a network context for this address with the given number of hosts.
   *
   * @param hosts - Desired number of hosts in the subnet
   * @returns {IPv4Address} New network context instance
   *
   * @example
   *
   * ```ts
   * import { IPv4Address } from "@viviengraffin/ip-context";
   *
   * const ip=IPv4Address.fromString("192.168.1.1");
   * const ctx=ip.createContextWithHosts(10_000);
   * console.log(ctx.hosts); // 16_382
   * ```
   */
  override createContextWithHosts(hosts: number): IPv4Context {
    const submask = IPv4Submask.fromHosts(hosts);
    return new IPv4Context(this, submask);
  }

  /**
   * Creates a network context for this address with the given submask.
   *
   * @param submask - Submask as array, string, or CIDR value
   * @returns {IPv4Context} New network context instance
   *
   * @example Use with IPv4 submask string
   *
   * ```ts
   * import { IPv4Address } from "@viviengraffin/ip-context";
   *
   * const ip=IPv4Address.fromString("192.168.1.1");
   * const ctx=ip.createContextWithSubmask("255.255.255.0");
   * console.log(ctx.size); // 256
   * ```
   *
   * @example Use with Cidr
   *
   * ```ts
   * import { IPv4Address } from "@viviengraffin/ip-context";
   *
   * const ip=IPv4Address.fromString("192.168.1.1");
   * const ctx=ip.createContextWithSubmask(24);
   * console.log(ctx.size); // 256
   * ```
   *
   * @example Use with Uint8Array
   *
   * ```ts
   * import { IPv4Address } from "@viviengraffin/ip-context";
   *
   * const ip=IPv4Address.fromString("192.168.1.1");
   * const ctx=ip.createContextWithSubmask(new Uint8Array([255,255,255,0]));
   * console.log(ctx.size); // 256
   * ```
   */
  override createContextWithSubmask(
    submask: string | number | Uint8Array,
  ): IPv4Context {
    let cSubmask: IPv4Submask;
    switch (typeof submask) {
      case "string":
        cSubmask = IPv4Submask.fromString(submask);
        break;
      case "number":
        cSubmask = IPv4Submask.fromCidr(submask);
        break;
      default:
        cSubmask = new IPv4Submask(submask);
    }

    return new IPv4Context(this, cSubmask);
  }

  /**
   * Creates a network context for this address with the class of this address.
   *
   * @example Use with a class A IPv4Address
   *
   * ```ts
   * import { IPv4Address } from "@viviengraffin/ip-context";
   *
   * const ip=IPv4Address.fromString("10.0.0.1");
   * const ctx=ip.createContextFromClass();
   * console.log(ctx.size); // 16777216
   * ```
   *
   * @example Use with a class B IPv4Address
   *
   * ```ts
   * import { IPv4Address } from "@viviengraffin/ip-context";
   *
   * const ip=IPv4Address.fromString("172.16.0.1");
   * const ctx=ip.createContextFromClass();
   * console.log(ctx.size); // 65536
   * ```
   *
   * @example Use with a class C IPv4Address
   *
   * ```ts
   * import { IPv4Address } from "@viviengraffin/ip-context";
   *
   * const ip=IPv4Address.fromString("192.168.1.1");
   * const ctx=ip.createContextFromClass();
   * console.log(ctx.size); // 256
   * ```
   *
   * @example Use with a class D or E IPv4Address
   *
   * ```ts
   * import { IPv4Address } from "@viviengraffin/ip-context";
   *
   * const ip=IPv4Address.fromString("224.0.0.1");
   * const ctx=ip.createContextFromClass(); // it returns null
   * ```
   */
  createContextFromClass(): IPv4Context | null {
    const submask = IPv4Submask.fromClass(this.class);
    if (submask === null) {
      return null;
    }

    return new IPv4Context(this, submask);
  }

  /**
   * Returns the address as a byte array.
   *
   * @returns {Uint8Array} Byte array representation of the address
   */
  override toByteArray(): Uint8Array {
    return this.array;
  }
}
