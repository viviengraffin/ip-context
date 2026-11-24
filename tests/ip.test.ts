import { describe, expect, test } from "vitest";
import { ip, IPv4Address, IPv6Address } from "../src/main.ts";
import { testAddressDatas } from "./libs.ts";

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


describe("2001:db8:0:1:1:1:1:1", ()=>{
  const address = ip("2001:db8:0:1:1:1:1:1");

  test("toString", ()=>{
    expect(address.toString()).toBe("2001:db8:0:1:1:1:1:1");
  });
});

describe("1:2:3:4:5:6:7:0", ()=>{
  const address = ip("1:2:3:4:5:6:7:0");

  test("toString", ()=>{
    expect(address.toString()).toBe("1:2:3:4:5:6:7:0");
  });
});

test("1:2:3:4:5:6:7:8:9", ()=>{
  expect(()=>ip("1:2:3:4:5:6:7:8:9")).toThrow();
});

test("1:2:3", ()=>{
  expect(()=>ip("1:2:3")).toThrow();
});

test("1..3.4", ()=>{
  expect(()=>ip("1..3.4")).toThrow();
});