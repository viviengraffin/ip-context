import { describe, expect, test } from "vitest";
import { IPv6Address } from "../../src/libs/ipaddress.ts";
import { IncorrectAddressError } from "../../src/libs/error.ts";

describe("Create an IPv6 address from IPv4-mapped string", () => {
  test("with correct address", () => {
    expect(
      IPv6Address.fromIPv4MappedString("::ffff:192.168.0.1").equals(
        IPv6Address.fromString("::ffff:c0a8:1"),
      ),
    ).toBe(true);
  });

  test("with incorrect address", () => {
    expect(() => IPv6Address.fromIPv4MappedString("2001:db6::1")).toThrow(
      IncorrectAddressError,
    );
  });
});
