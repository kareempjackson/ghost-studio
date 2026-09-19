import type { CSSProperties, ElementType, ReactNode } from "react";
import { typeScale, typeStyleToCss, type TypeRole } from "@/lib/brand";

export interface TypeProps {
  role: TypeRole;
  as?: ElementType;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Cap the line length at the role's documented measure. */
  measure?: boolean;
  id?: string;
  /** For type that is ornament — a section number, a repeated count. */
  "aria-hidden"?: boolean;
}

/**
 * Text goes through the scale or it does not ship. Size, line-height,
 * tracking, weight and case travel together as one role, so there is no way
 * to take half a decision.
 */
export function Type({
  role,
  as: Tag = "p",
  children,
  className,
  style,
  measure = false,
  id,
  "aria-hidden": ariaHidden,
}: TypeProps) {
  const spec = typeScale[role];
  const css: CSSProperties = {
    ...typeStyleToCss(spec),
    ...(measure && spec.measure
      ? { maxInlineSize: `${spec.measure}ch` }
      : null),
    ...style,
  };
  return (
    <Tag id={id} className={className} style={css} aria-hidden={ariaHidden}>
      {children}
    </Tag>
  );
}
