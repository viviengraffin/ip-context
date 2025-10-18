import { Address } from "../address.ts";
import { NonImplementedStaticMethodError } from "../error.ts";
import type { IPURL } from "../ipurl.ts";
import type {
  AddressArrayForVersion,
  AddressVersions,
  ContextTypeForVersion,
  NumberTypeForVersion,
} from "../types/address.ts";
import type {
  AddressOtherProperties,
  AllAddressKnownProperties,
} from "../types/otherProperties.ts";
import type { IPv4Address } from "./ipv4.ts";
import type { IPv6Address } from "./ipv6.ts";

/**
 * Abstract class representing an IP address (IPv4 or IPv6).
 * Provides methods to check address properties and create network contexts.
 *
 * @template AddressArray - The typed array used to store the address (Uint8Array for IPv4, Uint16Array for IPv6)
 * @template NumberType - The numeric type used for integer representation (number for IPv4, bigint for IPv6)
 */
export abstract class IPAddress<
  Version extends AddressVersions,
> extends Address<Version> {
  static fromURL(_url: string): IPURL<IPv4Address | IPv6Address> {
    throw new NonImplementedStaticMethodError();
  }

  /**
   * Constructor of IPAddress abstract class
   *
   * @param version IP version of this address
   * @param items Array representing this address
   */
  constructor(
    version: Version,
    items: number[] | AddressArrayForVersion<Version>,
    otherProperties: AddressOtherProperties<AllAddressKnownProperties> = {},
  ) {
    super(version, items, undefined, otherProperties);
  }

  /**
   * Checks if this address is a loopback address.
   *
   * @returns {boolean} True if the address is a loopback address, false otherwise
   */
  abstract isLoopback(): boolean;

  /**
   * Creates a network context for this address with the given submask.
   *
   * @param submask - Submask as array, string, or CIDR value
   * @returns {Context} New network context instance
   */
  abstract createContextWithSubmask(
    submask: AddressArrayForVersion<Version> | string | number,
  ): ContextTypeForVersion<Version>;

  /**
   * Creates a network context for this address with the given number of hosts.
   *
   * @param hosts - Desired number of hosts in the subnet
   * @returns {Context} New network context instance
   */
  abstract createContextWithHosts(
    hosts: NumberTypeForVersion<Version>,
  ): ContextTypeForVersion<Version>;

  /**
   * Get type of this address
   *
   * @returns {string} string type representation
   */
  abstract getType(): string | null;
}
