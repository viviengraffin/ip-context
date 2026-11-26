import { ADDRESS_VERSIONS } from "../const.ts";
import { ContextError } from "../error.ts";
import { IPv4Address, IPv6Address } from "../ipaddress/index.ts";
import type {
  AddressVersions,
  IPAddressTypeForVersion,
  NumberTypeForVersion,
  SubmaskTypeForVersion,
} from "../types/address.ts";
import { isIPv6 } from "./checkVersion.ts";
import { notUint } from "./operation.ts";
import { parseIPv4Address, parseIPv6Address } from "./parsing.ts";
import { toUint } from "./uint.ts";
import { IPv4Submask, IPv6Submask } from "../submask/index.ts";

export function next<Version extends AddressVersions>(
  version: Version,
  ipConstructor: Version extends 4 ? typeof IPv4Address : typeof IPv6Address,
  current: IPAddressTypeForVersion<Version>,
): IPAddressTypeForVersion<Version> {
  const uintNext: NumberTypeForVersion<Version> =
    // @ts-expect-error
    current.toUint() + toUint(version, 1);

  return ipConstructor.fromUint(
    uintNext as never,
    isIPv6(current) ? (current.zoneId ?? undefined) : undefined,
  ) as IPAddressTypeForVersion<Version>;
}

export function prev<Version extends AddressVersions>(
  version: Version,
  ipConstructor: Version extends 4 ? typeof IPv4Address : typeof IPv6Address,
  current: IPAddressTypeForVersion<Version>,
): IPAddressTypeForVersion<Version> {
  // @ts-expect-error
  const uintPrev: NumberTypeForVersion<Version> =
    (current.toUint() as NumberTypeForVersion<Version>) - toUint(version, 1);

  return ipConstructor.fromUint(
    uintPrev as never,
    isIPv6(current) ? (current.zoneId ?? undefined) : undefined,
  ) as IPAddressTypeForVersion<Version>;
}

export function nextAddressInContext<Version extends AddressVersions>(
  version: Version,
  address: IPAddressTypeForVersion<Version>,
  limit: IPAddressTypeForVersion<Version>,
): IPAddressTypeForVersion<Version> {
  const nextAddress = address.next();

  if (nextAddress.toUint() > limit.toUint()) {
    throw new ContextError({
      type: "impossible-next-or-prev",
      version,
      limit: limit.array,
      value: nextAddress.array,
    });
  }

  return nextAddress as IPAddressTypeForVersion<Version>;
}

export function prevAddressInContext<Version extends AddressVersions>(
  version: Version,
  address: IPAddressTypeForVersion<Version>,
  limit: IPAddressTypeForVersion<Version>,
): IPAddressTypeForVersion<Version> {
  const prevAddress = address.prev();

  if (prevAddress.toUint() < limit.toUint()) {
    throw new ContextError({
      type: "impossible-next-or-prev",
      version,
      limit: limit.array,
      value: prevAddress.array,
    });
  }

  return prevAddress as IPAddressTypeForVersion<Version>;
}

export function buildFromWildcard<Version extends AddressVersions>(
  version: Version,
  submaskConstructor: Version extends 4 ? typeof IPv4Submask : typeof IPv6Submask,
  wildcard: Version extends 4 ? Uint8Array : Uint16Array,
): SubmaskTypeForVersion<Version> {
  const { arrayLength, arrayConstructor } = ADDRESS_VERSIONS[version];

  const submaskArray = new arrayConstructor(arrayLength);

  for (let i = 0; i < arrayLength; i++) {
    submaskArray[i] = notUint(wildcard[i]);
  }

  return new submaskConstructor(
    submaskArray as any,
  ) as SubmaskTypeForVersion<Version>;
}
