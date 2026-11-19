import "server-only";
import { db } from "@/server/db/client";
import { authorizeCompany, authorizeEstate } from "@/server/authz/policies";
import type { Actor } from "@/server/authz/actor";
import type { SaveEstateInput } from "@/lib/validation/estate.schema";

/**
 * Manager assignment (existing member or invite-by-email) isn't implemented yet — it depends
 * on slice B (invitations/memberships). For now an estate is created with no manager; assigning
 * one is a follow-up once invitations exist.
 */
export async function createEstate(
  actor: Actor,
  companyId: string,
  input: SaveEstateInput,
) {
  authorizeCompany(actor, companyId, "manage_company");

  return db.estate.create({
    data: {
      companyId,
      name: input.name,
      address: input.address,
      city: input.city,
    },
  });
}

export async function listEstates(actor: Actor, companyId: string) {
  authorizeCompany(actor, companyId, "manage_company");

  return db.estate.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getEstate(actor: Actor, estateId: string) {
  authorizeEstate(actor, estateId, "manage_estate");

  return db.estate.findUnique({ where: { id: estateId } });
}

export async function updateEstate(
  actor: Actor,
  estateId: string,
  input: SaveEstateInput,
) {
  authorizeEstate(actor, estateId, "manage_estate");

  return db.estate.update({
    where: { id: estateId },
    data: { name: input.name, address: input.address, city: input.city },
  });
}
