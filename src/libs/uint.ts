import {
  AddressArrayForVersion,
  AddressVersions,
  NumberTypeForVersion,
} from "./types.ts";

/**
 * Convertit une adresse IP stockée sous forme de tableau de blocs en un nombre entier
 * @param version Version de l'adresse IP representé
 * @param array Tableau de blocs représentant l'adresse IP
 */
export function arrayToUint<T extends AddressVersions>(
  version: T,
  array: AddressArrayForVersion<T>,
): NumberTypeForVersion<T> {
  if (version === 4) {
    return (((array[0] << 24) | (array[1] << 16) | (array[2] << 8) |
      array[3]) >>> 0) as NumberTypeForVersion<T>;
  } else {
    let result = 0n;
    for (let i = 0; i < 8; i++) {
      result = (result << 16n) | BigInt(array[i]);
    }
    return result as NumberTypeForVersion<T>;
  }
}

/**
 * Renvoie un nombre avec le type attendu selon la version de l'adresse IP
 * @param version Version de l'adresse IP
 * @param number Renvoie le nombre avec le type attendu
 */
export function toUint<T extends AddressVersions>(
  version: T,
  number: number,
): NumberTypeForVersion<T> {
  if (version === 4) {
    return number as NumberTypeForVersion<T>;
  } else {
    return BigInt(number) as NumberTypeForVersion<T>;
  }
}

/**
 * Convertit l'adresse IP représenté par le nombre entier en un tableau de blocs
 * @param version Version de l'adresse IP
 * @param value Adresse IP représenté par le nombre entier
 * @returns Tableau de blocs
 */
export function UintToArray<T extends AddressVersions>(
  version: T,
  value: NumberTypeForVersion<T>,
): AddressArrayForVersion<T> {
  if (version === 4) {
    const uint = value as number;
    return new Uint8Array([
      (uint >>> 24) & 0xFF,
      (uint >>> 16) & 0xFF,
      (uint >>> 8) & 0xFF,
      uint & 0xFF,
    ]) as AddressArrayForVersion<T>;
  } else {
    const result = new Uint16Array(8);
    let bigInt = value as bigint;
    for (let i = 7; i >= 0; i--) {
      result[i] = Number(bigInt & 0xFFFFn);
      bigInt >>= 16n;
    }
    return result as AddressArrayForVersion<T>;
  }
}
