import type { TunnelingModesObject } from "../types/tunneling.ts";
import { SixToFour } from "./6to4.ts";
import { Mapped } from "./mapped.ts";
import { Teredo } from "./teredo.ts";

/**
 * An object contains all tunneling methods for convert an IPv6 address to an IPv4 address or vice versa
 */
export const TUNNELING_MODES: TunnelingModesObject = {
  MAPPED: Mapped,
  SIX_TO_FOUR: SixToFour,
  TEREDO: Teredo,
} as const;
