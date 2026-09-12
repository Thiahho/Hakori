"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/lib/admin/auth-actions";
import { Field, inputClass } from "./ui/field";
import { Alert } from "./ui/alert";
import { Button } from "./ui/button";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      <Field label="Email" htmlFor="email">
        <input id="email" name="email" type="email" required autoComplete="username" className={inputClass} />
      </Field>
      <Field label="Contraseña" htmlFor="password">
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </Field>
      <Button type="submit" variant="primary" disabled={pending} className="mt-2 w-full">
        {pending ? "Ingresando…" : "Ingresar"}
      </Button>
    </form>
  );
}
