import { ip, IPv6Address } from "../src/main.ts";

Deno.bench("ip function API IPv4", () => {
  ip("192.168.0.1");
});

Deno.bench("ip function API IPv6", () => {
  ip("2001:db6::1");
});

Deno.bench("IPv6Address.fromIPv4MappedString", () => {
  IPv6Address.fromIPv4MappedString("::ffff:192.168.0.1");
});
