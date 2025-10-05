import {
  IncorrectAddressError,
  NonImplementedStaticMethodError,
} from "./error.ts";
import { IPv4Address, IPv6Address } from "./ipaddress.ts";
import type { Constructor, TeredoDatas, TunnelingModes } from "./types.ts";

/**
 * Copies the IPv4 part from an IPv6 address (Uint16Array) to a new IPv4Address.
 *
 * @param ipv6 - IPv6 address as Uint16Array
 * @param index - Starting index in the Uint16Array where the IPv4 part begins
 * @returns {IPv4Address} New IPv4Address instance
 */
function copyIPv6ToIPv4Address(
  ipv6: Uint16Array,
  index: number,
  operation: (word: number) => number = (word) => word,
): IPv4Address {
  const one = operation(ipv6[index]);
  const two = operation(ipv6[index + 1]);
  return new IPv4Address([
    one >> 8,
    one & 0xff,
    two >> 8,
    two & 0xff,
  ]);
}

type CopyIPv4ToIPv6AddressOperationCallback = (a: number, b: number) => number;

/**
 * Copies an IPv4 address (Uint8Array) into an IPv6 address (Uint16Array) at the specified index.
 *
 * @param ipv4 - IPv4 address as Uint8Array
 * @param ipv6 - IPv6 address as Uint16Array (will be modified)
 * @param index - Starting index in the Uint16Array where the IPv4 part should be copied
 * @returns {IPv6Address} New IPv6Address instance
 */
function copyIPv4ToIPv6Address(
  ipv4: Uint8Array,
  ipv6: Uint16Array,
  index: number,
): IPv6Address;
/**
 * Copies an IPv4 address (Uint8Array) into an IPv6 address (Uint16Array) at the specified index
 *
 * @param ipv4 - IPv4 address as Uint8Array
 * @param ipv6 - IPv6 address as Uint16Array (will be modified)
 * @param index - Starting index in the Uint16Array where the IPv4 part should be copied
 * @param getUint16Array - Define this function returns an Uint16Array
 * @returns {Uint16Array} Modified IPv6 as Uint16Array
 */
function copyIPv4ToIPv6Address(
  ipv4: Uint8Array,
  ipv6: Uint16Array,
  index: number,
  getUint16Array: true,
): Uint16Array;
/**
 * Copies an IPv4 address (Uint8Array) into an IPv6 address (Uint16Array) at the specified index
 *
 * @param ipv4 - IPv4 address as Uint8Array
 * @param ipv6 - IPv6 address as Uint16Array (will be modified)
 * @param index - Starting index in the Uint16Array where the IPv4 part should be copied
 * @param operation - Callback to define the operation for define the word
 * @returns {IPv6Address} New IPv6Address instance
 */
function copyIPv4ToIPv6Address(
  ipv4: Uint8Array,
  ipv6: Uint16Array,
  index: number,
  operation: CopyIPv4ToIPv6AddressOperationCallback,
): IPv6Address;
/**
 * Copies an IPv4 address (Uint8Array) into an IPv6 address (Uint16Array) at the specified index
 *
 * @param ipv4 - IPv4 address as Uint8Array
 * @param ipv6 - IPv6 address as Uint16Array (will be modified)
 * @param index - Starting index in the Uint16Array where the IPv4 part should be copied
 * @param operation - Callback to define the operation for define the word
 * @param getUint16Array - Define this function returns an Uint16Array
 * @returns {Uint16Array} Modified IPv6 as Uint16Array
 */
function copyIPv4ToIPv6Address(
  ipv4: Uint8Array,
  ipv6: Uint16Array,
  index: number,
  operation: CopyIPv4ToIPv6AddressOperationCallback,
  getUint16Array: true,
): Uint16Array;
function copyIPv4ToIPv6Address(
  ipv4: Uint8Array,
  ipv6: Uint16Array,
  index: number,
  operation: CopyIPv4ToIPv6AddressOperationCallback | boolean =
    copyIPv4ToIPv6AddressOperation,
  getUint16Array: boolean = false,
): IPv6Address | Uint16Array {
  if (typeof operation === "boolean") {
    getUint16Array = operation;
    operation = copyIPv4ToIPv6AddressOperation;
  }
  ipv6[index] = operation(ipv4[0], ipv4[1]);
  ipv6[index + 1] = operation(ipv4[2], ipv4[3]);
  return getUint16Array ? ipv6 : new IPv6Address(ipv6);
}

function copyIPv4ToIPv6AddressOperation(a: number, b: number): number {
  return (a << 8) | b;
}

/**
 * Abstract base class for IPv4/IPv6 conversion modes.
 * Provides static methods to check validity and perform conversions.
 */
export abstract class TunnelingMode {
  /**
   * Fills the given prefix into a full 8-element Uint16Array.
   *
   * @param prefix - The prefix to fill
   * @returns {Uint16Array} The filled prefix
   */
  static fillPrefix(prefix: Uint16Array | number[]): Uint16Array {
    const ipv6 = new Uint16Array(8);
    ipv6.set(prefix, 0);
    return ipv6;
  }

  /**
   * Checks if the given IPv6 address is valid for this conversion mode.
   *
   * @param ipv6 - IPv6 address as Uint16Array
   * @param params - Optional parameters for the conversion
   * @returns {boolean} True if valid, false otherwise
   */
  static isValid(_ipv6: IPv6Address, ..._otherArgs: unknown[]): boolean {
    throw new NonImplementedStaticMethodError();
  }

