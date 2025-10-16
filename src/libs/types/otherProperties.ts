import type { NumberTypes } from "./common.ts";

/**
 * Object to set the known properties in an address
 */
export type AddressKnownProperties<
  NumberType extends NumberTypes = NumberTypes,
> = {
  _uint?: NumberType;
  _string?: string;
};

/**
 * Object to set the known properties in an IPv6 address
 */
export type IPv6KnownProperties =
  & AddressKnownProperties<bigint>
  & {
    _byteArray?: Uint8Array;
  };

/**
 * Object to set the known properties in an IPv6Address instance
 */
export type IPv6AddressKnownProperties = IPv6KnownProperties & {
  _ipv4MappedString?: string;
  _ip6ArpaString?: string;
};

/**
 * Object to set the known properties in a Submask instance
 */
export type SubmaskKnownProperties<
  NumberType extends NumberTypes = NumberTypes,
> = AddressKnownProperties<NumberType> & {
  _cidr?: number;
  _size?: NumberType;
  _hosts?: NumberType;
};

/**
 * Object to set the known properties in an IPv6Submask instance
 */
export type IPv6SubmaskKnownProperties =
  & SubmaskKnownProperties<bigint>
  & IPv6KnownProperties;

/**
 * All Known properties definitions
 */
export type AllAddressKnownProperties =
  | AddressKnownProperties<number>
  | SubmaskKnownProperties<number>
  | IPv6AddressKnownProperties
  | IPv6SubmaskKnownProperties;

/**
 * Define other properties for address constructor
 */
export type AddressOtherProperties<
  KnownProperties extends AddressKnownProperties,
> = {
  /**
   * Enable/disable check function (default: true)
   */
  check?: boolean;
  /**
   * Set known properties
   */
  knownProperties?: KnownProperties;
};

type IPBaseKnownAddress<KnownProperties extends AllAddressKnownProperties> =
  & AddressOtherProperties<KnownProperties>
  & {
    protocol?: string;
    port?: number;
  };

/**
 * Other properties for IPv4Address
 */
export type IPv4AddressOtherProperties = IPBaseKnownAddress<
  AddressKnownProperties<number>
>;

/**
 * Other properties for IPv6Address
 */
export type IPv6AddressOtherProperties =
  & IPBaseKnownAddress<IPv6AddressKnownProperties>
  & {
    zoneId?: string;
  };
