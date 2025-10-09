import { Address } from "./address.ts";
import {
  addressEquals,
  binaryStringToUint,
  byteArrayToUint16Array,
  hasZoneId,
  hexStringToUint,
  isCorrectAddress,
  isCorrectPort,
  isIP6ArpaString,
  isIPv4StringAddress,
  memoize,
  parseIPv4Address,
  parseIPv4Url,
  parseIPv6Address,
  parseIPv6Url,
  stringifyIPv4Address,
  stringifyIPv6Address,
  uint16ArrayToByteArray,
  verifyZoneId,
} from "./common.ts";
import { IPv4Context, IPv6Context } from "./context.ts";
import { Mapped, Teredo } from "./tunneling.ts";
import {
  IncorrectAddressError,
  NonImplementedStaticMethodError,
} from "./error.ts";
import { IPv4Submask, IPv6Submask } from "./submask.ts";
import type {
  AddressArrayForVersion,
  AddressOtherProperties,
  AddressVersions,
  AllAddressKnownProperties,
  ContextTypeForVersion,
  IPv4AddressClasses,
  IPv4AddressOtherProperties,
  IPv6AddressOtherProperties,
  NumberTypeForVersion,
  TeredoDatas,
  TunnelingModeParams4To6,
  TunnelingModes,
  TunnelingModeWithoutParams4To6,
  TunnelingModeWithParams4To6,
} from "./types.ts";
import { arrayToUint, UintToArray } from "./uint.ts";

/**
 * Abstract class representing an IP address (IPv4 or IPv6).
 * Provides methods to check address properties and create network contexts.
 *
 * @template AddressArray - The typed array used to store the address (Uint8Array for IPv4, Uint16Array for IPv6)
 * @template NumberType - The numeric type used for integer representation (number for IPv4, bigint for IPv6)
 */
export abstract class IPAddress<
  Version extends AddressVersions,
