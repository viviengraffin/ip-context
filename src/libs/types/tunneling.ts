import type { SixToFour } from "../tunneling/6to4.ts";
import type { Mapped } from "../tunneling/mapped.ts";
import type { Teredo } from "../tunneling/teredo.ts";

/**
 * All tunneling classes with params for IPv4 -> IPv6
 */
export type TunnelingModeWithParams4To6 = typeof Teredo;
/**
 * All Tunneling method classes without params for IPv4 -> IPv6
 */
export type TunnelingModeWithoutParams4To6 = typeof Mapped | typeof SixToFour;
/**
 * Get the params for a tunneling method for IPv4 -> IPv6
 */
export type TunnelingModeParams4To6<
  TunnelingMode extends TunnelingModeWithParams4To6,
> = TunnelingMode extends typeof Teredo ? TeredoDatas : never;

export type TeredoDatas = {
  ipv4: Uint8Array;
  flags: number;
  port: number;
};

/**
 * An object contains all tunneling methods for convert an IPv6 address to an IPv4 address or vice versa
 */
export type TunnelingModesObject = {
  MAPPED: typeof Mapped;
  SIX_TO_FOUR: typeof SixToFour;
  TEREDO: typeof Teredo;
};

/**
 * Type representing the URL Errors
 */
export type URLErrorDatas = {
  type: "invalid-port";
  port: number;
} | {
  type: "invalid-format";
  url: string;
};

/**
 * Type representing all Tunneling method classes
 */
export type TunnelingModes = typeof Mapped | typeof SixToFour | typeof Teredo;
