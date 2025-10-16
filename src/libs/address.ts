import { addressEquals, createAddressArray } from "./functions/common.ts";
import { ADDRESS_VERSIONS } from "./const.ts";
import { NonImplementedStaticMethodError } from "./error.ts";
import type {
  AddressArrayForVersion,
  AddressVersions,
  CheckAddressFunction,
  NumberTypeForVersion,
} from "./types/address.ts";
import type { NumberTypes } from "./types/common.ts";
import type {
  AddressOtherProperties,
  AllAddressKnownProperties,
} from "./types/otherProperties.ts";

/**
 * Abstract class representing an IP address (IPv4 or IPv6).
 * Provides methods to create, validate, and manipulate IP addresses.
 *
 * @template AddressArray - The typed array used to store the address (Uint8Array for IPv4, Uint16Array for IPv6)
 * @template NumberType - The numeric type used for integer representation (number for IPv4, bigint for IPv6)
 */
export abstract class Address<
  Version extends AddressVersions = AddressVersions,
> {
  /**
   * Creates an Address instance from a string representation.
   * Must be implemented by child classes.
   *
   * @param _string - String representation of the address (for example:. "192.168.1.1" or "2001:db8::1")
   * @returns {Address} New Address instance
   * @throws {Error} If not implemented by child class
   */
  static fromString(_string: string): Address<AddressVersions> {
    throw new NonImplementedStaticMethodError();
  }

  /**
   * Checks if the given address is valid.
   * Must be implemented by child classes.
   *
   * @param _address - Address to validate (as array or string)
   * @returns {boolean} True if valid, false otherwise
   * @throws {Error} If not implemented by child class
   */
  static isValidAddress(_address: number[] | string): boolean {
    throw new NonImplementedStaticMethodError();
  }

  /**
   * Creates an Address instance from an unsigned integer.
   * Must be implemented by child classes.
   *
   * @param _uint - Unsigned integer representation of the address
   * @returns {Address} New Address instance
   * @throws {Error} If not implemented by child class
   */
  static fromUint(_uint: NumberTypes): Address {
    throw new NonImplementedStaticMethodError();
  }

  /**
   * Create an Address instance from a binary string representation
   *
   * @param _binaryString Binary string representation
   */
  static fromBinaryString(_binaryString: string): Address {
    throw new NonImplementedStaticMethodError();
  }

  /**
   * Create an Address instance from an hex string representation
   *
   * @param _hexString Hex string representation
   */
  static fromHexString(_hexString: string): Address {
    throw new NonImplementedStaticMethodError();
  }

  /**
   * Creates an Address instance from a byte array.
   * Must be implemented by child classes.
   *
   * @param _bytes - Byte array representation of the address
   * @returns {Address} New Address instance
   * @throws {Error} If not implemented by child class
   */
  static fromByteArray(
    _bytes: Uint8Array,
  ): Address {
    throw new NonImplementedStaticMethodError();
  }

  /**
   * Check if the addresses are the same
   *
   * @param _a Address to compare
   * @param _b Address to compare
   * @returns {boolean} True if these addresses are the same, false otherwise.
   */
  static equals(_a: Address, _b: Address): boolean {
    throw new NonImplementedStaticMethodError();
  }

  protected _array: AddressArrayForVersion<Version>;
  protected _uint?: NumberTypeForVersion<Version>;
  protected _string?: string;

  /**
   * Creates a new Address instance.
   *
   * @param version - IP version (4 or 6)
   * @param items - Array or typed array representing the address
   * @param check - Optional function to validate the address
   */
  constructor(
    public version: Version,
    items: number[] | AddressArrayForVersion<Version>,
    check?: CheckAddressFunction<Version>,
    { check: checkValue = true, knownProperties }: AddressOtherProperties<
      AllAddressKnownProperties
    > = {},
  ) {
    this._array = checkValue ? createAddressArray(version, items, check) : (
      Array.isArray(items)
        ? new ADDRESS_VERSIONS[version].arrayConstructor(
          items,
        ) as AddressArrayForVersion<Version>
        : items
    );

    if (knownProperties !== undefined) {
      if (knownProperties._string !== undefined) {
        this._string = knownProperties._string;
      }
      if (knownProperties._uint !== undefined) {
        this._uint = knownProperties._uint as NumberTypeForVersion<Version>;
      }
    }
  }

  /**
   * Get the blocks typed array representing this address
   */
  get array(): AddressArrayForVersion<Version> {
    return this._array;
  }

  /**
   * Returns the string representation of this address.
   * Must be implemented by child classes.
   *
   * @returns {string} String representation of the address
   */
  abstract toString(): string;

  /**
   * Returns the address as a number array.
   *
   * @returns {number[]} Number array representation of the address
   */
  toNumberArray(): number[] {
    return Array.from(this.array);
  }

  /**
   * Returns the address as a byte array.
   * Must be implemented by child classes.
   *
   * @returns {Uint8Array} Byte array representation of the address
   */
  abstract toByteArray(): Uint8Array;

  /**
   * Returns the address as an unsigned integer.
   * Must be implemented by child classes.
   *
   * @returns {NumberType} Unsigned integer representation of the address
   */
  abstract toUint(): NumberTypeForVersion<Version>;

  /**
   * Returns the binary string representation of this address
   *
   * @returns {string} binary string representation
   */
  toBinaryString(): string {
    const { totalBits } = ADDRESS_VERSIONS[this.version];
    return this.toUint().toString(2).padStart(totalBits, "0");
  }

  /**
   * Returns the hex string representation of this address
   *
   * @returns {string} hex string representation
   */
  toHexString(): string {
    const { totalBits } = ADDRESS_VERSIONS[this.version];
    return this.toUint().toString(16).padStart(totalBits / 4, "0");
  }

  /**
   * Check if the addresses are the same
   *
   * @param b Address to compare
   * @returns {boolean} True if these addresses are the same, false otherwise.
   */
  equals(b: this): boolean {
    return addressEquals(this.array, b.array);
  }
}
