import { IPv4Submask, IPv6Submask } from "../src/main.ts";

Deno.bench("IPv4Submask.fromCidr", () => {
  IPv4Submask.fromCidr(24);
});
Deno.bench("IPv6Submask.fromCidr", () => {
  IPv6Submask.fromCidr(64);
});
Deno.bench("IPv4Submask.fromString", () => {
  IPv4Submask.fromString("255.255.255.0");
});
Deno.bench("IPv6Submask.fromString", () => {
  IPv6Submask.fromString("ffff:ffff:ffff::");
});
Deno.bench("IPv4Submask.fromClass", () => {
  IPv4Submask.fromClass("C");
});
Deno.bench("IPv4Submask.fromHosts", () => {
  IPv4Submask.fromHosts(1200);
});
Deno.bench("IPv6Submask.fromHosts", () => {
  IPv6Submask.fromHosts(1_200_000n);
});
Deno.bench("IPv4Submask.isValidAddress", () => {
  IPv4Submask.isValidAddress("255.255.0.0");
});
Deno.bench("IPv6Submask.isValidAddress", () => {
  IPv6Submask.isValidAddress("ffff:ffff:ffff::");
});
