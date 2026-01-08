"use client";

import { Fragment, type ReactNode } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeStyles = {
  sm: "max-w-[calc(100vw-2rem)] sm:max-w-sm",
  md: "max-w-[calc(100vw-2rem)] sm:max-w-md",
  lg: "max-w-[calc(100vw-2rem)] sm:max-w-lg",
  xl: "max-w-[calc(100vw-2rem)] sm:max-w-xl",
  full: "max-w-[calc(100vw-2rem)] sm:max-w-4xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <Fragment>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div
          className={`
            w-full ${sizeStyles[size]}
            bg-slate-800 border border-slate-700
            rounded-2xl shadow-2xl
            animate-in zoom-in-95 fade-in duration-200
            my-auto max-h-[90vh] flex flex-col
          `}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? "modal-title" : undefined}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-700 flex-shrink-0">
              <h2
                id="modal-title"
                className="text-base sm:text-lg font-semibold text-white"
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          )}

          {/* Content - scrollable */}
          <div className={`${title ? "" : "pt-4"} overflow-y-auto flex-1`}>
            {children}
          </div>
        </div>
      </div>
    </Fragment>
  );
}

interface ModalContentProps {
  children: ReactNode;
  className?: string;
}

export function ModalContent({ children, className = "" }: ModalContentProps) {
  return <div className={`px-4 py-3 sm:px-6 sm:py-4 ${className}`}>{children}</div>;
}

interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

export function ModalFooter({ children, className = "" }: ModalFooterProps) {
  return (
    <div
      className={`
        px-4 py-3 sm:px-6 sm:py-4 border-t border-slate-700
        flex items-center justify-end gap-2 sm:gap-3
        ${className}
      `}
    >
      {children}
    </div>
  );
}

