import { IPv4Submask, IPv6Submask } from "./submask.ts";
import { and, not, or } from "./functions/operation.ts";
import type {
  AddressVersions,
  IPAddressTypeForVersion,
  IPv4AddressClasses,
  NumberTypeForVersion,
  NumberTypes,
  SubmaskTypeForVersion,
} from "./types.ts";
import {
  createAddress,
  createAddressFromUint,
  getAddressFromAddressContainers,
  hasCidrInString,
  memoize,
} from "./functions/common.ts";
import { arrayToUint, toUint } from "./functions/uint.ts";
import { IPv4Address, IPv6Address } from "./ipaddress.ts";
import { ContextError, NonImplementedStaticMethodError } from "./error.ts";
import {
  createIPAddressFromString,
  extractCidrFromString,
  parseIPv4Address,
} from "./functions/parsing.ts";

/**
 * Calculates the last address of a subnet given an address and a submask.
 *
 * @param version - IP version (4 or 6)
 * @param address - The base address of the subnet
 * @param submask - The submask of the subnet
 * @returns {Address} The last address of the subnet
 */
function calculateLastAddress<T extends AddressVersions>(
  version: T,
  address: IPAddressTypeForVersion<T>,
  submask: SubmaskTypeForVersion<T>,
): IPAddressTypeForVersion<T> {
  return createAddress(
    version,
    or(version, address.array, not(version, submask.array)),
  ) as IPAddressTypeForVersion<T>;
}

/**
 * Abstract class representing an IP context (subnet).
 * Provides methods to calculate network, first/last host, and check inclusion.
 */
export abstract class Context<Version extends AddressVersions> {
  protected _network?: IPAddressTypeForVersion<Version>;
  protected _firstHost?: IPAddressTypeForVersion<Version>;
  protected _lastHost?: IPAddressTypeForVersion<Version>;

  /**
   * Creates a new Context instance from a string with CIDR notation.
   *
   * @param _string - String in format "address/cidr" (for example:. "192.168.1.0/24")
   * @returns {Context} New Context instance
   * @throws {Error} If not implemented by subclass
   */
  static fromStringWithCidr(_string: string): Context<AddressVersions> {
    throw new NonImplementedStaticMethodError();
  }

  /**
   * Creates a new Context instance.
   *
   * @param address - The base address of the subnet
   * @param submask - The submask of the subnet
   * @throws {ContextError} If address and submask versions do not match
   */
  constructor(
    public address: IPAddressTypeForVersion<Version>,
    public submask: SubmaskTypeForVersion<Version>,
  ) {
    if (address.version !== submask.version) {
      throw new ContextError({
        type: "different-ip-versions",
        addresses: [address.toString(), submask.toString()],
      });
    }
  }

  /**
   * Gets the network address of this subnet.
   *
   * @returns {AddressType} The network address
   */
  get network(): IPAddressTypeForVersion<Version> {
    return memoize(
      this._network,
      () =>
        this._network = createAddress(
          this.address.version,
          and(this.address.version, this.address.array, this.submask.array),
        ) as IPAddressTypeForVersion<Version>,
      () => this._network!,
    );
  }

  /**
   * Gets the first host address of this subnet.
   *
   * @returns {AddressType} The first host address
   */
  get firstHost(): IPAddressTypeForVersion<Version> {
    return memoize(
      this._firstHost,
      () => {
        this._firstHost = createAddressFromUint(
          this.address.version,
          // deno-lint-ignore ban-ts-comment
          // @ts-expect-error
          this.network.toUint() + toUint(this.address.version, 1),
        ) as IPAddressTypeForVersion<Version>;
      },
      () => this._firstHost!,
    );
  }

  /**
   * Gets the last host address of this subnet.
   *
   * @returns {IPAddressTypeForVersion<Version>} The last host address
   */
  abstract get lastHost(): IPAddressTypeForVersion<Version>;

  /**
   * Gets the number of available hosts in this subnet.
   *
   * @returns {NumberTypeForVersion<Version>} Number of available hosts
   */
  get hosts(): NumberTypeForVersion<Version> {
    return this.submask.hosts as NumberTypeForVersion<Version>;
  }

  /**
   * Gets the CIDR value of this subnet.
   *
   * @returns {number} The CIDR value
   */
  get cidr(): number {
    return this.submask.cidr;
  }

  /**
   * Gets the size of this subnet
   *
   * @return {NumberTypes} The size of this subnet
   */
  get size(): NumberTypeForVersion<Version> {
    return this.submask.size as NumberTypeForVersion<Version>;
  }

