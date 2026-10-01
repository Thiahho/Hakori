"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AlertTriangleIcon } from "./icons";
import { Button } from "./button";
import { inputClass } from "./field";

export type ConfirmOptions = {
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
};

export type PromptOptions = {
  title: string;
  message?: React.ReactNode;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

type DialogRequest =
  | { kind: "confirm"; options: ConfirmOptions; resolve: (confirmed: boolean) => void }
  | { kind: "prompt"; options: PromptOptions; resolve: (value: string | null) => void };

type DialogContextValue = {
  /** Styled replacement for window.confirm — resolves true when the user confirms. */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  /** Styled replacement for window.prompt — resolves the trimmed value, or null if cancelled. */
  prompt: (options: PromptOptions) => Promise<string | null>;
};

const DialogContext = createContext<DialogContextValue | null>(null);

/**
 * Hosts a single native <dialog> (showModal gives focus trapping, Esc and the
 * backdrop for free) and exposes promise-based confirm/prompt so call sites
 * read like the window.* versions they replace.
 */
export function DialogProvider({ children }: { children: React.ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [request, setRequest] = useState<DialogRequest | null>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (request && dialog && !dialog.open) {
      dialog.showModal();
    }
  }, [request]);

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      new Promise<boolean>((resolve) => setRequest({ kind: "confirm", options, resolve })),
    [],
  );

  const prompt = useCallback(
    (options: PromptOptions) =>
      new Promise<string | null>((resolve) => {
        setValue(options.defaultValue ?? "");
        setRequest({ kind: "prompt", options, resolve });
      }),
    [],
  );

  function finish(result: boolean | string | null) {
    if (!request) return;
    if (request.kind === "confirm") {
      request.resolve(result === true);
    } else {
      request.resolve(typeof result === "string" ? result : null);
    }
    dialogRef.current?.close();
    setRequest(null);
  }

  const cancel = () => finish(request?.kind === "confirm" ? false : null);
  const danger = request?.kind === "confirm" && request.options.tone === "danger";
  const trimmedValue = value.trim();

  return (
    <DialogContext.Provider value={{ confirm, prompt }}>
      {children}

      <dialog
        ref={dialogRef}
        aria-labelledby="admin-dialog-title"
        onCancel={(e) => {
          // Esc: resolve as "cancel" ourselves instead of letting the dialog close on its own.
          e.preventDefault();
          cancel();
        }}
        onClick={(e) => {
          // Clicks on the backdrop target the <dialog> itself; clicks inside hit the panel.
          if (e.target === e.currentTarget) cancel();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-neutral-200 bg-white p-0 text-neutral-900 shadow-xl transition-[opacity,transform] duration-150 backdrop:bg-ink/40 backdrop:backdrop-blur-sm starting:open:scale-95 starting:open:opacity-0"
      >
        {request && (
          <form
            className="flex flex-col gap-5 p-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (request.kind === "confirm") {
                finish(true);
              } else if (trimmedValue) {
                finish(trimmedValue);
              }
            }}
          >
            <div className="flex items-start gap-4">
              {danger && (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                  <AlertTriangleIcon className="h-5 w-5" />
                </span>
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <h2 id="admin-dialog-title" className="text-base font-semibold text-neutral-900">
                  {request.options.title}
                </h2>
                {request.options.message && <div className="text-sm text-neutral-600">{request.options.message}</div>}
              </div>
            </div>

            {request.kind === "prompt" && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="admin-dialog-input" className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  {request.options.label}
                </label>
                <input
                  id="admin-dialog-input"
                  autoFocus
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={request.options.placeholder}
                  className={inputClass}
                />
              </div>
            )}

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                onClick={cancel}
                // Destructive confirms start focused on "Cancelar" so Enter never deletes by accident.
                autoFocus={request.kind === "confirm"}
              >
                {request.options.cancelLabel ?? "Cancelar"}
              </Button>
              <Button
                type="submit"
                variant={danger ? "danger" : "primary"}
                disabled={request.kind === "prompt" && !trimmedValue}
              >
                {request.options.confirmLabel ?? (request.kind === "confirm" ? "Confirmar" : "Guardar")}
              </Button>
            </div>
          </form>
        )}
      </dialog>
    </DialogContext.Provider>
  );
}

export function useDialog(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) {
    throw new Error("useDialog debe usarse dentro de <DialogProvider>");
  }
  return ctx;
}
