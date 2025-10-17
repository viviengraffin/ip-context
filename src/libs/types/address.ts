import type { IPv4Context, IPv6Context } from "../context.ts";
import type { IPv4Address, IPv6Address } from "../ipaddress/index.ts";
import type { IPv4Submask, IPv6Submask } from "../submask/index.ts";
import type { Constructor, Valid } from "./common.ts";

/**
 * Supported IP address versions.
 */
export type AddressVersions = 4 | 6;

/**
 * Function type for address validation.
 * @param version - The IP version (4 or 6)
 * @param address - The address to validate as a number array
 * @returns {Valid<Error>} Validation result
 */
export type CheckAddressFunction<Version extends AddressVersions> = (
  version: Version,
  address: number[] | AddressArrayForVersion<Version>,
) => Valid<Error>;

/**
 * Represents the typed arrays used for IP address storage.
 * Uint8Array for IPv4, Uint16Array for IPv6.
 */
export type AddressArrays = Uint8Array | Uint16Array;

/**
 * Definition of properties for a specific IP address version.
 */
export type AddressVersionDefinition = {
  /** Length of the address array */
  readonly arrayLength: number;
  /** Number of bits per array item */
  readonly bitsByItem: number;
  /** Maximum value for an array item */
  readonly itemMax: number;
  /** Total number of bits in the address */
  readonly totalBits: number;
  /** Constructor for the typed array */
  readonly arrayConstructor: Constructor<AddressArrays>;
  /** Constructor for the number */
  readonly numberConstructor: typeof Number | typeof BigInt;
};

/**
 * Result of extracting a CIDR notation from a string.
 */
export type ExtractCidrFromStringResult = {
  address: string;
  cidr: number;
};

/**
 * Supported input formats for IP addresses.
 */
export type AddressContainers = string | number[] | AddressArrays;

/**
 * The typed array for the IP version (Uint8Array for IPv4, Uint16Array for IPv6)
 */
export type AddressArrayForVersion<Version extends AddressVersions> =
  Version extends 4 ? Uint8Array : Uint16Array;
/**
 * The number type for IP version (number for IPv4, bigint for IPv6)
 */
export type NumberTypeForVersion<Version extends AddressVersions> =
  Version extends 4 ? number : bigint;

/**
 * The class representing the IP address for this version
 */
export type IPAddressTypeForVersion<Version extends AddressVersions> =
  Version extends 4 ? IPv4Address : IPv6Address;

/**
 * The class representing the Submask for this IP version
 */
export type SubmaskTypeForVersion<Version extends AddressVersions> =
  Version extends 4 ? IPv4Submask : IPv6Submask;

/**
 * Type representing the Submask class for IP version
 */
export type SubmaskForVersion<Version extends AddressVersions> = Version extends
  4 ? IPv4Submask : IPv6Submask;

/**
 * Type representing the context class for IP version
 */
export type ContextTypeForVersion<Version extends AddressVersions> =
  Version extends 4 ? IPv4Context : IPv6Context;

/**
 * IPv4 address classes.
 */
export type IPv4AddressClasses = "A" | "B" | "C" | "D" | "E";
