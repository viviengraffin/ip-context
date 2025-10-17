import { Address } from "../address.ts";
import { SUBMASK_POSSIBLE_BLOCKS } from "../const.ts";
import { NonImplementedStaticMethodError } from "../error.ts";
import { isCorrectSubmask } from "../functions/check.ts";
import { memoize } from "../functions/common.ts";
import type {
  AddressArrayForVersion,
  AddressVersions,
  NumberTypeForVersion,
} from "../types/address.ts";
import type { NumberTypes } from "../types/common.ts";
import type {
  AddressOtherProperties,
  IPv6SubmaskKnownProperties,
  SubmaskKnownProperties,
} from "../types/otherProperties.ts";
import { getHostsFromSizeAndCidr, getSizeFromCidr } from "./functions.ts";

/**
 * Abstract class representing an IP submask.
 * Provides methods to create, validate, and manipulate subnets.
 */
export abstract class Submask<
  Version extends AddressVersions = AddressVersions,
> extends Address<Version> {
  static fromCidr(_cidr: number): Submask {
    throw new NonImplementedStaticMethodError();
  }

  static fromHosts(_hosts: NumberTypes): Submask {
    throw new NonImplementedStaticMethodError();
  }

  protected _cidr?: number;
  protected _size?: NumberTypeForVersion<Version>;
  protected _hosts?: NumberTypeForVersion<Version>;

  constructor(
    version: Version,
    items: number[] | AddressArrayForVersion<Version>,
    otherProperties: AddressOtherProperties<
      SubmaskKnownProperties<number> | IPv6SubmaskKnownProperties
    > = {},
  ) {
    super(version, items, isCorrectSubmask, otherProperties);

    if (otherProperties.knownProperties !== undefined) {
      if (otherProperties.knownProperties._cidr !== undefined) {
        this._cidr = otherProperties.knownProperties._cidr;
      }
      if (otherProperties.knownProperties._size !== undefined) {
        this._size = otherProperties.knownProperties
          ._size as NumberTypeForVersion<Version>;
      }
      if (otherProperties.knownProperties._hosts !== undefined) {
        this._hosts = otherProperties.knownProperties
          ._hosts as NumberTypeForVersion<Version>;
      }
    }
  }

  get cidr(): number {
    return memoize(this._cidr, () => {
      const possibleBlocks = SUBMASK_POSSIBLE_BLOCKS[this.version];
      let value = 0;

      for (let i = 0; i < this.array.length; i++) {
        const bitsToAdd = possibleBlocks.indexOf(this.array[i]);
        if (bitsToAdd === 0) {
          break;
        }
        value += bitsToAdd;
      }

      this._cidr = value;
    }, () => this._cidr!);
  }

  /**
   * Get the network size with this submask
   *
   * @returns {HostNumberType}
   */
  get size(): NumberTypeForVersion<Version> {
    return memoize(
      this._size,
      () => this._size = getSizeFromCidr(this.version, this.cidr),
      () => this._size!,
    );
  }

  get hosts(): NumberTypeForVersion<Version> {
    return memoize(
      this._hosts,
      () =>
        this._hosts = getHostsFromSizeAndCidr(
          this.version,
          this.size,
          this.cidr,
        ),
      () => this._hosts!,
    );
  }

  override toString(): string {
    throw new NonImplementedStaticMethodError();
  }
}
