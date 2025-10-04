// deno-lint-ignore-file no-window
import type { Constructor } from "./libs/types.ts";
import {
  context,
  ContextError,
  contextWithHosts,
  IncorrectAddressError,
  ip,
  IPv4Address,
  IPv4Context,
  IPv4Submask,
  IPv6Address,
  IPv6Context,
  IPv6Submask,
  isValidAddress,
  TUNNELING_MODES,
} from "./main.ts";

declare global {
  interface Window {
    IPv4Address: Constructor<IPv4Address>;
    IPv6Address: Constructor<IPv6Address>;
    IPv4Submask: Constructor<IPv4Submask>;
    IPv6Submask: Constructor<IPv6Submask>;
    IPv4Context: Constructor<IPv4Context>;
    IPv6Context: Constructor<IPv6Context>;
    context: typeof context;
    contextWithHosts: typeof contextWithHosts;
    ip: typeof ip;
    isValidAddress: typeof isValidAddress;
    ContextError: Constructor<ContextError>;
    IncorrectAddressError: Constructor<IncorrectAddressError>;
    TUNNELING_MODES: typeof TUNNELING_MODES;
  }
}

window.IPv4Address = IPv4Address;
window.IPv6Address = IPv6Address;
window.IPv4Submask = IPv4Submask;
window.IPv6Submask = IPv6Submask;
window.IPv4Context = IPv4Context;
window.IPv6Context = IPv6Context;
window.context = context;
window.contextWithHosts = contextWithHosts;
window.ip = ip;
window.isValidAddress = isValidAddress;
window.ContextError = ContextError;
window.IncorrectAddressError = IncorrectAddressError;
window.TUNNELING_MODES = TUNNELING_MODES;
