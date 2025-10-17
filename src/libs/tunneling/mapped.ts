import { IncorrectAddressError } from "../error.ts";
import { IPv4Address, IPv6Address } from "../ipaddress.ts";
import {
  copyIPv4ToIPv6Address,
  copyIPv6ToIPv4Address,
  fillPrefix,
  type TunnelingMode,
} from "./index.ts";

/**
 * IPv4-mapped IPv6 address conversion mode.
 * See [RFC 4291](https://tools.ietf.org/html/rfc4291#section-2.5.5.2)
 */
export class Mapped implements TunnelingMode {
  static isValid(ipv6: IPv6Address): boolean {
    return ipv6.array.slice(0, 5).every((v) => v === 0) &&
      ipv6.array[5] === 0xffff;
  }

  static toIPv4(ipv6: IPv6Address): IPv4Address {
    if (!this.isValid(ipv6)) {
      throw new IncorrectAddressError({
        type: "invalid-ipv6-tunneling",
        method: "IPv4-mapped",
        address: ipv6.toString(),
      });
    }
    return copyIPv6ToIPv4Address(ipv6.array, 6);
  }

  static toIPv6(
    ipv4: IPv4Address,
    zoneId?: string,
    string?: string,
  ): IPv6Address {
    const ipv6 = fillPrefix([0, 0, 0, 0, 0, 0xffff]);
    return new IPv6Address(
      copyIPv4ToIPv6Address(ipv4.array, ipv6, 6, true),
      string
        ? { zoneId, knownProperties: { _ipv4MappedString: string } }
        : undefined,
    );
  }

  static isValidString(string: string): boolean {
    return string.startsWith("::ffff:");
  }

  static toString(ipv6: IPv6Address): string {
    return "::ffff:" + this.toIPv4(ipv6).toString();
  }

  static fromString(string: string, zoneId?: string): IPv6Address {
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
