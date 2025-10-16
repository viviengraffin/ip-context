import type { AddressContainers, AddressVersions } from "./address.ts";
import type { NumberTypes } from "./common.ts";

/**
 * Data structure for IncorrectAddressError.
 * Represents different types of address validation errors.
 */
export type IncorrectAddressErrorDatas = {
  type: "incorrect-item";
  version: AddressVersions;
  item: number;
  address: AddressContainers;
} | {
  type: "incorrect-format";
  version: AddressVersions;
  address: AddressContainers;
} | {
  type: "too-many-shortcuts";
  address: AddressContainers;
} | {
  type: "has-one-after-zero";
  version: AddressVersions;
  address: AddressContainers;
} | {
  type: "invalid-ipv6-tunneling";
  method: string;
  address: AddressContainers;
} | {
  type: "not-a-ipv6-tunneling";
  address: string;
} | {
  type: "ipv6-tunneling-mode-not-defined";
  address: AddressContainers;
} | {
  type: "incorrect-zone-id";
  zoneId: string;
} | {
  type: "teredo-incorrect-flags";
  flags: number;
} | {
  type: "teredo-incorrect-port";
  port: number;
} | {
  type: "incorrect-binary-string";
  version: AddressVersions;
  value: string;
};

/**
 * Data structure for ContextError.
 * Represents different types of context/usage errors.
 */
export type ContextErrorDatas = {
  type: "different-ip-versions";
  addresses: AddressContainers[];
} | {
  type: "invalid-cidr";
  cidr: number;
} | {
  type: "ipv4-class-does-not-submask";
  address: AddressContainers;
} | {
  type: "unknown-ip-version";
  params: [string, undefined] | [string, string];
} | {
  type: "invalid-string-with-cidr";
  value: string;
} | {
  type: "invalid-hosts-number";
  value: NumberTypes;
};
