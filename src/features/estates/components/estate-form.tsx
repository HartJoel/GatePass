"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ClipboardList, Home, Power } from "lucide-react";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Modal } from "@/components/ui/overlay";
import { useToast } from "@/components/ui/toast";
import {
  createEstateAction,
  updateEstateAction,
  setEstateStatusAction,
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
  const toast = useToast();
  const estatesHref = `/companies/${companyId}/estates`;

  const [name, setName] = useState(estate?.name ?? "");
  const [address, setAddress] = useState(estate?.address ?? "");
  const [city, setCity] = useState(estate?.city ?? "");
  const [units, setUnits] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmOff, setConfirmOff] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);
  const off = estate?.status === "DEACTIVATED";

  async function onToggleStatus(next: "ACTIVE" | "DEACTIVATED") {
    if (!estate) return;
    setStatusBusy(true);
    const result = await setEstateStatusAction(estate.id, companyId, next);
    setStatusBusy(false);
    setConfirmOff(false);
    if (result.error) {
      setServerError(result.error.message);
      return;
    }
    toast({ tone: next === "ACTIVE" ? "success" : "neutral", title: next === "ACTIVE" ? "Estate reactivated" : "Estate deactivated", description: estate.name });
    router.refresh();
  }

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
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
          <div>
            <h1 className="type-h1 text-ink">
              {editing ? estate.name : "Register estate"}
            </h1>
            <p className="mt-1.5 max-w-xl text-[15px] text-ink-2">
              {editing
                ? "Update the estate’s details."
                : "Add the estate’s details. You can invite residents and guards afterwards."}
            </p>
          </div>
          {editing && estate && (
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/companies/${companyId}/estates/${estate.id}/units`}
                className="inline-flex h-11 items-center gap-2 rounded-control border border-line px-4 text-[15px] font-semibold text-ink transition-colors hover:bg-surface-2"
              >
                <Home className="size-[18px]" aria-hidden />
                Manage units
              </Link>
              <Link
                href={`/companies/${companyId}/estates/${estate.id}/access-log`}
                className="inline-flex h-11 items-center gap-2 rounded-control border border-line px-4 text-[15px] font-semibold text-ink transition-colors hover:bg-surface-2"
              >
                <ClipboardList className="size-[18px]" aria-hidden />
                Access log
              </Link>
            </div>
          )}
        </div>
      </header>

      <div className="flex max-w-[680px] flex-col gap-6">
        {off && (
          <Banner tone="info" title="This estate is deactivated">
            Residents and guards can’t use it, and passes won’t work at the gate. Reactivate it below to switch it back on.
          </Banner>
        )}
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
              <Button type="submit" variant="filled" loading={busy}>
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

        {editing && estate && (
          <section className="rounded-card border border-line bg-surface">
            <div className="flex items-center justify-between gap-6 p-6">
              <div>
                <h2 className="type-h3">{off ? "Reactivate this estate" : "Deactivate this estate"}</h2>
                <p className="mt-0.5 max-w-md text-sm text-ink-2">
                  {off
                    ? "Switch the estate back on so residents can issue passes and guards can scan them."
                    : "Switch the estate off without deleting anything. You can reactivate it at any time."}
                </p>
              </div>
              {off ? (
                <Button variant="ghost" icon={<Power />} loading={statusBusy} onClick={() => onToggleStatus("ACTIVE")}>
                  {statusBusy ? "Reactivating…" : "Reactivate estate"}
                </Button>
              ) : (
                <Button variant="destructive-ghost" disabled={statusBusy} onClick={() => setConfirmOff(true)}>
                  Deactivate estate
                </Button>
              )}
            </div>
          </section>
        )}
      </div>

      {estate && (
        <Modal
          open={confirmOff}
          onClose={() => setConfirmOff(false)}
          title={`Deactivate ${estate.name}?`}
          description="Residents and guards lose access straight away and active visitor passes stop working at the gate. Records are kept, and you can reactivate the estate at any time."
          footer={
            <>
              <Button variant="ghost" onClick={() => setConfirmOff(false)} disabled={statusBusy}>
                Keep estate active
              </Button>
              <Button variant="destructive-ghost" loading={statusBusy} onClick={() => onToggleStatus("DEACTIVATED")}>
                {statusBusy ? "Deactivating…" : "Deactivate estate"}
              </Button>
            </>
          }
        />
      )}
    </>
  );
}
