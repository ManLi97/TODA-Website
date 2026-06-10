"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input
        type="password"
        name="password"
        required
        autoFocus
        placeholder="Password"
        className="border-border bg-surface-alt text-text-primary placeholder:text-text-tertiary focus:border-gold-500 w-full rounded-lg border px-4 py-3 focus:outline-none"
      />
      {state.error && <p className="text-label-red text-sm">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="bg-gold-500 text-on-gold rounded-lg px-4 py-3 font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
