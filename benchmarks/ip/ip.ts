import { IPv4Address, IPv6Address } from "../../src/main.ts";
import { bench, run } from "mitata";

bench("IPv6Address.fromIPv4MappedString", () => {
  IPv6Address.fromIPv4MappedString("::ffff:192.168.0.1");
});

bench("IPv6Address.fromIP6ArpaString", () => {
  IPv6Address.fromIP6ArpaString(
    "b.a.9.8.7.6.5.0.4.0.0.0.3.0.0.0.2.0.0.0.1.0.0.0.0.0.0.0.1.2.3.4.ip6.arpa",
  );
});

bench(`IPv4Address.fromURL "http://192.168.1.1:8080/demo?test=1#abcd"`, () => {
  IPv4Address.fromURL("http://192.168.1.1:8080/demo?test=1#abcd");
});

bench(
  `IPv6Address.fromURL "http://[2001:db6::1]:8080/demo?test=1#abcd"`,
  () => {
    IPv6Address.fromURL("http://[2001:db6::1]:8080/demo?test=1#abcd");
  },
);

await run();
