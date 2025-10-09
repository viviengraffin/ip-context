# ip-context [![JSR](https://jsr.io/badges/@viviengraffin/ip-context)](https://jsr.io/@viviengraffin/ip-context)

Si vous êtes francophone, vous pouvez aller [ici](./md/fr/LISEZ_MOI.md)

ip-context is a Deno.js library for performing calculations based on IPv4/IPv6
addresses or network context.

## How to contribute?

If you would like to contribute to this project, go [here](md/en/HOW_TO_CONTRIBUTE.md)

## Basic Examples

### Retrieving the size of an IPv4 network

To retrieve the size of a network, you need to create an IPv4 context that will
contain an IPv4 address and a subnet mask. Here are several ways to do this:

```ts
// With the context function
import { context } from "@viviengraffin/ip-context";

const ctx = context("192.168.1.1/24"); // CIDR notation
console.log(ctx.size); // Calculates and retrieves the network size
console.log(ctx.hosts); // Calculates and retrieves the number of addressable IP addresses in this network

// With the IPv4Context class and the static method fromStringWithCidr
import { IPv4Context } from "@viviengraffin/ip-context";

const ctx = IPv4Context.fromStringWithCidr("192.168.1.1/24"); // Uses the IPv4Context class to directly determine the type
console.log(ctx.size);
console.log(ctx.hosts);

// With the IPv4Context, IPv4Address, and IPv4Submask classes
import {
  IPv4Address,
  IPv4Context,
  IPv4Submask,
} from "@viviengraffin/ip-context";

const ctx = new IPv4Context(
  IPv4Address.fromString("192.168.1.1"),
  IPv4Submask.fromCidr(24),
); // Uses the classes to build the network context
console.log(ctx.size);
console.log(ctx.hosts);

// With the IPv6Context, IPv6Address, IPv6Submask
import {
  IPv6Address,
  IPv6Context,
  IPv6Submask,
} from "@viviengraffin/ip-context";

const ctx = new IPv6Context(
  IPv6Address.fromString("2001:db6::1"),
  IPv6Submask.fromCidr(64),
);
console.log(ctx.size);
console.log(ctx.hosts);

// For IPv4, if no CIDR or subnet mask is passed to the context function, it is based on the IPv4 class.
import { context, IPv4Address } from "@viviengraffin/ip-context";

const ctx = context("192.168.1.1") as IPv4Address; // Cast the result of context so that TypeScript understands that we are expecting an instance of IPv4Context
console.log(ctx.class); // IPv4 address class (here C)
console.log(ctx.size);
console.log(ctx.hosts);
```

### Retrieve the network addresses, broadcast addresses, first addressable address, last addressable address

```ts
// IPv4
import { context } from "@viviengraffin/ip-context";

const ctx = context("192.168.1.1/24");
console.log(ctx.network.toString()); // Displays the network address
console.log(ctx.broadcast.toString()); // Displays the broadcast address
console.log(ctx.firstHost.toString()); // Displays the first addressable address
console.log(ctx.lastHost.toString()); // Displays the last addressable address

// IPv6
import { context } from "@viviengraffin/ip-context";

const ctx = context("2001:db6::1/64");
console.log(ctx.network.toString()); // Displays the network address
console.log(ctx.firstHost.toString()); // Displays the first addressable address
console.log(ctx.lastHost.toString()); // Displays the last addressable address
```

### Checking for the presence of an address in a network context

There are two methods for checking the presence of an IP address in a network
context:

- includes: Checks if this IP address is present in this network
- isHost: Checks if this IP address is addressable in this network

```ts
// IPv4 (works the same way in IPv6)
import { context } from "@viviengraffin/ip-context";

const ctx = context("192.168.1.1/24");
ctx.includes("192.168.1.0"); // True, even if 192.168.1.0 is the network address, it is present in this network
ctx.isHost("192.168.1.0"); // False, even if this address is present in this network, it is the network address that is not addressable
```
