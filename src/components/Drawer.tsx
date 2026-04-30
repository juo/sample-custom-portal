import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Drawer({ open, title, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <button
        aria-label="Close drawer overlay"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute right-0 top-0 h-full w-full max-w-[540px] bg-white shadow-2xl flex flex-col border-l"
        style={{ borderColor: "var(--accent-200)" }}
      >
        <div
          className="flex items-center justify-between px-xl py-lg border-b"
          style={{ borderColor: "var(--accent-200)" }}
        >
          <h2 className="text-lg font-bold m-0" style={{ color: "var(--accent-900)" }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="h-10 w-10 rounded-full text-lg"
            style={{ background: "var(--accent-100)", color: "var(--primary)" }}
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-xl">{children}</div>
      </aside>
    </div>,
    document.body,
  );
}
