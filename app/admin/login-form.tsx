"use client";

import { useActionState } from "react";
import { adminControlClass, adminPrimaryButtonClass } from "@/components/admin/admin-styles";
import { login, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label htmlFor="admin-password" className="sr-only">
        Password
      </label>
      <input
        id="admin-password"
        type="password"
        name="password"
        required
        autoFocus
        autoComplete="current-password"
        placeholder="Password"
        className={adminControlClass}
      />
      {state.error && (
        <p role="alert" className="text-label-red text-sm">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={`${adminPrimaryButtonClass} w-full`}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
