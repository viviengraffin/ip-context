import type { IPv4AddressClasses, NumberTypes } from "../src/libs/types.ts";
import type {
  IPv4Address,
  IPv4Context,
  IPv6Address,
  IPv6Context,
} from "../src/main.ts";

type Includes = {
  address: string;
  value: boolean;
};

type GetDatasFromContextResultBase<
  NumberType extends NumberTypes = NumberTypes,
> = {
  cidr: number;
  addressString: string;
  size: NumberType;
  hosts: NumberType;
  networkString: string;
  firstHostString: string;
  lastHostString: string;
  includes: Includes[];
  isHost: Includes[];
};

export type IPv4GetDatasFromResult = GetDatasFromContextResultBase<number> & {
  version: 4;
  class: IPv4AddressClasses;
  broadcastString: string;
  constructor: typeof IPv4Context;
};

export type IPv6GetDatasFromResult = GetDatasFromContextResultBase<bigint> & {
  version: 6;
  zoneId: string | null;
  constructor: typeof IPv6Context;
};

type TestAddressDatasBase<NumberType extends NumberTypes = NumberTypes> = {
  string: string;
  isLoopback: boolean;
  isMulticast: boolean;
  binaryString: string;
  hexString: string;
  unsignedInteger: NumberType;
};

export type IPv4TestAddressDatas = TestAddressDatasBase<number> & {
  version: 4;
  constructor: typeof IPv4Address;
  class: IPv4AddressClasses;
  isPrivate: boolean;
};

export type IPv6TestAddressDatas = TestAddressDatasBase<bigint> & {
  version: 6;
  constructor: typeof IPv6Address;
  isUniqueLocal: boolean;
  isReserved: boolean;
  isLocalLink: boolean;
  isUnicast: boolean;
};

export type IPFromURLExpectedValues = {
  protocol?: string;
  address: string;
  port?: number;
  url: string;
};
