import { ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: ReactNode;
  width?: string;
}

const Modal = ({ open, onClose, title, eyebrow, children, width = "max-w-lg" }: ModalProps) => {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("input, textarea, select, button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 animate-fade bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div ref={panel} className={`card relative w-full ${width} animate-rise rounded-b-none border-white/10 bg-surface p-6 shadow-2xl sm:rounded-b-[20px] sm:p-7`}>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            {eyebrow && <p className="eyebrow mb-2"><span className="text-lime">✦</span> {eyebrow}</p>}
            <h2 className="display text-xl font-medium">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="btn btn-ghost btn-sm -mr-2 -mt-1 px-2" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
