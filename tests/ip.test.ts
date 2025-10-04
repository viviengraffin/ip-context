import { describe, expect, test } from "vitest";
import { ip, IPv4Address, IPv6Address } from "../src/main.ts";
import { IPv4TestAddressDatas, IPv6TestAddressDatas } from "./types.ts";

describe("IP function API", () => {
  test("IPv4", () => {
    expect(ip("192.168.0.1")).toBeInstanceOf(IPv4Address);
  });

  test("IPv6", () => {
    expect(ip("2001:db6::1")).toBeInstanceOf(IPv6Address);
  });
});

describe("IP classes API", () => {
  test("IPv4", () => {
    expect(IPv4Address.fromString("192.168.0.1")).toBeInstanceOf(IPv4Address);
  });

  test("IPv6", () => {
    expect(IPv6Address.fromString("2001:db6::1")).toBeInstanceOf(IPv6Address);
  });
});

function testAddressDatas<T extends IPv4Address | IPv6Address>(
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

testAddressDatas("IPv4Address instance", ip("192.168.0.1") as IPv4Address, {
  version: 4,
  constructor: IPv4Address,
  string: "192.168.0.1",
  class: "C",
  isPrivate: true,
  isLoopback: false,
  isMulticast: false,
  binaryString: "11000000101010000000000000000001",
  hexString: "c0a80001",
  unsignedInteger: 3232235521,
});

testAddressDatas("IPv6Address instance", ip("2001:db6::1") as IPv6Address, {
  version: 6,
  constructor: IPv6Address,
  string: "2001:db6::1",
  isLoopback: false,
  isMulticast: false,
  isUniqueLocal: false,
  isReserved: false,
  isLocalLink: false,
  isUnicast: true,
  binaryString:
    "00100000000000010000110110110110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001",
  hexString: "20010db6000000000000000000000001",
  unsignedInteger: 42540766252826267828375309764565925889n,
});
