import { describe, expect, test } from "vitest";
import { IPv4Address, IPv6Address } from "../src/libs/ipaddress.ts";
import { IPv4Submask, IPv6Submask } from "../src/libs/submask.ts";
import { IPv4Context, IPv6Context } from "../src/libs/context.ts";
import type {
  IPv4GetDatasFromResult,
  IPv4TestAddressDatas,
  IPv6GetDatasFromResult,
  IPv6TestAddressDatas,
} from "./types.ts";

export function addressTestEquality(
  name: string,
  a: IPv6Submask,
  b: IPv6Submask,
  exected: boolean,
): void;
export function addressTestEquality(
  name: string,
  a: IPv4Submask,
  b: IPv4Submask,
  expected: boolean,
): void;
export function addressTestEquality(
  name: string,
  a: IPv6Address,
  b: IPv6Address,
  expected: boolean,
): void;
export function addressTestEquality(
  name: string,
  a: IPv4Address,
  b: IPv4Address,
  expected: boolean,
): void;
export function addressTestEquality(
  name: string,
  a: IPv4Address | IPv6Address | IPv4Submask | IPv6Submask,
  b: IPv4Address | IPv6Address | IPv4Submask | IPv6Submask,
  expected: boolean,
): void {
  describe(name, () => {
    if (a instanceof IPv4Address && b instanceof IPv4Address) {
      test("IPv4Address.equals", () => {
        expect(IPv4Address.equals(a, b)).toBe(expected);
      });
    } else if (a instanceof IPv6Address && b instanceof IPv6Address) {
      test("IPv6Address.equals", () => {
        expect(IPv6Address.equals(a, b)).toBe(expected);
      });
    } else if (a instanceof IPv4Submask && b instanceof IPv4Submask) {
      test("IPv4Submask.equals", () => {
        expect(IPv4Submask.equals(a, b)).toBe(expected);
      });
    } else if (a instanceof IPv6Submask && b instanceof IPv6Submask) {
      test("IPv6Submask.equals", () => {
        expect(IPv6Submask.equals(a, b)).toBe(expected);
      });
    }

    test("a.equals(b)", () => {
      if (a instanceof IPv4Address && b instanceof IPv4Address) {
        expect(a.equals(b)).toBe(expected);
      } else if (a instanceof IPv6Address && b instanceof IPv6Address) {
        expect(a.equals(b)).toBe(expected);
      } else if (a instanceof IPv4Submask && b instanceof IPv4Submask) {
        expect(a.equals(b)).toBe(expected);
      } else if (a instanceof IPv6Submask && b instanceof IPv6Submask) {
        expect(a.equals(b)).toBe(expected);
      }
    });
  });
}

export function testDatasFromContext<T extends IPv4Context | IPv6Context>(
  name: string,
  ctx: T,
  datas: T extends IPv4Context ? IPv4GetDatasFromResult
    : IPv6GetDatasFromResult,
): void {
  describe(name, () => {
    test("Get correct class instance", () => {
      expect(ctx).toBeInstanceOf(datas.constructor);
    });

    test("Get correct cidr", () => {
      expect(ctx.cidr).toBe(datas.cidr);
    });

    if (ctx instanceof IPv4Context && datas.version === 4) {
      test("Get correct class", () => {
        expect(ctx.class).toBe(datas.class);
      });

      test("Get correct broadcast address", () => {
        expect(ctx.broadcast.toString()).toBe(datas.broadcastString);
      });
    } else if (ctx instanceof IPv6Context && datas.version === 6) {
      test("Get correct zone id", () => {
        expect(ctx.address.zoneId).toBe(datas.zoneId);
      });
    }

    test("Get correct address string", () => {
      expect(ctx.address.toString()).toBe(datas.addressString);
    });

    test("Get correct size", () => {
      expect(ctx.size).toBe(datas.size);
    });

    test("Get correct available addresses number", () => {
      expect(ctx.hosts).toBe(datas.hosts);
    });

    test("Get correct network address", () => {
      expect(ctx.network.toString()).toBe(datas.networkString);
    });

    test("Get correct first host address", () => {
      expect(ctx.firstHost.toString()).toBe(datas.firstHostString);
    });

    test("Get correct last host address", () => {
      expect(ctx.lastHost.toString()).toBe(datas.lastHostString);
    });

    for (const include of datas.includes) {
      test(
        "Check if " + include.address + " is " +
          (include.value === false ? "not " : "") + "in this network",
        () => {
          expect(ctx.includes(include.address)).toBe(include.value);
        },
      );
    }

    for (const isHost of datas.isHost) {
      test(
        "Check if " + isHost.address + " is " +
          (isHost.value === false ? "not " : "") + "an available host",
        () => {
          expect(ctx.isHost(isHost.address)).toBe(isHost.value);
        },
      );
    }
  });
}

export function testAddressDatas<T extends IPv4Address | IPv6Address>(
  name: string,
  address: T,
  datas: T extends IPv4Address ? IPv4TestAddressDatas : IPv6TestAddressDatas,
) {
  describe(name, () => {
    test("correct instance class", () => {
      expect(address).toBeInstanceOf(datas.constructor);
    });

    test("good string address", () => {
      expect(address.toString()).toBe(datas.string);
    });

    if (address instanceof IPv4Address && datas.version === 4) {
      test("good ipv4 class", () => {
        expect(address.class).toBe(datas.class);
      });

      test("is private", () => {
        expect(address.isPrivate()).toBe(datas.isPrivate);
      });
    } else if (address instanceof IPv6Address && datas.version === 6) {
      test("is unique local", () => {
        expect(address.isUniqueLocal()).toBe(datas.isUniqueLocal);
      });

      test("is reserved", () => {
        expect(address.isReserved()).toBe(datas.isReserved);
      });

      test("is local link", () => {
        expect(address.isLocalLink()).toBe(datas.isLocalLink);
      });

      test("is unicast", () => {
        expect(address.isUnicast()).toBe(datas.isUnicast);
      });
    }

    test("is loopback", () => {
      expect(address.isLoopback()).toBe(datas.isLoopback);
    });

    test("is multicast", () => {
      expect(address.isMulticast()).toBe(datas.isMulticast);
    });

    test("binary string", () => {
      expect(address.toBinaryString()).toBe(datas.binaryString);
    });

    test("hex string", () => {
      expect(address.toHexString()).toBe(datas.hexString);
    });

    test("unsigned integer", () => {
      expect(address.toUint()).toBe(datas.unsignedInteger);
    });
  });
}
