//import { ADDRESS_VERSIONS } from "../const.ts";
import type { IPv4Address, IPv6Address } from "../ipaddress/index.ts";
import type {
  AddressVersions,
  IPAddressTypeForVersion,
  NumberTypeForVersion,
} from "../types/address.ts";
import { toUint } from "./uint.ts";

export function next<Version extends AddressVersions>(
  version: Version,
  ipConstructor: Version extends 4 ? typeof IPv4Address : typeof IPv6Address,
  current: IPAddressTypeForVersion<Version>,
): IPAddressTypeForVersion<Version> {
  //    const { uintLimit } = ADDRESS_VERSIONS[version];

  // @ts-expect-error
  const uintNext: NumberTypeForVersion<Version> = current.toUint() +
    toUint(version, 1);

  return ipConstructor.fromUint(uintNext as never) as IPAddressTypeForVersion<
    Version
  >;
}

export function prev<Version extends AddressVersions>(
  version: Version,
  ipConstructor: Version extends 4 ? typeof IPv4Address : typeof IPv6Address,
  current: IPAddressTypeForVersion<Version>,
): IPAddressTypeForVersion<Version> {
  // @ts-expect-error
  const uintPrev: NumberTypeForVersion<Version> =
    (current.toUint() as NumberTypeForVersion<Version>) - toUint(version, 1);

  return ipConstructor.fromUint(uintPrev as never) as IPAddressTypeForVersion<
    Version
  >;
}
