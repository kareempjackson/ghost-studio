/**
 * Ghost Savvy Studios — brand system.
 *
 *   import { brand } from "@/lib/brand";
 *   import { typeScale, typeStyleToCss } from "@/lib/brand";
 *
 * The guide at /brand renders itself from these exports, so the documentation
 * cannot drift from the tokens: if a value changes here, the page changes.
 */

export * from "./color";
export * from "./contrast";
export * from "./typography";
export * from "./layout";
export * from "./motion";
export * from "./logo";
export * from "./voice";

import * as color from "./color";
import * as typography from "./typography";
import * as layout from "./layout";
import * as motion from "./motion";
import * as logo from "./logo";
import * as voice from "./voice";

export const brand = {
  name: "Ghost Savvy Studios",
  shortName: "Ghost Savvy",
  color,
  typography,
  layout,
  motion,
  logo,
  voice,
} as const;

export default brand;
