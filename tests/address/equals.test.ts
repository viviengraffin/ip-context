import { IPv4Address, IPv6Address } from "../../src/libs/ipaddress/index.ts";
import { IPv4Submask, IPv6Submask } from "../../src/libs/submask/index.ts";
import { addressTestEquality } from "../libs.ts";

addressTestEquality(
  "192.168.0.1 and 192.168.1.1",
  IPv4Address.fromString("192.168.0.1"),
  IPv4Address.fromString("192.168.1.1"),
  false,
);
addressTestEquality(
  "172.10.0.1 equality",
  IPv4Address.fromString("172.10.0.1"),
  IPv4Address.fromString("172.10.0.1"),
  true,
);
addressTestEquality(
  "cidr 24 and cidr 20",
  IPv4Submask.fromCidr(24),
  IPv4Submask.fromCidr(20),
  false,
);
addressTestEquality(
  "cidr 16 equality",
  IPv4Submask.fromCidr(16),
  IPv4Submask.fromCidr(16),
  true,
);
addressTestEquality(
  "2001:db6::1 and 2001:db7::1",
  IPv6Address.fromString("2001:db6::1"),
  IPv6Address.fromString("2001:db7::1"),
  false,
);
addressTestEquality(
  "2001:db6::1 equality",
  IPv6Address.fromString("2001:db6::1"),
  IPv6Address.fromString("2001:db6::1"),
  true,
);
addressTestEquality(
  "cidr 64 and cidr 72",
  IPv6Submask.fromCidr(64),
  IPv6Submask.fromCidr(72),
  false,
);
addressTestEquality(
  "cidr 48 equality",
  IPv6Submask.fromCidr(48),
  IPv6Submask.fromCidr(48),
  true,
);
