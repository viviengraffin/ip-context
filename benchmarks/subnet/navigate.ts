import {
  IPv4Address,
  IPv4Context,
  IPv4Submask,
  IPv6Address,
  IPv6Context,
  IPv6Submask,
} from "../../src/main.ts";
import { bench, run } from "mitata";

bench("IPv4 next with same CIDR /24", () => {
  const ctx = new IPv4Context(
    new IPv4Address([192, 168, 0, 1]),
    IPv4Submask.fromCidr(24),
  );

  ctx.next();
});

bench("IPv4 next with different CIDRs /24 -> /16", () => {
  const ctx = new IPv4Context(
    new IPv4Address([192, 168, 0, 1]),
    IPv4Submask.fromCidr(24),
  );

  ctx.next(16);
});

bench("IPv4 next for 512 hosts", () => {
  const ctx = new IPv4Context(
    new IPv4Address([192, 168, 0, 1]),
    IPv4Submask.fromCidr(24),
  );

  ctx.nextWithHosts(512);
});

bench("IPv4 /24 -> 512 hosts -> /8", () => {
  new IPv4Context(new IPv4Address([192, 168, 0, 1]), IPv4Submask.fromCidr(24))
    .nextWithHosts(512)
    .next(8);
});

bench("IPv6 next with same CIDR /64", () => {
  const ctx = new IPv6Context(
    IPv6Address.fromString("2001:db6::1"),
    IPv6Submask.fromCidr(64),
  );

  ctx.next();
});

bench("IPv6 next with different CIDRs /64 -> /32", () => {
  const ctx = new IPv6Context(
    IPv6Address.fromString("2001:db6::1"),
    IPv6Submask.fromCidr(64),
  );

  ctx.next(32);
});

bench("IPv6 next for 1024 hosts", () => {
  const ctx = new IPv6Context(
    IPv6Address.fromString("2001:db6::1"),
    IPv6Submask.fromCidr(64),
  );

  ctx.nextWithHosts(512n);
});

bench("IPv6 /64 -> 1024 hosts -> /16", () => {
  new IPv6Context(
    IPv6Address.fromString("2001:db6::1"),
    IPv6Submask.fromCidr(64),
  )
    .nextWithHosts(1024n)
    .next(16);
});

await run();
