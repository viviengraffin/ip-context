import { testSubmask } from "../libs.ts";
import { IPv4Submask, IPv6Submask } from "../../src/libs/submask.ts";

testSubmask<4>(
  "cidr 24 and 255.255.255.0",
  IPv4Submask.fromCidr(24),
  new Uint8Array([255, 255, 255, 0]),
);
testSubmask<4>(
  "cidr 24 and 255.240.0.0",
  IPv4Submask.fromCidr(24),
  new Uint8Array([255, 240, 0, 0]),
  false,
);
testSubmask<6>(
  "cidr 64 and ffff:ffff:ffff:ffff::",
  IPv6Submask.fromCidr(64),
  new Uint16Array([0xFFFF, 0xFFFF, 0xFFFF, 0xFFFF, 0, 0, 0, 0]),
);
testSubmask<6>(
  "cidr 72 and ffff:ffff:ffff::",
  IPv6Submask.fromCidr(72),
  new Uint16Array([0xFFFF, 0xFFFF, 0xFFFF, 0, 0, 0, 0, 0]),
  false,
);
