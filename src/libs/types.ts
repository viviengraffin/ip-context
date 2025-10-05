/**
 * Generic constructor type for classes.
 * @template T - The type of the instance to be constructed
 */

import type { IPv4Address, IPv6Address } from "./ipaddress.ts";
import type { IPv4Submask, IPv6Submask } from "./submask.ts";
import type {
  Mapped,
  SixToFour,
  Teredo,
} from "./tunneling.ts";

export type Constructor<T> = { new (...args: unknown[]): T };

/**
 * Represents the result of a validation operation.
 * @template T - The type of the error reason if validation fails
 */
export type Valid<T> = {
  valid: true;
} | {
  valid: false;
  reason: T;
};

/**
 * Represents numeric types used for IP address integer representations.
 * Can be either a number (for IPv4) or a bigint (for IPv6).
 */
export type NumberTypes = number | bigint;

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
 * Supported IP address versions.
 */
export type AddressVersions = 4 | 6;

/**
 * Result of extracting a CIDR notation from a string.
 */
export type ExtractCidrFromStringResult = {
  address: string;
  cidr: number;
};

/**
 * Order direction for bit values.
 */
export type Order = "ASC" | "DESC";

/**
 * Supported bits per item in address arrays.
 */
export type BitsByItems = 8 | 16;

/**
 * Definition of bit values order for different bit sizes.
 */
export type OrderDefinition = Record<BitsByItems, number[]>;

/**
 * IPv4 address classes.
 */
export type IPv4AddressClasses = "A" | "B" | "C" | "D" | "E";

export type TeredoDatas = {
  ipv4: Uint8Array;
  flags: number;
  port: number;
};

/**
 * Supported input formats for IP addresses.
 */
export type AddressContainers = string | number[] | AddressArrays;

/**
 * Data structure for IncorrectAddressError.
 * Represents different types of address validation errors.
 */
export type IncorrectAddressErrorDatas = {
  type: "incorrect-item";
  version: AddressVersions;
  item: number;
  address: AddressContainers;
} | {
  type: "incorrect-format";
  version: AddressVersions;
  address: AddressContainers;
} | {
  type: "too-many-shortcuts";
  address: AddressContainers;
} | {
  type: "has-one-after-zero";
  version: AddressVersions;
  address: AddressContainers;
} | {
  type: "invalid-ipv6-tunneling";
  method: string;
  address: AddressContainers;
} | {
  type: "not-a-ipv6-tunneling";
  address: string;
} | {
  type: "ipv6-tunneling-mode-not-defined";
  address: AddressContainers;
} | {
  type: "incorrect-zone-id";
  zoneId: string;
} | {
  type: "teredo-incorrect-flags";
  flags: number;
} | {
  type: "teredo-incorrect-port";
  port: number;
} | {
  type: "incorrect-binary-string";
  version: AddressVersions;
  value: string;
};

/**
 * Data structure for ContextError.
 * Represents different types of context/usage errors.
 */
export type ContextErrorDatas = {
  type: "different-ip-versions";
  addresses: AddressContainers[];
} | {
  type: "invalid-cidr";
  cidr: number;
} | {
  type: "ipv4-class-does-not-submask";
  address: AddressContainers;
} | {
  type: "unknown-ip-version";
  params: [string, undefined] | [string, string];
} | {
  type: "invalid-string-with-cidr";
  value: string;
} | {
  type: "invalid-hosts-number";
  value: NumberTypes;
};

/**
 * Represents a value that can be undefined.
 * @template T - The type of the value
 */
export type Undefineded<T> = T | undefined;

export type AddressKnownProperties<
  NumberType extends NumberTypes = NumberTypes,
> = {
  _uint?: NumberType;
  _string?: string;
  [k: string]: unknown;
};

export type IPv6KnownProperties =
  & AddressKnownProperties<bigint>
  & {
    _byteArray?: Uint8Array;
  };

export type IPv6AddressKnownProperties = IPv6KnownProperties & {
  _ipv4MappedString?: string;
};

export type SubmaskKnownProperties<
  NumberType extends NumberTypes = NumberTypes,
> = AddressKnownProperties<NumberType> & {
  _cidr?: number;
  _size?: NumberType;
  _hosts?: NumberType;
};

export type IPv6SubmaskKnownProperties =
  & SubmaskKnownProperties<bigint>
  & IPv6KnownProperties;

export type AllAddressKnownProperties =
  | AddressKnownProperties<number>
  | SubmaskKnownProperties<number>
  | IPv6AddressKnownProperties
  | IPv6SubmaskKnownProperties;

export type AddressOtherProperties<
  KnownProperties extends AddressKnownProperties,
> = {
  check?: boolean;
  knownProperties?: KnownProperties;
};

export type GenerateSubmaskFromHostsResult<
  AddressArray extends AddressArrays = AddressArrays,
  NumberType extends NumberTypes = NumberTypes,
> = {
  submask: AddressArray;
  hosts: NumberType;
  size: NumberType;
  cidr: number;
};

export type ObjectValues<T extends object> = T[keyof T];

export type TunnelingModeWithParams4To6 = typeof Teredo;
export type TunnelingModeWithoutParams4To6 = typeof Mapped | typeof SixToFour;
export type TunnelingModeParams4To6<
  TunnelingMode extends TunnelingModeWithParams4To6,
> = TunnelingMode extends typeof Teredo ? TeredoDatas : never;

export type AddressArrayForVersion<Version extends AddressVersions> =
  Version extends 4 ? Uint8Array : Uint16Array;
export type NumberTypeForVersion<Version extends AddressVersions> =
  Version extends 4 ? number : bigint;

export type IPAddressTypeForVersion<Version extends AddressVersions> =
  Version extends 4 ? IPv4Address : IPv6Address;

export type SubmaskTypeForVersion<Version extends AddressVersions> =
  Version extends 4 ? IPv4Submask : IPv6Submask;

export type TunnelingModesObject = {
  MAPPED: typeof Mapped;
  SIX_TO_FOUR: typeof SixToFour;
  TEREDO: typeof Teredo;
};

export type TunnelingModes = typeof Mapped | typeof SixToFour | typeof Teredo
