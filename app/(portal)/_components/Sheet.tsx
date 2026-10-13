"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { IconButton, LABEL } from "./ui";

/**
 * A panel over the page for one task: reject with a reason, upload a
 * version. A native modal <dialog>, so focus is held inside it, Escape
 * closes it and the page behind is inert, all without a library.
 *
 * Wide screens get it from the right, phones from the foot. A click on the
 * dimmed page closes it too.
 */
export function Sheet({
  open,
  onClose,
  title,
  eyebrow,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => event.target === ref.current && onClose()}
      aria-label={title}
      className="gs-sheet fixed inset-0 h-full w-full"
    >
      <div className="gs-sheet-panel absolute inset-x-2 bottom-2 flex max-h-[88dvh] flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-float md:inset-y-3 md:right-3 md:left-auto md:max-h-none md:w-[28rem]">
        <header className="flex items-start justify-between gap-4 p-6 pb-4">
          <div className="grid gap-2">
            {eyebrow ? <p className={`${LABEL} text-tertiary`}>{eyebrow}</p> : null}
            <h2 className="text-[1.25rem] leading-[1.15] font-medium tracking-[-0.025em]">{title}</h2>
          </div>
          <IconButton label="Close" tone="canvas" onClick={onClose}>
            <X aria-hidden className="size-4" strokeWidth={1.5} />
          </IconButton>
        </header>
        <div className="flex-1 overflow-y-auto px-6 pb-6">{children}</div>
        {footer ? <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-ink-950/[0.06] p-4">{footer}</footer> : null}
      </div>
    </dialog>
  );
}
