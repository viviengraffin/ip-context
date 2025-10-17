import { IncorrectAddressError } from "../error.ts";
import type { IPv4Address, IPv6Address } from "../ipaddress/index.ts";
import type { TeredoDatas } from "../types/tunneling.ts";
import {
  copyIPv4ToIPv6Address,
  copyIPv4ToIPv6AddressOperation,
  copyIPv6ToIPv4Address,
  fillPrefix,
  type TunnelingMode,
} from "./index.ts";

/**
 * Teredo IPv6 address conversion mode.
 * See [RFC 4380](https://tools.ietf.org/html/rfc4380)
 */
export class Teredo implements TunnelingMode {
  static isValid(ipv6: IPv6Address): boolean {
    return ipv6.array[0] === 0x2001 && ipv6.array[1] === 0;
  }

  static toIPv4(ipv6: IPv6Address): IPv4Address {
    if (!this.isValid(ipv6)) {
      throw new IncorrectAddressError({
        type: "invalid-ipv6-tunneling",
        method: "Teredo",
        address: ipv6.toString(),
      });
    }
    return copyIPv6ToIPv4Address(ipv6.array, 6, (word) => word ^ 0xFFFF);
  }

  static toIPv6(ipv4: IPv4Address, params: TeredoDatas): IPv6Address {
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
    let ipv6 = fillPrefix([0x2001, 0]);
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