  /**
   * Checks if the given address is an available host in this subnet.
   *
   * @param address - Address to check (as Address or string)
   * @returns {boolean} True if the address is an available host, false otherwise
   */
  isHost(address: IPAddressTypeForVersion<Version> | string): boolean {
    address = getAddressFromAddressContainers(
      this.address.version,
      address,
    ) as IPAddressTypeForVersion<Version>;

    const firstHost = this.firstHost;
    const lastHost = this.lastHost;

    for (let i = 0; i < address.array.length; i++) {
      if (
        address.array[i] > lastHost.array[i] ||
        address.array[i] < firstHost.array[i]
      ) {
        return false;
      }
    }

    return true;

    //    return address.toUint()>=this.firstHost.toUint() && address.toUint()<=this.lastHost.toUint()

    //    return this.includes(address) && address.toUint()!==this.network.toUint() && address.toUint()!==this.broadcast.toUint()
  }

  /**
   * Checks if the given address is included in this subnet.
   * @param address - Address to check (as Address or string)
   * @returns {boolean} True if the address is included in this subnet, false otherwise
   */
  includes(address: IPAddressTypeForVersion<Version> | string): boolean {
    address = getAddressFromAddressContainers(
      this.address.version,
      address,
    ) as IPAddressTypeForVersion<Version>;

    const addressAndSubmask = arrayToUint(
      this.address.version,
      and(this.address.version, address.array, this.submask.array),
    );

    return addressAndSubmask === this.network.toUint();
  }
}

/**
 * Class representing an IPv4 subnet context.
 * Provides methods to calculate network, broadcast, first/last host, and check inclusion.
 */
export class IPv4Context extends Context<4> {
  /**
   * Creates an IPv4Context from an address and its class (A, B, C).
   *
   * @param address - IPv4 address or string
   * @returns {IPv4Context | null} New IPv4Context instance, or null if class is invalid
   */
  static fromClass(address: IPv4Address | string): IPv4Context | null {
    if (typeof address === "string") {
      address = new IPv4Address(parseIPv4Address(address));
    }
    const mask = IPv4Submask.fromClass(address.class);

    if (mask === null) {
      return null;
    }

    return new IPv4Context(address, mask);
  }

  /**
   * Creates an IPv4Context from a string with CIDR notation.
   *
   * @param string - String in format "address/cidr" (for example: "192.168.1.0/24")
   * @returns {IPv4Context} New IPv4Context instance
   */
  static override fromStringWithCidr(string: string): IPv4Context {
    const { address: sAddress, cidr } = extractCidrFromString(string);
    const address = IPv4Address.fromString(sAddress);
    const submask = IPv4Submask.fromCidr(cidr);
    return new IPv4Context(address, submask);
  }

  protected _broadcast?: IPv4Address;

  /**
   * Gets the address class (A, B, C) of this subnet.
   *
   * @returns {IPv4AddressClasses} The address class
   */
  get class(): IPv4AddressClasses {
    return this.address.class;
  }

  /**
   * Gets the broadcast address of this subnet.
   *
   * @returns {IPv4Address} The broadcast address
   */
  get broadcast(): IPv4Address {
    return memoize(
      this._broadcast,
      () =>
        this._broadcast = calculateLastAddress(4, this.address, this.submask),
      () => this._broadcast as IPv4Address,
    );
  }

  /**
   * Gets the last host address of this subnet.
   *
   * @returns {IPv4Address} The last host address
   */
  override get lastHost(): IPv4Address {
    return memoize(
      this._lastHost,
      () => this._lastHost = IPv4Address.fromUint(this.broadcast.toUint() - 1),
      () => this._lastHost as IPv4Address,
    );
  }
}

/**
 * Class representing an IPv6 subnet context.
 * Provides methods to calculate network, first/last host, and check inclusion.
 */
export class IPv6Context extends Context<6> {
  static override fromStringWithCidr(string: string): IPv6Context {
    const { address: sAddress, cidr } = extractCidrFromString(string);
    const address = IPv6Address.fromString(sAddress);
    const submask = IPv6Submask.fromCidr(cidr);
    return new IPv6Context(address, submask);
  }

  /**
   * Gets the last host address of this subnet.
   *
   * @returns {IPv6Address} The last host address
   */
  override get lastHost(): IPv6Address {
    return memoize(
      this._lastHost,
      () =>
        this._lastHost = calculateLastAddress(6, this.address, this.submask),
      () => this._lastHost as IPv6Address,
    );
  }
}

