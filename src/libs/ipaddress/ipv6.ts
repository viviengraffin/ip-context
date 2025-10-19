import { IPAddress } from "./ipaddress.ts";
import { IPv6Context } from "../context.ts";
import { IncorrectAddressError } from "../error.ts";
import {
  getIPv6AddressStringType,
  isCorrectAddress,
  verifyZoneId,
} from "../functions/check.ts";
import { addressEquals, memoize } from "../functions/common.ts";
import {
  binaryStringToUint,
  byteArrayToUint16Array,
  hexStringToUint,
  uint16ArrayToByteArray,
} from "../functions/conversion.ts";
import {
  getIP6ArpaStringParts,
  hasZoneId,
  parseIPv6Address,
  parseUrl,
} from "../functions/parsing.ts";
import { stringifyIPv6Address } from "../functions/stringify.ts";
import { arrayToUint, UintToArray } from "../functions/uint.ts";
import { IPURL } from "../ipurl.ts";
import { IPv6Submask } from "../submask/index.ts";
import { Mapped } from "../tunneling/mapped.ts";
import type { AddressArrayForVersion } from "../types/address.ts";
import type { IPv6AddressOtherProperties } from "../types/otherProperties.ts";
import type { TunnelingModes } from "../types/tunneling.ts";
import type { IPv4Address } from "./ipv4.ts";

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
    const [address, zoneId] = hasZoneId(string);
    return zoneId === undefined
      ? new IPv6Address(parseIPv6Address(address))
      : new IPv6Address(parseIPv6Address(address), {
        zoneId: zoneId,
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
    const [address, zoneId] = hasZoneId(string);
    return Mapped.fromString(address, zoneId);
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
   *
   * @example Use with RFC 3596 address example
   *
   * ```ts
   * import { IPv6Address } from "@viviengraffin/ip-context";
   *
   * const ip=IPv6Address.fromIP6ArpaString("b.a.9.8.7.6.5.0.4.0.0.0.3.0.0.0.2.0.0.0.1.0.0.0.0.0.0.0.1.2.3.4.ip6.arpa");
   * console.log(ip.toString()); // "4321::1:2:3:4:567:89ab"
   * ```
   */
  static fromIP6ArpaString(string: string): IPv6Address {
    string = string.toLowerCase();

    const parts = getIP6ArpaStringParts(string);

    if (parts === null) {
      throw new IncorrectAddressError({
        type: "incorrect-format",
        version: 6,
        address: string,
      });
    }

    const addressArray = new Uint16Array(8);
    let index = 0;

    for (let i = parts.length - 1; i > 0; i -= 4) {
      const a = Number("0x" + parts[i]);
      const b = Number("0x" + parts[i - 1]);
      const c = Number("0x" + parts[i - 2]);
      const d = Number("0x" + parts[i - 3]);

      if (
        !Number.isInteger(a) || !Number.isInteger(b) || !Number.isInteger(c) ||
        !Number.isInteger(d)
      ) {
        throw new IncorrectAddressError({
          type: "incorrect-format",
          version: 6,
          address: string,
        });
      }

      addressArray[index++] = (((((a << 4) | b) << 4) | c) << 4) | d;
    }

    return new IPv6Address(addressArray, {
      check: false,
      knownProperties: { _ip6ArpaString: string },
    });
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
   * const url=IPv6Address.fromURL("http://[2001:db6::1]:8080");
   * console.log(url.address.toString()); // "2001:db6::1"
   * console.log(url.port); // 8080
   * console.log(url.protocol); // "http"
   * ```
   *
   * @example Use without protocol
   *
   * ```ts
   * import { IPv6Address } from "@viviengraffin/ip-context";
   *
   * const url=IPv6Address.fromURL("[2001:db6::1]:8080");
   * console.log(url.address.toString()); // "2001:db6::1"
   * console.log(url.port); // 8080
   * console.log(url.protocol); // undefined
   * ```
   *
   * @example Use without port
   *
   * ```ts
   * import { IPv6Address } from "@viviengraffin/ip-context";
   *
   * const url=IPv6Address.fromURL("http://[2001:db6::1]");
   * console.log(url.address.toString()); // "2001:db6::1"
   * console.log(url.port); // undefined
   * console.log(url.protocol); // "http"
   * ```
   */
  static override fromURL(url: string): IPURL<IPv6Address> {
    const { protocol, address: addressString, port, pathname, search, hash } =
      parseUrl(6, url);
    const type = getIPv6AddressStringType(addressString);
    let address: IPv6Address;
    switch (type) {
      case "ip6.arpa":
        address = this.fromIP6ArpaString(addressString);
        break;
      case "mapped":
        address = this.fromIPv4MappedString(addressString);
        break;
      case "normal":
        address = this.fromString(addressString);
        break;
      default:
        throw new IncorrectAddressError({
          type: "incorrect-format",
          version: 6,
          address: url,
        });
    }
    return new IPURL(address, protocol, port, pathname, search, hash);
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
   *
   * @example
   *
   * ```ts
   * import { IPv6Address } from "@viviengraffin/ip-context";
   *
   * const ip=IPv6Address.fromString("2001:db6::1");
   * const ctx=ip.createContextWithHosts(100_000_000n);
   * console.log(ctx.hosts); // 134217727n
   * ```
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
   *
   * ```ts
   * import { IPv6Address } from "@viviengraffin/ip-context";
   *
   * const ip=IPv6Address.fromString("2001:db6::1");
   * const ctx=ip.createContextWithSubmask("ffff:ffff:ffff:ffff::");
   * console.log(ctx.size); // 18446744073709551616n
   * ```
   *
   * @example Use with Cidr
   *
   * ```ts
   * import { IPv6Address } from "@viviengraffin/ip-context";
   *
   * const ip=IPv6Address.fromString("2001:db6::1");
   * const ctx=ip.createContextWithSubmask(64);
   * console.log(ctx.size); // 18446744073709551616n
   * ```
   *
   * @example Use with Uint16Array
   *
   * ```ts
   * import { IPv6Address } from "@viviengraffin/ip-context";
   *
   * const ip=IPv6Address.fromString("2001:db6::1");
   * const ctx=ip.createContextWithSubmask(new Uint16Array([0xFFFF,0xFFFF,0xFFFF,0xFFFF,0,0,0,0]));
   * console.log(ctx.size); // 18446744073709551616n
   * ```
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
   * Get type of this address
   *
   * @returns {string} string type representation
   */
  override getType():
    | "Link-local"
    | "Unicast"
    | "Reserved"
    | "Loopback"
    | "Unique Local"
    | "Multicast"
    | null {
    if (this.isLocalLink()) {
      return "Link-local";
    }
    if (this.isUnicast()) {
      return "Unicast";
    }
    if (this.isReserved()) {
      return "Reserved";
    }
    if (this.isLoopback()) {
      return "Loopback";
    }
    if (this.isUniqueLocal()) {
      return "Unique Local";
    }
    if (this.isMulticast()) {
      return "Multicast";
    }
    return null;
  }
}
