import { describe, expect, test } from "vitest";
import {
  context,
  IPv4Address,
  IPv4Context,
  IPv6Address,
  IPv6Context,
  IPv6Submask,
} from "../src/main.ts";

describe("IPv4 192.168.0.1/24", () => {
  const base = context("192.168.0.1") as IPv4Context;

  test("previous /24", () => {
    expect(base.prev().network.toString()).toBe("192.167.255.0");
  });

  test("previous /16", () => {
    expect(base.prev(16).network.toString()).toBe("192.167.0.0");
  });

  test("previous /8", () => {
    expect(base.prev(8).network.toString()).toBe("191.0.0.0");
  });

  test("previous /0", () => {
    expect(() => base.prev(0)).toThrow();
  });

  test("previous /32", () => {
    expect(base.prev(32).network.toString()).toBe("192.167.255.255");
  });

  test("next /24", () => {
    expect(base.next().network.toString()).toBe("192.168.1.0");
  });

  test("next /16", () => {
    expect(base.next(16).network.toString()).toBe("192.169.0.0");
  });

  test("next /8", () => {
    expect(base.next(8).network.toString()).toBe("193.0.0.0");
  });

  test("next /0", () => {
    expect(() => base.next(0)).toThrow();
  });

  test("next /32", () => {
    expect(base.next(32).network.toString()).toBe("192.168.1.0");
  });

  test("nextAddress", () => {
    const build = () => {
      return new IPv4Context(
        IPv4Address.fromString("192.168.0.254"),
        base.submask,
      );
    };
    expect(build().nextAddress().address.toString()).toBe("192.168.0.255");
    expect(() => build().nextAddress().nextAddress()).toThrow();
    expect(() => build().nextAddress(true)).toThrow();
  });

  test("prevAddress", () => {
    const build = () => {
      return new IPv4Context(
        IPv4Address.fromString("192.168.0.1"),
        base.submask,
      );
    };
    expect(build().prevAddress().address.toString()).toBe("192.168.0.0");
    expect(() => build().prevAddress().prevAddress()).toThrow();
    expect(() => build().prevAddress(true)).toThrow();
  });
});

describe("IPv6", () => {
  const base = context("2001:db6::1/64") as IPv6Context;

  test("previous /64", () => {
    expect(base.prev().network.toString()).toBe("2001:db5:ffff:ffff::");
  });

  test("previous /16", () => {
    expect(base.prev(16).network.toString()).toBe("2000::");
  });

  test("previous /8", () => {
    expect(base.prev(8).network.toString()).toBe("1f00::");
  });

  test("previous /0", () => {
    expect(() => base.prev(0)).toThrow();
  });

  test("previous /128", () => {
    expect(base.prev(128).network.toString()).toBe(
      "2001:db5:ffff:ffff:ffff:ffff:ffff:ffff",
    );
  });

  test("next /64", () => {
    expect(base.next().network.toString()).toBe("2001:db6:0:1::");
  });

  test("next /16", () => {
    expect(base.next(16).network.toString()).toBe("2002::");
  });

  test("next /8", () => {
    expect(base.next(8).network.toString()).toBe("2100::");
  });

  test("next /0", () => {
    expect(() => base.next(0)).toThrow();
  });

  test("next /128", () => {
    expect(base.next(128).network.toString()).toBe("2001:db6:0:1::");
  });

  test("nextAddress", () => {
    const build = () => {
      return new IPv6Context(
        IPv6Address.fromString("2001:db6::fffe"),
        IPv6Submask.fromCidr(112),
      );
    };

    expect(build().nextAddress().address.toString()).toBe("2001:db6::ffff");
    expect(() => build().nextAddress().nextAddress()).toThrow();
  });

  test("prevAddress", () => {
    const build = () => {
      return new IPv6Context(
        IPv6Address.fromString("2001:db6::1"),
        IPv6Submask.fromCidr(112),
      );
    };

    expect(build().prevAddress().address.toString()).toBe("2001:db6::");
    expect(() => build().prevAddress().prevAddress()).toThrow();
    expect(() => build().prevAddress(true)).toThrow();
  });
});