/**
 * Creates a new IP context (subnet) from a string or address/submask pair.
 *
 * @param string - String in format "address/cidr" or "address" (for example: "192.168.1.0/24" or "192.168.1.0")
 * @returns {IPv4Context | IPv6Context} New IP context instance
 * @throws {ContextError} If the IP version is unknown or parameters are invalid
 *
 * @example Use with IPv4
 *
 * ```ts
 * import { context } from "@viviengraffin/ip-context";
 *
 * const ctx=context("192.168.1.1/24"); // Instance of IPv4Address
 * ```
 *
 * @example Use with IPv4 without cidr
 *
 * ```ts
 * import { context } from "@viviengraffin/ip-context";
 *
 * const ctx=context("192.168.1.1") as IPv4Address;
 * console.log(ctx.class); // "C"
 * ```
 *
 * @example Use with IPv6
 *
 * ```ts
 * import { context } from "@viviengraffin/ip-context";
 *
 * const ctx=context("2001:db6::1/64"); // Instance of IPv6Address
 * ```
 */
export function context(string: string): IPv4Context | IPv6Context;
/**
 * Creates a new IP context (subnet) from an address and a submask.
 *
 * @param ip - IP address (for example: "192.168.1.0")
 * @param submask - Submask (for example: "255.255.255.0")
 * @returns {IPv4Context | IPv6Context} New IP context instance
 * @throws {ContextError} If the IP version is unknown or parameters are invalid
 *
 * @example Use with IPv4
 *
 * ```ts
 * import { context } from "@viviengraffin/ip-context";
 *
 * const ctx=context("192.168.1.1","255.255.255.0");
 * ```
 *
 * @example Use with IPv6
 *
 * ```ts
 * import { context } from "@viviengraffin/ip-context";
 *
 * const ctx=context("2001:db6::1","ffff:ffff:ffff:ffff::");
 * ```
 */
export function context(ip: string, submask: string): IPv4Context | IPv6Context;
export function context(
  firstParam: string,
  secondParam?: string,
): IPv4Context | IPv6Context {
  let sAddress: string = "";
  let cidr: number | null = null;
  let sSubmask: string | null = null;

  if (secondParam) {
    sSubmask = secondParam;
    sAddress = firstParam;
  } else {
    if (hasCidrInString(firstParam)) {
      const rExtractCidr = extractCidrFromString(firstParam);
      sAddress = rExtractCidr.address;
      cidr = rExtractCidr.cidr;
    } else {
      sAddress = firstParam;
    }
  }

  const address = createIPAddressFromString(sAddress);

  if (address instanceof IPv4Address) {
    let submask: IPv4Submask;
    if (cidr !== null) {
      submask = IPv4Submask.fromCidr(cidr);
    } else if (sSubmask !== null) {
      submask = IPv4Submask.fromString(sSubmask);
    } else {
      const classSubmask = IPv4Submask.fromClass(address.class);
      if (classSubmask === null) {
        throw new ContextError({
          type: "ipv4-class-does-not-submask",
          address: address.toString(),
        });
      }
      submask = classSubmask;
    }

    return new IPv4Context(address, submask);
  } else {
    let submask: IPv6Submask;
    if (cidr !== null) {
      submask = IPv6Submask.fromCidr(cidr);
    } else {
      submask = IPv6Submask.fromString(sSubmask!);
    }

    return new IPv6Context(address, submask);
  }
}

/**
 * Creates a new IP context (subnet) from an address and a desired number of hosts.
 *
 * @param ip - IP address (for example: "192.168.1.0")
 * @param hosts - Desired number of hosts (number for IPv4, bigint for IPv6)
 * @returns {IPv4Context | IPv6Context} New IP context instance
 */
export function contextWithHosts(
  ip: string,
  hosts: NumberTypes,
): IPv4Context | IPv6Context {
  const address = createIPAddressFromString(ip);

  if (address instanceof IPv4Address) {
    if (typeof hosts !== "number") {
      throw new ContextError({
        type: "invalid-hosts-number",
        value: hosts,
      });
    }
    return new IPv4Context(address, IPv4Submask.fromHosts(hosts));
  } else {
    if (typeof hosts !== "bigint") {
      throw new ContextError({
        type: "invalid-hosts-number",
        value: hosts,
      });
    }
    return new IPv6Context(address, IPv6Submask.fromHosts(hosts));
  }
}