  /**
   * Converts the given IPv6 address to an IPv4 address.
   *
   * @param ipv6 - IPv6 address as Uint16Array
   * @param params - Optional parameters for the conversion
   * @returns {IPv4Address} New IPv4Address instance
   */
  static toIPv4(_ipv6: IPv6Address, ..._otherArgs: unknown[]): IPv4Address {
    throw new NonImplementedStaticMethodError();
  }

  /**
   * Converts the given IPv4 address to an IPv6 address.
   *
   * @param _ipv4 - IPv4 address as Uint8Array
   * @param _params - Optional parameters for the conversion
   * @returns {IPv6Address} New IPv6Address instance
   */
  static toIPv6(_ipv4: IPv4Address, ..._otherArgs: unknown[]): IPv6Address {
    throw new NonImplementedStaticMethodError();
  }
}

/**
 * IPv4-mapped IPv6 address conversion mode.
 * See [RFC 4291](https://tools.ietf.org/html/rfc4291#section-2.5.5.2)
 */
export class Mapped extends TunnelingMode {
  static override isValid(ipv6: IPv6Address): boolean {
    return ipv6.array.slice(0, 5).every((v) => v === 0) &&
      ipv6.array[5] === 0xffff;
  }

  static override toIPv4(ipv6: IPv6Address): IPv4Address {
    if (!this.isValid(ipv6)) {
      throw new IncorrectAddressError({
        type: "invalid-ipv6-tunneling",
        method: "IPv4-mapped",
        address: ipv6.toString(),
      });
    }
    return copyIPv6ToIPv4Address(ipv6.array, 6);
  }

  static override toIPv6(
    ipv4: IPv4Address,
    zoneId: string | null = null,
    string?: string,
  ): IPv6Address {
    const ipv6 = this.fillPrefix([0, 0, 0, 0, 0, 0xffff]);
    return new IPv6Address(
      copyIPv4ToIPv6Address(ipv4.array, ipv6, 6, true),
      zoneId,
      undefined,
      string ? { knownProperties: { _ipv4MappedString: string } } : undefined,
    );
  }

  static isValidString(string: string): boolean {
    return string.startsWith("::ffff:");
  }

  static override toString(ipv6: IPv6Address): string {
    return "::ffff:" + this.toIPv4(ipv6).toString();
  }

  static fromString(string: string, zoneId: string | null = null): IPv6Address {
    if (!this.isValidString(string)) {
      throw new IncorrectAddressError({
        type: "incorrect-format",
        version: 6,
        address: string,
      });
    }

    const ipv4 = IPv4Address.fromString(string.substring(7));
    return this.toIPv6(ipv4, zoneId, string);
  }
}

/**
 * 6to4 IPv6 address conversion mode.
 * See [RFC 3056](https://tools.ietf.org/html/rfc3056)
 */
export class SixToFour extends TunnelingMode {
  static override isValid(ipv6: IPv6Address): boolean {
    return ipv6.array[0] === 0x2002;
  }

  static override toIPv6(ipv4: IPv4Address): IPv6Address {
    const ipv6 = this.fillPrefix([0x2002]);
    return copyIPv4ToIPv6Address(ipv4.array, ipv6, 1);
  }

  static override toIPv4(ipv6: IPv6Address): IPv4Address {
    if (!this.isValid(ipv6)) {
      throw new IncorrectAddressError({
        type: "invalid-ipv6-tunneling",
        method: "6to4",
        address: ipv6.toString(),
      });
    }
    return copyIPv6ToIPv4Address(ipv6.array, 1);
  }
}

/**
 * Teredo IPv6 address conversion mode.
 * See [RFC 4380](https://tools.ietf.org/html/rfc4380)
 */
export class Teredo extends TunnelingMode {
  static override isValid(ipv6: IPv6Address): boolean {
    return ipv6.array[0] === 0x2001 && ipv6.array[1] === 0;
  }

  static override toIPv4(ipv6: IPv6Address): IPv4Address {
    if (!this.isValid(ipv6)) {
      throw new IncorrectAddressError({
        type: "invalid-ipv6-tunneling",
        method: "Teredo",
        address: ipv6.toString(),
      });
    }
    return copyIPv6ToIPv4Address(ipv6.array, 6, (word) => word ^ 0xFFFF);
  }

  static override toIPv6(ipv4: IPv4Address, params: TeredoDatas): IPv6Address {
    if (params.flags < 0 || params.flags > 65536) {
      throw new IncorrectAddressError({
        type: "teredo-incorrect-flags",
        flags: params.flags,
      });
    }
    if (params.port < 0 || params.port > 65536) {
      throw new IncorrectAddressError({
        type: "teredo-incorrect-port",
        port: params.port,
      });
    }
    let ipv6 = this.fillPrefix([0x2001, 0]);
    ipv6 = copyIPv4ToIPv6Address(params.ipv4, ipv6, 2, true);
    ipv6[4] = params.flags;
    ipv6[5] = params.port ^ 0xFFFF;
    return copyIPv4ToIPv6Address(
      ipv4.array,
      ipv6,
      6,
      (a, b) => copyIPv4ToIPv6AddressOperation(a, b) ^ 0xFFFF,
    );
  }
}

export const TUNNELING_MODES: TunnelingModes = {
  MAPPED: Mapped,
  SIX_TO_FOUR: SixToFour,
  TEREDO: Teredo,
} as const;
