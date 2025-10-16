import { ADDRESS_VERSIONS } from "../const.ts";
import { IncorrectAddressError } from "../error.ts";
import type {
  AddressVersions,
  NumberTypeForVersion,
} from "../types/address.ts";

export function hexStringToUint<T extends AddressVersions>(
  version: T,
  hexString: string,
): NumberTypeForVersion<T> {
  const { totalBits, numberConstructor } = ADDRESS_VERSIONS[version];
  if (hexString.length !== totalBits / 4) {
    throw new IncorrectAddressError({
      type: "incorrect-binary-string",
      version,
      value: hexString,
    });
  }
  try {
    const res = numberConstructor("0x" + hexString);
    if (typeof res === "number" && !Number.isInteger(res)) {
      throw new IncorrectAddressError({
        type: "incorrect-binary-string",
        version,
        value: hexString,
      });
    }

    return res as NumberTypeForVersion<T>;
  } catch (_e) {
    throw new IncorrectAddressError({
      type: "incorrect-binary-string",
      version,
      value: hexString,
    });
  }
}

export function binaryStringToUint<T extends AddressVersions>(
  version: T,
  binaryString: string,
): NumberTypeForVersion<T> {
  const { totalBits, numberConstructor } = ADDRESS_VERSIONS[version];
  if (binaryString.length !== totalBits) {
    throw new IncorrectAddressError({
      type: "incorrect-binary-string",
      version: version,
      value: binaryString,
    });
  }
  try {
    const res = numberConstructor("0b" + binaryString);
    if (typeof res === "number" && isNaN(res)) {
      throw new IncorrectAddressError({
        type: "incorrect-binary-string",
        version: version,
        value: binaryString,
      });
    }

    return res as NumberTypeForVersion<T>;
  } catch (_e) {
    throw new IncorrectAddressError({
      type: "incorrect-binary-string",
      version,
      value: binaryString,
    });
  }
}

/**
 * Convert an IPv6 bytes typed array to IPv6 Uint16Array
 * @param bytes IPv6 bytes Uint8Array
 * @param getArray if true, result is an array number (by default: false)
 * @returns if getArray is true, number[], else Uint16Array
 */
export function byteArrayToUint16Array(bytes: Uint8Array): Uint16Array;
export function byteArrayToUint16Array(
  bytes: Uint8Array,
  getArray: true,
): number[];
export function byteArrayToUint16Array(
  bytes: Uint8Array,
  getArray: boolean = false,
): Uint16Array | number[] {
  const res = new Uint16Array(8);
  let index = 0;

  for (let i = 0; i < bytes.length - 1; i += 2) {
    res[index++] = (bytes[i] << 8) | bytes[i + 1];
  }

  return getArray ? Array.from(res) : res;
}

/**
 * Convert an IPv6 typed array to bytes array
 * @param array IPv6 typed array
 * @param getArray if true, result is an array number (by default: false)
 * @returns if getArray is true, number[], else Uint8Array
 */
export function uint16ArrayToByteArray(array: Uint16Array): Uint8Array;
export function uint16ArrayToByteArray(
  array: Uint16Array,
  getArray: true,
): number[];
export function uint16ArrayToByteArray(
  array: Uint16Array,
  getArray: boolean = false,
): Uint8Array | number[] {
  const res = new Uint8Array(16);
  let index = 0;

  for (let i = 0; i < array.length; i++) {
    res[index++] = array[i] >> 8;
    res[index++] = array[i] & 0x00FF;
  }

  return getArray ? Array.from(res) : res;
}
