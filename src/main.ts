export type { Address } from "./libs/address.ts";
export {
  ip,
  type IPAddress,
  IPv4Address,
  IPv6Address,
  isValidAddress,
} from "./libs/ipaddress.ts";
export { IPv4Submask, IPv6Submask } from "./libs/submask.ts";
export {
  type Context,
  context,
  contextWithHosts,
  IPv4Context,
  IPv6Context,
} from "./libs/context.ts";
export {
  ContextError,
  IncorrectAddressError,
  NonImplementedStaticMethodError,
} from "./libs/error.ts";
export {
  type Mapped,
  type SixToFour,
  type Teredo,
  TUNNELING_MODES,
  type TunnelingMode,
} from "./libs/tunneling.ts";

export type {
  AddressArrayForVersion,
  AddressKnownProperties,
  AddressOtherProperties,
  AddressVersions,
  AllAddressKnownProperties,
  CheckAddressFunction,
  ContextErrorDatas,
  IncorrectAddressErrorDatas,
  IPAddressTypeForVersion,
  IPv4AddressClasses,
  IPv6AddressKnownProperties,
  IPv6KnownProperties,
  IPv6SubmaskKnownProperties,
  NumberTypeForVersion,
  NumberTypes,
  SubmaskKnownProperties,
  SubmaskTypeForVersion,
  TunnelingModeParams4To6,
  TunnelingModes,
  TunnelingModesObject,
  TunnelingModeWithoutParams4To6,
  TunnelingModeWithParams4To6,
  Valid,
} from "./libs/types.ts";
