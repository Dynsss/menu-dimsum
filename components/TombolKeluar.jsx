"use client";

import { useActionState } from "react";
import { keluarAdmin } from "@/app/admin/actions";

export default function TombolKeluar() {
  const [state, formAction, sedangMemproses] = useActionState(keluarAdmin, { error: null });

  return (
    <form action={formAction} className="ml-auto flex items-center gap-3">
      {state?.error && (
        <span role="alert" className="text-xs text-bahaya">
          {state.error}
        </span>
      )}
      <button
        type="submit"
        disabled={sedangMemproses}
        className="text-teks-lembut hover:text-bahaya disabled:opacity-50"
      >
        {sedangMemproses ? "Keluar..." : "Keluar"}
      </button>
    </form>
  );
}
