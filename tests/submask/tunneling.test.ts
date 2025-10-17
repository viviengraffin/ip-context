import { describe, expect, test } from "vitest";
import { IPv4Address, IPv6Address } from "../../src/libs/ipaddress/index.ts";
import { TUNNELING_MODES } from "../../src/libs/tunneling/object.ts";

describe("Mapped", () => {
  test("IPv6Address.toIPv4Address", () => {
    expect(
      IPv6Address.fromIPv4MappedString("::ffff:192.168.0.1")
        .toIPv4Address(TUNNELING_MODES.MAPPED)
        .equals(new IPv4Address([192, 168, 0, 1])),
    ).toBe(true);
  });

  test("IPv4Address.toIPv6Address", () => {
    expect(
      IPv4Address.fromString("172.10.5.10")
        .toIPv6Address(TUNNELING_MODES.MAPPED)
        .equals(new IPv6Address([0, 0, 0, 0, 0, 0xFFFF, 0xAC0A, 0x050A])),
    ).toBe(true);
  });
});

describe("6to4", () => {
  test("IPv6Address.toIPv4Address", () => {
    expect(
      IPv6Address.fromString("2002:c0a8:1::")
        .toIPv4Address(TUNNELING_MODES.SIX_TO_FOUR)
        .equals(new IPv4Address([192, 168, 0, 1])),
    ).toBe(true);
  });

  test("IPv4Address.toIPv6Address", () => {
    expect(
      IPv4Address.fromString("172.10.5.10")
        .toIPv6Address(TUNNELING_MODES.SIX_TO_FOUR)
        .equals(new IPv6Address([0x2002, 0xAC0A, 0x050A, 0, 0, 0, 0, 0])),
    ).toBe(true);
  });
});
