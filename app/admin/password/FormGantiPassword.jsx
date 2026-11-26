"use client";

import { useActionState, useEffect, useRef } from "react";
import { gantiPassword } from "@/app/admin/actions";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";

const stateAwal = {
  error: null,
  sukses: null,
};

export default function FormGantiPassword() {
  const formRef = useRef(null);
  const [state, formAction, sedangMemproses] = useActionState(gantiPassword, stateAwal);

  useEffect(() => {
    if (state?.sukses) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex max-w-sm flex-col gap-4">
      <Input
        label="Password baru"
        name="password_baru"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />
      <Input
        label="Ulangi password baru"
        name="konfirmasi_password"
        type="password"
        autoComplete="new-password"
        minLength={8}
        required
      />

      {state?.error && (
        <p
          role="alert"
          className="rounded-lg border border-bahaya/30 bg-bahaya/5 px-3 py-2 text-sm text-bahaya"
        >
          {state.error}
        </p>
      )}

      {state?.sukses && (
        <p
          role="status"
          className="rounded-lg border border-utama/30 bg-utama/10 px-3 py-2 text-sm font-medium text-utama"
        >
          {state.sukses}
        </p>
      )}

      <Tombol type="submit" disabled={sedangMemproses} className="self-start">
        {sedangMemproses ? "Menyimpan..." : "Simpan password"}
      </Tombol>
    </form>
  );
}
