import { testSubmask } from "../libs.ts";
import { IPv4Submask, IPv6Submask } from "../../src/libs/submask/index.ts";

testSubmask<4>(
  "IPv4Submask.fromHosts(254) and cidr 24",
  IPv4Submask.fromHosts(254),
  IPv4Submask.fromCidr(24).array,
);
testSubmask<4>(
  "IPv4Submask.fromHosts(1024) and cidr 25",
  IPv4Submask.fromHosts(1024),
  IPv4Submask.fromCidr(25).array,
  false,
);
testSubmask<6>(
  "IPv6Submask.fromHosts(500_000n) and cidr 109",
  IPv6Submask.fromHosts(500_000n),
  IPv6Submask.fromCidr(109).array,
);
testSubmask<6>(
  "IPv6Submask.fromHosts(100_000n) and cidr 64",
  IPv6Submask.fromHosts(100_000n),
  IPv6Submask.fromCidr(64).array,
  false,
);
