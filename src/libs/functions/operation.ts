import { createAddressArray } from "./common.ts";
import { ADDRESS_VERSIONS } from "../const.ts";
import type { AddressArrays, AddressVersions } from "../types/address.ts";
import type { NumberTypes } from "../types/common.ts";

/**
 * Applies a binary operation element-wise on two address arrays.
 *
 * @param version - IP version (4 or 6)
 * @param a - First address array
 * @param b - Second address array
 * @param callback - Function to apply to each pair of elements
 * @returns {AddressArrays} Resulting address array after applying the operation
 */
function operation(
  version: AddressVersions,
  a: AddressArrays,
  b: AddressArrays,
  callback: (a: number, b: number) => number,
): AddressArrays {
  const res = createAddressArray(version);

  for (let i = 0; i < a.length; i++) {
    res[i] = callback(a[i], b[i]);
  }

  return res;
}

export function and(
  version: AddressVersions,
  a: AddressArrays,
  b: AddressArrays,
): AddressArrays {
  return operation(version, a, b, (itemA, itemB) => itemA & itemB);
}

export function or(
  version: AddressVersions,
  a: AddressArrays,
  b: AddressArrays,
): AddressArrays {
  return operation(version, a, b, (itemA, itemB) => itemA | itemB);
}

export function not(version: AddressVersions, a: AddressArrays): AddressArrays {
  const { arrayConstructor, arrayLength } = ADDRESS_VERSIONS[version];
  const res = new arrayConstructor(arrayLength);

  for (let i = 0; i < arrayLength; i++) {
    res[i] = ~a[i];
  }

  return res;
}

export function andUint<T extends NumberTypes>(a: T, b: T): T {
  switch (typeof a) {
    case "number":
      return ((a & (b as number)) >>> 0) as T;
    case "bigint":
      return (a & (b as bigint)) as T;
  }
}

export function orUint<T extends NumberTypes>(a: T, b: T): T {
  switch (typeof a) {
    case "number":
      return ((a | (b as number)) >>> 0) as T;
    case "bigint":
      return (a | (b as bigint)) as T;
  }
}

export function notUint<T extends NumberTypes>(a: T): T {
  switch (typeof a) {
    case "number":
      return (~a >>> 0) as T;
    case "bigint":
      return (~a & ADDRESS_VERSIONS[6].uintLimit) as T;
  }
}
