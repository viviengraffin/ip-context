import type { AddressArrays } from "./address.ts";

/**
 * Generic constructor type for classes.
 * @template T - The type of the instance to be constructed
 */
export type Constructor<T> = { new (...args: unknown[]): T };

/**
 * Represents numeric types used for IP address integer representations.
 * Can be either a number (for IPv4) or a bigint (for IPv6).
 */
export type NumberTypes = number | bigint;

export type GenerateSubmaskFromHostsResult<
  AddressArray extends AddressArrays = AddressArrays,
  NumberType extends NumberTypes = NumberTypes,
> = {
  submask: AddressArray;
  hosts: NumberType;
  size: NumberType;
  cidr: number;
};

export type ParseUrlResult = {
  protocol: string | undefined;
  address: string;
  port: number | undefined;
  pathname: string | undefined;
  search: string | undefined;
  hash: string | undefined;
};

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
