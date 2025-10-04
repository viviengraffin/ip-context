import {
  context,
  IPv4Address,
  IPv4Context,
  IPv4Submask,
  IPv6Address,
  IPv6Context,
  IPv6Submask,
} from "../src/main.ts";
import { describe, expect, test } from "vitest";
import { IPv4GetDatasFromResult, IPv6GetDatasFromResult } from "./types.ts";

describe("Context function API", () => {
  test("IPv4", () => {
    expect(context("192.168.0.1/24")).toBeInstanceOf(IPv4Context);
  });

  test("IPv6", () => {
    expect(context("2001:db6::1/64")).toBeInstanceOf(IPv6Context);
  });
});

describe("Context class API", () => {
  test("IPv4", () => {
    expect(
      new IPv4Context(
        IPv4Address.fromString("192.168.0.1"),
        IPv4Submask.fromCidr(24),
      ).address.toString(),
    ).toBe("192.168.0.1");
  });

  test("IPv6", () => {
    expect(
      new IPv6Context(
        IPv6Address.fromString("2001:db6::1"),
        IPv6Submask.fromCidr(64),
      ).address.toString(),
    ).toBe("2001:db6::1");
  });
});

function testDatasFromContext<T extends IPv4Context | IPv6Context>(
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

testDatasFromContext("IPv4Context", context("192.168.1.25") as IPv4Context, {
  version: 4,
  cidr: 24,
  constructor: IPv4Context,
  class: "C",
  broadcastString: "192.168.1.255",
  addressString: "192.168.1.25",
  size: 256,
  hosts: 254,
  networkString: "192.168.1.0",
  firstHostString: "192.168.1.1",
  lastHostString: "192.168.1.254",
  includes: [
    {
      address: "192.168.1.255",
      value: true,
    },
    {
      address: "192.168.2.25",
      value: false,
    },
  ],
  isHost: [
    {
      address: "192.168.1.15",
      value: true,
    },
    {
      address: "192.168.1.0",
      value: false,
    },
  ],
});

testDatasFromContext(
  "IPv6Context",
  context("2001:db6::25%eth0/64") as IPv6Context,
  {
    version: 6,
    constructor: IPv6Context,
    cidr: 64,
    zoneId: "eth0",
    addressString: "2001:db6::25",
    size: 18446744073709551616n,
    hosts: 18446744073709551615n,
    networkString: "2001:db6::",
    firstHostString: "2001:db6::1",
    lastHostString: "2001:db6::ffff:ffff:ffff:ffff",
    includes: [
      {
        address: "2001:db6::30",
        value: true,
      },
      {
        address: "2001:db7::12",
        value: false,
      },
    ],
    isHost: [
      {
        address: "2001:db6::ffff:ffff:ffff:ffff",
        value: true,
      },
      {
        address: "2001:db6::",
        value: false,
      },
    ],
  },
);
