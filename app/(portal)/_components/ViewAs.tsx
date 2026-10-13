"use client";

import { Eye, X } from "lucide-react";
import { useState, useTransition } from "react";
import { ROLE_LABEL, ROLES } from "@/lib/portal/roles";
import type { Role } from "@/lib/portal/types";
import { setViewAs } from "../portal/actions";
import { LABEL } from "./ui";

/**
 * The prototype's switch: see every screen as the studio, a client or a
 * contractor. Folded into a small black disc in the bottom-left corner
 * (clear of Next's dev badge) until it's opened, so it never sits on a
 * decision bar or a message box. Goes when sign-in arrives.
 */
export function ViewAs({ role }: { role: Role }) {
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  return (
    <div
      role="group"
      aria-label="View the portal as"
      className={`fixed bottom-4 left-[3.75rem] z-50 flex items-center gap-1 rounded-pill bg-ink-950 p-1 text-white shadow-overlay transition-opacity ${pending ? "opacity-70" : ""}`}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close the role switch" : `Viewing as ${ROLE_LABEL[role]}. Switch role`}
        title={open ? undefined : `Viewing as ${ROLE_LABEL[role]}`}
        onClick={() => setOpen((o) => !o)}
        className="grid size-8 place-items-center rounded-full text-white/75 transition-colors hover:text-white"
      >
        {open ? <X aria-hidden className="size-4" strokeWidth={1.5} /> : <Eye aria-hidden className="size-4" strokeWidth={1.5} />}
      </button>
      {open ? (
        <>
          <span className={`hidden pr-2 pl-1 text-white/55 sm:block ${LABEL}`}>View as</span>
          {ROLES.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={r === role}
              onClick={() => start(() => setViewAs(r))}
              className={`h-8 rounded-pill px-3.5 ${LABEL} transition-colors ${r === role ? "bg-white text-ink-950" : "text-white/75 hover:text-white"}`}
            >
              {ROLE_LABEL[r]}
            </button>
          ))}
        </>
      ) : null}
    </div>
  );
}
