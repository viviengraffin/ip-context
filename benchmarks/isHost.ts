import { context, IPv4Context, IPv6Context } from "../src/main.ts";

function isHost(ctx: IPv4Context | IPv6Context, address: string) {
  ctx.isHost(address);
}

function includes(ctx: IPv4Context | IPv6Context, address: string) {
  ctx.includes(address);
}

Deno.bench("IPv4 isHost", () => isHost(context("192.168.0.1"), "192.168.0.52"));
Deno.bench(
  "IPv6 isHost",
  () => isHost(context("2001:db6::1/64"), "2001:db6::52"),
);
Deno.bench(
  "IPv4 includes",
  () => includes(context("192.168.0.1"), "192.168.0.0"),
);
Deno.bench(
  "IPv6 includes",
  () => includes(context("2001:db6::1/64"), "2001:db6::0"),
);
