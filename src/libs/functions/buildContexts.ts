import { ADDRESS_VERSIONS } from "../const.ts";
import type { IPv4Context, IPv6Context } from "../context.ts";
import { ContextError } from "../error.ts";
import { IPv4Address, IPv6Address } from "../ipaddress/index.ts";
import type {
  AddressVersions,
  ContextTypeForVersion,
  IPAddressTypeForVersion,
  NumberTypeForVersion,
  SubmaskForVersion,
} from "../types/address.ts";
import { isIPv4 } from "./checkVersion.ts";
import { toUint } from "./uint.ts";

export function next<Version extends AddressVersions>(
  version: Version,
  contextClass: Version extends 4 ? typeof IPv4Context : typeof IPv6Context,
  current: ContextTypeForVersion<Version>,
  lastAddress: IPAddressTypeForVersion<Version>,
  submask: SubmaskForVersion<Version>,
): ContextTypeForVersion<Version> {
  let lastAddressUint: NumberTypeForVersion<Version> = lastAddress
    .toUint() as NumberTypeForVersion<Version>;

  const addressClass = version === 4 ? IPv4Address : IPv6Address;
  const { uintLimit } = ADDRESS_VERSIONS[version];

  if (lastAddressUint >= uintLimit) {
    throw new ContextError({
      type: "invalid-cidr",
      cidr: submask.cidr,
    });
  }

  while (true) {
    const next = new contextClass(
      // @ts-expect-error
      addressClass.fromUint(lastAddressUint + toUint(version, 1)),
      submask,
    );

    if (
      // @ts-expect-error
      !next.includes(current.network) &&
      // @ts-expect-error
      !next.includes(current.address) &&
      // @ts-expect-error
      !next.includes(version === 4 ? current.broadcast : current.lastHost) &&
      next.network.toUint() > current.network.toUint()
    ) {
      return next as ContextTypeForVersion<Version>;
    }

    if (isIPv4(next)) {
      lastAddressUint = (next.broadcast.toUint()) as NumberTypeForVersion<
        Version
      >;
    } else {
      lastAddressUint = (next.lastHost.toUint()) as NumberTypeForVersion<
        Version
      >;
    }

    if (lastAddressUint >= uintLimit) {
      throw new ContextError({
        type: "invalid-cidr",
        cidr: submask.cidr,
      });
    }
  }
}

export function prev<Version extends AddressVersions>(
  version: Version,
  contextClass: Version extends 4 ? typeof IPv4Context : typeof IPv6Context,
  current: ContextTypeForVersion<Version>,
  firstAddress: IPAddressTypeForVersion<Version>,
  submask: SubmaskForVersion<Version>,
): ContextTypeForVersion<Version> {
  let firstAddressUint: NumberTypeForVersion<Version> = firstAddress
    .toUint() as NumberTypeForVersion<Version>;

  const addressClass = version === 4 ? IPv4Address : IPv6Address;

  if (firstAddressUint <= toUint(version, 0)) {
    throw new ContextError({
      type: "invalid-cidr",
      cidr: submask.cidr,
    });
  }

  while (true) {
    const prev = new contextClass(
      // @ts-expect-error
      addressClass.fromUint(firstAddressUint - toUint(version, 1)),
      submask,
    );

    if (
      // @ts-expect-error
      !prev.includes(current.network) &&
      // @ts-expect-error
      !prev.includes(current.address) &&
      // @ts-expect-error
      !prev.includes(version === 4 ? current.broadcast : current.lastHost) &&
      prev.network.toUint() < current.network.toUint()
    ) {
      return prev as ContextTypeForVersion<Version>;
    }

    firstAddressUint = (prev.network.toUint()) as NumberTypeForVersion<
      Version
    >;

    if (firstAddressUint <= toUint(version, 0)) {
      throw new ContextError({
        type: "invalid-cidr",
        cidr: submask.cidr,
      });
    }
  }
}
