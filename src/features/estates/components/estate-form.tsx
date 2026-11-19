"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import {
  createEstateAction,
  updateEstateAction,
} from "@/server/actions/estate.actions";
import type { EstateModel } from "@/generated/prisma/models";

export function EstateForm({
  companyId,
  estate,
}: {
  companyId: string;
  estate?: EstateModel;
}) {
  const editing = !!estate;
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const estatesHref = `/companies/${companyId}/estates`;

  const [name, setName] = useState(estate?.name ?? "");
  const [address, setAddress] = useState(estate?.address ?? "");
  const [city, setCity] = useState(estate?.city ?? "");
  const [units, setUnits] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const unitsNum = units.trim() === "" ? undefined : Number(units);
  const errors = {
    name: !name.trim() ? "Enter the estate’s name." : undefined,
    address: !address.trim() ? "Enter the street address." : undefined,
    city: !city.trim() ? "Enter the city." : undefined,
    units:
      unitsNum !== undefined && (!Number.isInteger(unitsNum) || unitsNum < 1)
        ? "Enter a whole number, like 120. Leave blank if you’re not sure yet."
        : undefined,
  };
  const shown = (k: keyof typeof errors) => (submitted ? errors[k] : undefined);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setServerError(null);
    if (Object.values(errors).some(Boolean)) {
      requestAnimationFrame(() =>
        formRef.current
          ?.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus(),
      );
      return;
    }
    setBusy(true);
    // TODO(phase 5, slice B): units isn't a real Estate column yet per the entity spec — only
    // name/address/city persist for now. Assigning a manager needs invitations to exist first.
    const input = { name, address, city };
    const result = editing
      ? await updateEstateAction(estate.id, companyId, input)
      : await createEstateAction(companyId, input);
    setBusy(false);
    if (result.error) {
      setServerError(result.error.message);
      return;
    }
    router.push(estatesHref);
  }

  return (
    <>
      <header className="mb-8">
        <Link
          href={estatesHref}
          className="-ml-1 mb-3 inline-flex items-center gap-0.5 rounded-sm text-sm font-medium text-ink-2 transition-colors hover:text-ink"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Estates
        </Link>
        <h1 className="type-h1 text-ink">
          {editing ? estate.name : "Register estate"}
        </h1>
        <p className="mt-1.5 max-w-xl text-[15px] text-ink-2">
          {editing
            ? "Update the estate’s details."
            : "Add the estate’s details. You can invite residents and guards afterwards."}
        </p>
      </header>

      <div className="flex max-w-[680px] flex-col gap-6">
        {serverError && (
          <p className="rounded-control bg-danger-bg px-3.5 py-3 text-sm font-medium text-danger-fg">
            {serverError}
          </p>
        )}
        <form ref={formRef} onSubmit={onSubmit} noValidate>
          <section className="rounded-card border border-line bg-surface">
            <div className="flex flex-col gap-5 p-6">
              <h2 className="type-h3">Estate details</h2>
              <Field
                label="Estate name"
                name="name"
                autoFocus={!editing}
                placeholder="Palmgrove Estate"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={shown("name")}
              />
              <Field
                label="Street address"
                name="address"
                autoComplete="street-address"
                placeholder="14 Palmgrove Close, Lekki Phase 1"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                error={shown("address")}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  label="City"
                  name="city"
                  placeholder="Lagos"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  error={shown("city")}
                />
                <Field
                  label="Number of units (optional)"
                  name="units"
                  inputMode="numeric"
                  placeholder="120"
                  hint="Not saved yet — units aren’t part of the estate record until a later slice."
                  value={units}
                  onChange={(e) =>
                    setUnits(e.target.value.replace(/[^\d]/g, ""))
                  }
                  error={shown("units")}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-line px-6 py-4">
              <Button type="submit" variant="filled" disabled={busy}>
                {busy ? "Saving…" : "Save estate"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push(estatesHref)}
                disabled={busy}
              >
                Cancel
              </Button>
            </div>
          </section>
        </form>
      </div>
    </>
  );
}
