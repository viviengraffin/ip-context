import { IPv4Address, IPv6Address } from "../../src/libs/ipaddress/index.ts";
import { testIPFromURL } from "../libs.ts";
import { expect, test } from "vitest";
import { IncorrectAddressError, URLError } from "../../src/libs/error.ts";

testIPFromURL(
  "IPv4Address with full URL",
  IPv4Address.fromURL("http://192.168.1.1:8080"),
  {
    address: "192.168.1.1",
    port: 8080,
    protocol: "http",
    url: "http://192.168.1.1:8080",
  },
);

testIPFromURL(
  "IPv4Address with address and port",
  IPv4Address.fromURL("192.168.1.1:8080"),
  {
    address: "192.168.1.1",
    port: 8080,
    url: "192.168.1.1:8080",
  },
);

testIPFromURL(
  "IPv4Address with address and protocol",
  IPv4Address.fromURL("http://192.168.1.1"),
  {
    address: "192.168.1.1",
    protocol: "http",
    url: "http://192.168.1.1",
  },
);

testIPFromURL(
  "IPv6Address with full URL",
  IPv6Address.fromURL("http://[2001:db6::1]:8080"),
  {
    address: "2001:db6::1",
    protocol: "http",
    port: 8080,
    url: "http://[2001:db6::1]:8080",
  },
);

testIPFromURL(
  "IPv6Address with address and port",
  IPv6Address.fromURL("[2001:db6::1]:8080"),
  {
    address: "2001:db6::1",
    port: 8080,
    url: "[2001:db6::1]:8080",
  },
);

testIPFromURL(
  "IPv6Address with address and protocol",
  IPv6Address.fromURL("http://[2001:db6::1]"),
  {
    address: "2001:db6::1",
    protocol: "http",
    url: "http://[2001:db6::1]",
  },
);

testIPFromURL(
  "IPv6Address with ip6.arpa address and protocol",
  IPv6Address.fromURL(
    "http://b.a.9.8.7.6.5.0.4.0.0.0.3.0.0.0.2.0.0.0.1.0.0.0.0.0.0.0.1.2.3.4.ip6.arpa",
  ),
  {
    address: "4321::1:2:3:4:567:89ab",
    protocol: "http",
    url: "http://[4321::1:2:3:4:567:89ab]",
  },
);

test("IPv4Address fail waited (port 65536)", () => {
  expect(() => IPv4Address.fromURL("192.168.0.1:65536")).toThrow(URLError);
});

test("IPv4Address fail waited (address: 256.192.0.1)", () => {
  expect(
    () => IPv4Address.fromURL("http://256.192.0.1"),
  ).toThrow(IncorrectAddressError);
});

test("IPv4Address fail waited (incorrect format)", () => {
  expect(
    () => IPv4Address.fromURL("http://192.168.1.1://8080"),
  ).toThrow(URLError);
});
