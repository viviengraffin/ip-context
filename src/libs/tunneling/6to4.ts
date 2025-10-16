import { IncorrectAddressError } from "../error.ts";
import type { IPv4Address, IPv6Address } from "../ipaddress.ts";
import {
  copyIPv4ToIPv6Address,
  copyIPv6ToIPv4Address,
  TunnelingMode,
} from "./index.ts";

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
