import {
  context,
  contextWithHosts,
  IPv4Context,
  type IPv6Context,
} from "../src/main.ts";

function readContextDatas(ctx: IPv4Context | IPv6Context, includes: string) {
  ctx.address.toString();
  ctx.submask.toString();
  ctx.cidr;
  if (ctx instanceof IPv4Context) {
    ctx.class;
    ctx.broadcast.toString();
  }
  ctx.network.toString();
  ctx.firstHost.toString();
  ctx.lastHost.toString();
  ctx.size;
  ctx.hosts;
  ctx.includes(includes);
}

Deno.bench(
  "IPv4 context",
  () => readContextDatas(context("192.168.0.1/24"), "192.168.0.5"),
);
Deno.bench(
  "IPv6 context",
  () => readContextDatas(context("2001:db6::1/64"), "2001:db6::25"),
);

Deno.bench("IPv4 fromHosts", () => {
  readContextDatas(contextWithHosts("192.168.1.0", 1200), "192.168.1.25");
});
Deno.bench("IPv6 fromHosts", () => {
  readContextDatas(
    contextWithHosts("2001:db6::", 12_000_000n),
    "2001:db6::254",
  );
});
