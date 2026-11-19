-- Defense-in-depth second net (gatepass-database skill, token-and-redemption.md): even if the
-- conditional updateMany in gate.service.ts had a bug, the database itself refuses a second
-- APPROVED access_event for the same pass. Not expressible in schema.prisma (partial indexes
-- aren't part of the Prisma schema DSL), so it lives only as raw SQL here.
CREATE UNIQUE INDEX "access_event_pass_approved_once" ON "access_event" ("passId") WHERE "decision" = 'APPROVED';