> extends Address<Version> {
  static fromURL(_url: string): IPAddress<AddressVersions> {
    throw new NonImplementedStaticMethodError();
  }

  /**
   * Port
   */
  protected _port?: number;
  /**
   * Protocol (for example: http,https,ftp,...)
   */
  public protocol?: string;

  get port(): number | undefined {
    return this._port;
  }

  set port(value: number | undefined) {
    if (value !== undefined && !isCorrectPort(value)) {
      throw new Error();
    }
    this._port = value;
  }

  /**
   * Constructor of IPAddress abstract class
   *
   * @param version IP version of this address
   * @param items Array representing this address
   */
  constructor(
    version: Version,
    items: number[] | AddressArrayForVersion<Version>,
    otherProperties: AddressOtherProperties<AllAddressKnownProperties> = {},
  ) {
    super(version, items, undefined, otherProperties);
  }

  /**
   * Checks if this address is a loopback address.
   *
   * @returns {boolean} True if the address is a loopback address, false otherwise
   */
  abstract isLoopback(): boolean;

  /**
   * Creates a network context for this address with the given submask.
   *
   * @param submask - Submask as array, string, or CIDR value
   * @returns {Context} New network context instance
   */
  abstract createContextWithSubmask(
    submask: AddressArrayForVersion<Version> | string | number,
  ): ContextTypeForVersion<Version>;

  /**
   * Creates a network context for this address with the given number of hosts.
   *
   * @param hosts - Desired number of hosts in the subnet
   * @returns {Context} New network context instance
   */
  abstract createContextWithHosts(
    hosts: NumberTypeForVersion<Version>,
  ): ContextTypeForVersion<Version>;

  /**
   * Get the url from the protocol, address and port.
   *
   * @returns {string} URL
   */
  abstract toURL(): string;
}

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
   * const ip=IPv4Address.fromURL("http://192.168.1.1:8080");
   * console.log(ip.toString()); // "192.168.1.1"
   * console.log(ip.port); // 8080
   * console.log(ip.protocol); // "http"
   * ```
   *
   * @example Use without protocol
   *
   * ```ts
   * import { IPv4Address } from "@viviengraffin/ip-context";
   *
   * const ip=IPv4Address.fromURL("192.168.1.1:8080");
   * console.log(ip.toString()); // "192.168.1.1"
   * console.log(ip.port); // 8080
   * console.log(ip.protocol); // undefined
   * ```
   *
   * @example Use without port
   *
   * ```ts
   * import { IPv4Address } from "@viviengraffin/ip-context";
   *
   * const ip=IPv4Address.fromURL("http://192.168.1.1");
   * console.log(ip.toString()); // "192.168.1.1"
   * console.log(ip.port); // undefined
   * console.log(ip.protocol); // "http"
   * ```
   */
  static override fromURL(url: string): IPv4Address {
    const { protocol, address, port } = parseIPv4Url(url);
    const res = this.fromString(address);
    res.protocol = protocol;
    res.port = port;
    return res;
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
   * Returns the address as a byte array.
   *
   * @returns {Uint8Array} Byte array representation of the address
   */
  override toByteArray(): Uint8Array {
    return this.array;
  }

  /**
   * Get the url from the protocol, address and port.
   *
   * @returns {string} URL
   */
  override toURL(): string {
    return (this.protocol !== undefined ? this.protocol + "://" : "") +
      this.toString() + (this.port !== undefined ? ":" + this.port : "");
  }
}

/**
 * Class representing an IPv6 address.
 * Provides methods to create, validate, and manipulate IPv6 addresses.
 */
export class IPv6Address extends IPAddress<6> {
  /**
   * Creates an IPv6Address from a string representation.
   *
   * @param string - String representation of the IPv6 address (for example: "2001:db8::1" or "2001:db8::1%eth0")
   * @returns {IPv6Address} New IPv6Address instance
   */
  static override fromString(string: string): IPv6Address {
    const splittedIP = hasZoneId(string);
    return splittedIP === null
      ? new IPv6Address(parseIPv6Address(string))
      : new IPv6Address(parseIPv6Address(splittedIP[0]), {
        zoneId: splittedIP[1],
      });
  }

  protected _ipv4MappedString?: string;

  /**
   * Creates an IPv6Address from an IPv4-mapped string
   *
   * @param string IPv4-mapped string representation
   * @returns {IPv6Address} New IPv6Address instance
   */
  static fromIPv4MappedString(string: string): IPv6Address {
    const splittedIP = hasZoneId(string);
    return splittedIP === null
      ? Mapped.fromString(string)
      : Mapped.fromString(splittedIP[0], splittedIP[1]);
  }

  /**
   * Creates an IPv6Address from a 128-bit unsigned integer.
   *
   * @param uint - 128-bit unsigned integer representation of the address
   * @param zoneId - Optional zone identifier
   * @returns {IPv6Address} New IPv6Address instance
   */
  static override fromUint(
    uint: bigint,
    zoneId?: string,
    _ip6ArpaString?: string,
  ): IPv6Address {
    return new this(UintToArray(6, uint), {
      zoneId,
      knownProperties: {
        _uint: uint,
        _ip6ArpaString,
      },
    });
  }

  /**
   * Creates an IPv6Address from a byte array.
   *
   * @param bytes - Uint8Array representing the address
   * @param zoneId - Optional zone identifier
   * @returns {IPv6Address} New IPv6Address instance
   * @throws {IncorrectAddressError} If the byte array is not 16 bytes long
   */
  static override fromByteArray(
    bytes: Uint8Array,
    zoneId?: string,
  ): IPv6Address {
    if (bytes.length !== 16) {
      throw new IncorrectAddressError({
        type: "incorrect-format",
        version: 6,
        address: bytes,
      });
    }
    return new this(byteArrayToUint16Array(bytes), {
      zoneId,
      knownProperties: {
        _byteArray: bytes,
      },
    });
  }

  /**
   * Create an IPv6Address instance from a binary string representation
   *
   * @param binaryString Binary string representation
   */
  static override fromBinaryString(binaryString: string): IPv6Address {
    return this.fromUint(binaryStringToUint(6, binaryString));
  }

  /**
   * Create an IPv6Address from an hex string representation
   *
   * @param hexString Hex string representation of the IPv4 address
   * @returns {IPv6Address} New IPv4Address instance
   */
  static override fromHexString(
    hexString: string,
    zoneId?: string,
  ): IPv6Address {
    return this.fromUint(hexStringToUint(6, hexString), zoneId);
  }

  /**
   * Checks if the given address is a valid IPv6 address.
   *
   * @param address - Address to validate (as array or string)
   * @returns {boolean} True if valid, false otherwise
   */
  static override isValidAddress(address: number[] | string): boolean {
    if (typeof address === "string") {
      try {
        address = parseIPv6Address(address, true);
      } catch (_e) {
        return false;
      }
    }

    return isCorrectAddress(6, address).valid;
  }

  /**
   * Create an IPv6Address from an ip6.arpa string representation.
   * See [RFC 3596](https://datatracker.ietf.org/doc/html/rfc3596)
   *
   * @param string - ip6.arpa string representation
   * @returns {IPv6Address} New instance of IPv6Address
   */
  static fromIP6ArpaString(string: string): IPv6Address {
    string = string.toLowerCase();
    let zoneId: string | undefined = undefined;
    const rHasZoneId = hasZoneId(string);
    if (rHasZoneId !== null) {
      string = rHasZoneId[0];
      zoneId = rHasZoneId[1];
    }
    if (!isIP6ArpaString(string)) {
      throw new IncorrectAddressError({
        type: "incorrect-format",
        version: 6,
        address: string,
      });
    }

    const parts = string.replace(".ip6.arpa", "").split(".");

    if (parts.length !== 32) {
      throw new IncorrectAddressError({
        type: "incorrect-format",
        version: 6,
        address: string,
      });
    }
    let uint = 0n;
    for (let i = 31; i >= 0; i--) {
      const n = BigInt("0x" + parts[i]);
      uint = (uint << 4n) | n;
    }
    return this.fromUint(uint, zoneId, string);
  }

  /**
   * Get an IPv6Address instance from an URL string
   *
   * @param url URL to parse
   * @returns {IPv6Address} New IPv6Address instance
   *
   * @example Use with complete URL
   *
   * ```ts
   * import { IPv6Address } from "@viviengraffin/ip-context";
   *
   * const ip=IPv6Address.fromURL("http://[2001:db6::1]:8080");
   * console.log(ip.toString()); // "2001:db6::1"
   * console.log(ip.port); // 8080
   * console.log(ip.protocol); // "http"
   * ```
   *
   * @example Use without protocol
   *
   * ```ts
   * import { IPv6Address } from "@viviengraffin/ip-context";
   *
   * const ip=IPv6Address.fromURL("[2001:db6::1]:8080");
   * console.log(ip.toString()); // "2001:db6::1"
   * console.log(ip.port); // 8080
   * console.log(ip.protocol); // undefined
   * ```
   *
   * @example Use without port
   *
   * ```ts
   * import { IPv6Address } from "@viviengraffin/ip-context";
   *
   * const ip=IPv6Address.fromURL("http://[2001:db6::1]");
   * console.log(ip.toString()); // "2001:db6::1"
   * console.log(ip.port); // undefined
   * console.log(ip.protocol); // "http"
   * ```
   */
  static override fromURL(url: string): IPv6Address {
    const { protocol, address, port } = parseIPv6Url(url);
    const res = this.fromString(address);
    res.port = port;
    res.protocol = protocol;
    return res;
  }

  /**
   * Check if the addresses are the same
   *
   * @param a Address to compare
   * @param b Address to compare
   * @returns {boolean} True if these addresses are the same, false otherwise.
   */
  static override equals(a: IPv6Address, b: IPv6Address): boolean {
    return addressEquals<6>(a.array, b.array);
  }

  protected _ip6ArpaString?: string;
  protected _byteArray?: Uint8Array;
  /**
   * Gets the zone identifier of this IPv6 address.
   *
   * @returns {string | null} The zone identifier, or null if none
   */
  public readonly zoneId: string | null;

  /**
   * Creates a new IPv6Address instance.
   *
   * @param items - Array or Uint16Array representing the address
   * @param zoneId - Optional zone identifier
   * @throws {IncorrectAddressError} If the zone identifier is invalid
   */
  constructor(
    items: number[] | AddressArrayForVersion<6>,
    otherProperties: IPv6AddressOtherProperties = {},
  ) {
    super(6, items, otherProperties);
    if (otherProperties.zoneId !== undefined) {
      if (!verifyZoneId(otherProperties.zoneId)) {
        throw new IncorrectAddressError({
          type: "incorrect-zone-id",
          zoneId: otherProperties.zoneId,
        });
      }
      this.zoneId = otherProperties.zoneId;
    } else {
      this.zoneId = null;
    }

    if (otherProperties.knownProperties !== undefined) {
      if (otherProperties.knownProperties._byteArray !== undefined) {
        this._byteArray = otherProperties.knownProperties._byteArray;
      }
      if (otherProperties.knownProperties._ipv4MappedString !== undefined) {
        this._ipv4MappedString =
          otherProperties.knownProperties._ipv4MappedString;
      }
      if (otherProperties.knownProperties._ip6ArpaString !== undefined) {
        this._ip6ArpaString = otherProperties.knownProperties._ip6ArpaString;
      }
    }
  }

  /**
   * Returns the string representation of this IPv6 address.
   *
   * @param displayZoneId - If true, includes the zone identifier in the string (default: true for link-local addresses)
   * @returns {string} String representation (for example: "2001:db8::1" or "2001:db8::1%eth0")
   */
  override toString(displayZoneId: boolean = this.isLocalLink()): string {
    return memoize(
      this._string,
      () => this._string = stringifyIPv6Address(this.array),
      () =>
        (this._string as string) +
        (displayZoneId && this.zoneId !== null ? "%" + this.zoneId : ""),
    );
  }

  /**
   * Returns the IPv4-mapped string representation of this address.
   *
   * @returns {string} IPv4-mapped string representation (for example: "::ffff:192.168.1.1")
   */
  toIPv4MappedString(): string {
    return memoize(
      this._ipv4MappedString,
      () => this._ipv4MappedString = Mapped.toString(this),
      () => this._ipv4MappedString!,
    );
  }

  /**
   * Returns the 128-bit unsigned integer representation of this IPv6 address.
   *
   * @returns {bigint} 128-bit unsigned integer
   */
  override toUint(): bigint {
    return memoize(
      this._uint,
      () => this._uint = arrayToUint(6, this.array),
      () => this._uint!,
    );
  }

  /**
   * Checks if this IPv6 address is tunneling an IPv4 address using the specified conversion mode.
   *
   * @param conversionMode - Conversion mode (for example: "mapped", "6to4", "teredo", "auto")
   * @param params - Optional parameters for the conversion (for example: 6rd prefix)
   * @returns {boolean} True if the address is tunneling an IPv4 address, false otherwise
   */
  isIPv4Tunneling<T extends TunnelingModes>(conversionMode: T): boolean {
    return conversionMode.isValid(this);
  }

  /**
   * Converts this IPv6 address to an IPv4 address if it is tunneling one.
   *
   * @param conversionMode - Conversion mode
   * @returns {IPv4Address} New IPv4Address instance
   * @throws {IncorrectAddressError} If the address is not tunneling an IPv4 address
   *
   * @example Use with mapped
   *
   * ```ts
   * import { IPv6Address } from "@viviengraffin/ip-context";
   *
   * const ip6=IPv6Address.fromIPv4MappedString("::ffff:192.168.1.1");
   * const ip4=ip6.toIPv4Address(TUNNELING_MODES.MAPPED); // IPv4Address
   * console.log(ip4.toString()); // "192.168.1.1"
   * ```
   *
   * @example Use with 6to4
   *
   * ```ts
   * import { IPv6Address } from "@viviengraffin/ip-context";
   *
   * const ip6=IPv6Address.fromString("2002:c0a8:101::");
   * const ip4=ip6.toIPv4Address(TUNNELING_MODES.SIX_TO_FOUR); // IPv4Address
   * console.log(ip4.toString()); // "192.168.1.1"
   * ```
   */
  toIPv4Address(tunnelingMode: TunnelingModes): IPv4Address {
    return tunnelingMode.toIPv4(this);
  }

  /**
   * Checks if this address is a loopback address.
   *
   * @returns {boolean} True if the address is a loopback address, false otherwise
   */
  override isLoopback(): boolean {
    return this.toUint() === 1n;
  }

  /**
   * Checks if this address is a link-local address.
   *
   * @returns {boolean} True if the address is link-local, false otherwise
   */
  isLocalLink(): boolean {
    return (this.array[0] & 0b1111111111000000) === 0xFE80;
  }

  /**
   * Checks if this address is a multicast address.
   *
   * @returns {boolean} True if the address is multicast, false otherwise
   */
  isMulticast(): boolean {
    return (this.array[0] >> 8) === 0xFF;
  }

  /**
   * Checks if this address is a unique local address.
   *
   * @returns {boolean} True if the address is unique local, false otherwise
   */
  isUniqueLocal(): boolean {
    return (this.array[0] >> 8) === 0xFD;
  }

  /**
   * Checks if this address is a unicast address.
   *
   * @returns {boolean} True if the address is unicast, false otherwise
   */
  isUnicast(): boolean {
    return (this.array[0] & 0b1110000000000000) === 0x2000;
  }

  /**
   * Checks if this address is a reserved address.
   *
   * @returns {boolean} True if the address is reserved, false otherwise
   */
  isReserved(): boolean {
    return (this.array[0] >> 8) === 0;
  }

  /**
   * Creates a network context for this address with the given number of hosts.
   *
   * @param hosts - Desired number of hosts in the subnet
   * @returns {IPv6Context} New network context instance
   */
  override createContextWithHosts(hosts: bigint): IPv6Context {
    const submask = IPv6Submask.fromHosts(hosts);
    return new IPv6Context(this, submask);
  }

  /**
   * Creates a network context for this address with the given submask.
   *
   * @param submask - Submask as array, string, or CIDR value
   * @returns {IPv6Context} New network context instance
   */
  override createContextWithSubmask(
    submask: string | number | Uint16Array,
  ): IPv6Context {
    let cSubmask: IPv6Submask;
    switch (typeof submask) {
      case "string":
        cSubmask = IPv6Submask.fromString(submask);
        break;
      case "number":
        cSubmask = IPv6Submask.fromCidr(submask);
        break;
      default:
        cSubmask = new IPv6Submask(submask);
    }

    return new IPv6Context(this, cSubmask);
  }

  /**
   * Returns the address as a byte array.
   *
   * @returns {Uint8Array} Byte array representation of the address
   */
  override toByteArray(): Uint8Array {
    return memoize(
      this._byteArray,
      () => this._byteArray = uint16ArrayToByteArray(this.array),
      () => this._byteArray!,
    );
  }

  /**
   * Get the ip6.arpa representation of this address.
   * See [RFC 3596](https://datatracker.ietf.org/doc/html/rfc3596)
   *
   * @returns {string} ip6.arpa representation of this address
   */
  toIP6ArpaString(): string {
    return memoize(
      this._ip6ArpaString,
      () => {
        const hexString = this.toHexString();
        const chars: string[] = new Array(32);
        let index = 0;
        for (let i = 31; i >= 0; i--) {
          chars[index++] = hexString[i];
        }

        this._ip6ArpaString = chars.join(".") + ".ip6.arpa";
      },
      () => this._ip6ArpaString!,
    );
  }

  /**
   * Get the url from the protocol, address and port.
   *
   * @returns {string} URL
   */
  override toURL(): string {
    return (this.protocol !== undefined ? this.protocol + "://" : "") + "[" +
      this.toString() + "]" + (this.port !== undefined ? ":" + this.port : "");
  }
}

/**
 * Creates an IP address (IPv4 or IPv6) from a string representation.
 *
 * @param ip - String representation of the IP address (for example:. "192.168.1.1" or "2001:db8::1")
 * @returns {IPv4Address | IPv6Address} New IP address instance
 *
 * @example Use with IPv4
 *
 * ```ts
 * import { ip } from "@viviengraffin/ip-context";
 *
 * const ip4=ip("192.168.1.1"); // Instance of IPv4Address
 * ```
 *
 * @example Use with IPv6
 *
 * ```ts
 * import { ip } from "@viviengraffin/ip-context";
 *
 * const ip6=ip("2001:db6::1"); // Instance of IPv6Address
 * ```
 *
 * @example Use with IPv4-mapped string
 *
 * ```ts
 * import { ip } from "@viviengraffin/ip-context";
 *
 * const ip6=ip("::ffff:192.168.1.1"); // Instance of IPv6Address
 * ```
 *
 * @example Use with ip6.arpa string
 *
 * ```ts
 * import { ip } from "@viviengraffin/ip-context";
 *
 * const ip6=ip("b.a.9.8.7.6.5.0.4.0.0.0.3.0.0.0.2.0.0.0.1.0.0.0.0.0.0.0.1.2.3.4.ip6.arpa"); // Instance of IPv6Address
 * ```
 */
export function ip(ip: string): IPv4Address | IPv6Address {
  if (isIP6ArpaString(ip.toLowerCase())) {
    return IPv6Address.fromIP6ArpaString(ip);
  }
  if (Mapped.isValidString(ip)) {
    return IPv6Address.fromIPv4MappedString(ip);
  }
  if (isIPv4StringAddress(ip)) {
    return IPv4Address.fromString(ip);
  } else {
    return IPv6Address.fromString(ip);
  }
}

/**
 * Checks if the given string is a valid IP address (IPv4 or IPv6).
 *
 * @param ip - String to validate
 * @returns {boolean} True if the string is a valid IP address, false otherwise
 */
export function isValidAddress(ip: string): boolean {
  try {
    if (Mapped.isValidString(ip)) {
      return true;
    }
    if (isIPv4StringAddress(ip)) {
      return IPv4Address.isValidAddress(ip);
    } else {
      return IPv6Address.isValidAddress(ip);
    }
  } catch (_e) {
    return false;
  }
}

/**
 * Map of IP version to corresponding address constructor.
 * Useful for dynamically creating IP addresses based on version.
 */
export const ADDRESS_CONSTRUCTORS = {
  4: IPv4Address,
  6: IPv6Address,
} as const satisfies Record<
  AddressVersions,
  typeof IPv4Address | typeof IPv6Address
>;
