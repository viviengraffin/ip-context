import { ip, IPv4Address, IPv6Address, TUNNELING_MODES } from "../src/main.ts";

Deno.bench("IPv4 -> IPv6 mapped", () => {
  (ip("192.168.0.1") as IPv4Address).toIPv6Address(TUNNELING_MODES.MAPPED);
});

Deno.bench("IPv4 -> IPv6 6to4", () => {
  (ip("192.168.0.1") as IPv4Address).toIPv6Address(TUNNELING_MODES.SIX_TO_FOUR);
});

Deno.bench("IPv4 -> IPv6 Teredo", () => {
  (ip("192.168.0.1") as IPv4Address).toIPv6Address(TUNNELING_MODES.TEREDO, {
    ipv4: new Uint8Array([192, 168, 1, 55]),
    port: 4500,
    flags: 0x8000,
  });
});

Deno.bench("IPv6 -> IPv4 mapped", () => {
  (ip("::ffff:192.168.0.1") as IPv6Address).toIPv4Address(
    TUNNELING_MODES.MAPPED,
  );
});

Deno.bench("IPv6 -> IPv4 6to4", () => {
  (ip("2002:c0a8:1::") as IPv6Address).toIPv4Address(
    TUNNELING_MODES.SIX_TO_FOUR,
  );
});

Deno.bench("IPv6 -> IPv4 Teredo", () => {
  (ip("2001::3f57:fffe") as IPv6Address).toIPv4Address(TUNNELING_MODES.TEREDO);
});
