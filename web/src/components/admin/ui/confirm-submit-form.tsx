"use client";

import { useRef } from "react";
import { useDialog, type ConfirmOptions } from "./dialog-provider";

/**
 * A <form> bound to a server action that asks for confirmation (styled dialog)
 * before submitting. The first submit is intercepted; once confirmed, the form
 * is re-submitted with requestSubmit() and goes through untouched.
 */
export function ConfirmSubmitForm({
  action,
  confirm: confirmOptions,
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  confirm: ConfirmOptions;
  children: React.ReactNode;
}) {
  const dialog = useDialog();
  const formRef = useRef<HTMLFormElement>(null);
  const confirmedRef = useRef(false);

  return (
    <form
      ref={formRef}
      action={action}
      onSubmit={async (e) => {
        if (confirmedRef.current) {
          confirmedRef.current = false;
          return;
        }
        e.preventDefault();
        if (await dialog.confirm(confirmOptions)) {
          confirmedRef.current = true;
          formRef.current?.requestSubmit();
        }
      }}
    >
      {children}
    </form>
  );
}
