-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "PassStatus" AS ENUM ('ACTIVE', 'REDEEMED', 'REVOKED');

-- CreateEnum
CREATE TYPE "AccessDecision" AS ENUM ('APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RejectionReason" AS ENUM ('NOT_FOUND', 'NOT_YET_VALID', 'EXPIRED', 'REVOKED', 'ALREADY_USED', 'GUARD_REJECTED');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "CompanyRole" AS ENUM ('COMPANY_ADMIN');

-- CreateEnum
CREATE TYPE "EstateRole" AS ENUM ('MANAGER', 'RESIDENT', 'GUARD');

-- CreateEnum
CREATE TYPE "InviteRole" AS ENUM ('COMPANY_ADMIN', 'MANAGER', 'RESIDENT', 'GUARD');

-- CreateTable
CREATE TABLE "visitor_pass" (
    "id" TEXT NOT NULL,
    "estateId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "issuerId" TEXT NOT NULL,
    "visitorName" TEXT NOT NULL,
    "note" TEXT,
    "tokenHash" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" "PassStatus" NOT NULL DEFAULT 'ACTIVE',
    "redeemedAt" TIMESTAMP(3),
    "redeemedById" TEXT,
    "revokedAt" TIMESTAMP(3),
    "revokedByUserId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visitor_pass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_event" (
    "id" TEXT NOT NULL,
    "estateId" TEXT NOT NULL,
    "passId" TEXT,
    "guardId" TEXT NOT NULL,
    "decision" "AccessDecision" NOT NULL,
    "reason" "RejectionReason",
    "note" TEXT,
    "clientRequestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "estateId" TEXT NOT NULL,
    "accessEventId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "estateId" TEXT,
    "actorUserId" UUID,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_admin" (
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_admin_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "status" "CompanyStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_membership" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "role" "CompanyRole" NOT NULL DEFAULT 'COMPANY_ADMIN',
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estate" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estate_membership" (
    "id" TEXT NOT NULL,
    "estateId" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "role" "EstateRole" NOT NULL,
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "deactivatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "estate_membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "residential_unit" (
    "id" TEXT NOT NULL,
    "estateId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "residential_unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resident_assignment" (
    "id" TEXT NOT NULL,
    "estateId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "resident_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitation" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "estateId" TEXT,
    "unitId" TEXT,
    "email" TEXT NOT NULL,
    "role" "InviteRole" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "invitedByUserId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "visitor_pass_tokenHash_key" ON "visitor_pass"("tokenHash");

-- CreateIndex
CREATE INDEX "visitor_pass_estateId_status_expiresAt_idx" ON "visitor_pass"("estateId", "status", "expiresAt");

-- CreateIndex
CREATE INDEX "visitor_pass_estateId_createdAt_idx" ON "visitor_pass"("estateId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "visitor_pass_issuerId_createdAt_idx" ON "visitor_pass"("issuerId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "visitor_pass_unitId_createdAt_idx" ON "visitor_pass"("unitId", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "visitor_pass_id_estateId_key" ON "visitor_pass"("id", "estateId");

-- CreateIndex
CREATE INDEX "access_event_estateId_createdAt_idx" ON "access_event"("estateId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "access_event_estateId_decision_createdAt_idx" ON "access_event"("estateId", "decision", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "access_event_passId_idx" ON "access_event"("passId");

-- CreateIndex
CREATE UNIQUE INDEX "access_event_guardId_clientRequestId_key" ON "access_event"("guardId", "clientRequestId");

-- CreateIndex
CREATE INDEX "notification_userId_readAt_createdAt_idx" ON "notification"("userId", "readAt", "createdAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "notification_userId_accessEventId_key" ON "notification"("userId", "accessEventId");

-- CreateIndex
CREATE INDEX "audit_log_companyId_createdAt_idx" ON "audit_log"("companyId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "audit_log_estateId_createdAt_idx" ON "audit_log"("estateId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "audit_log_entityType_entityId_idx" ON "audit_log"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "company_membership_userId_idx" ON "company_membership"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "company_membership_companyId_userId_key" ON "company_membership"("companyId", "userId");

-- CreateIndex
CREATE INDEX "estate_companyId_idx" ON "estate"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "estate_companyId_name_key" ON "estate"("companyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "estate_id_companyId_key" ON "estate"("id", "companyId");

-- CreateIndex
CREATE INDEX "estate_membership_userId_idx" ON "estate_membership"("userId");

-- CreateIndex
CREATE INDEX "estate_membership_estateId_role_status_idx" ON "estate_membership"("estateId", "role", "status");

-- CreateIndex
CREATE UNIQUE INDEX "estate_membership_estateId_userId_key" ON "estate_membership"("estateId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "estate_membership_id_estateId_key" ON "estate_membership"("id", "estateId");

-- CreateIndex
CREATE UNIQUE INDEX "residential_unit_estateId_label_key" ON "residential_unit"("estateId", "label");

-- CreateIndex
CREATE UNIQUE INDEX "residential_unit_id_estateId_key" ON "residential_unit"("id", "estateId");

-- CreateIndex
CREATE INDEX "resident_assignment_estateId_unitId_idx" ON "resident_assignment"("estateId", "unitId");

-- CreateIndex
CREATE INDEX "resident_assignment_membershipId_idx" ON "resident_assignment"("membershipId");

-- CreateIndex
CREATE UNIQUE INDEX "resident_assignment_membershipId_unitId_key" ON "resident_assignment"("membershipId", "unitId");

-- CreateIndex
CREATE UNIQUE INDEX "invitation_tokenHash_key" ON "invitation"("tokenHash");

-- CreateIndex
CREATE INDEX "invitation_companyId_idx" ON "invitation"("companyId");

-- CreateIndex
CREATE INDEX "invitation_estateId_idx" ON "invitation"("estateId");

-- CreateIndex
CREATE INDEX "invitation_email_idx" ON "invitation"("email");

-- AddForeignKey
ALTER TABLE "visitor_pass" ADD CONSTRAINT "visitor_pass_estateId_fkey" FOREIGN KEY ("estateId") REFERENCES "estate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_pass" ADD CONSTRAINT "visitor_pass_unitId_estateId_fkey" FOREIGN KEY ("unitId", "estateId") REFERENCES "residential_unit"("id", "estateId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_pass" ADD CONSTRAINT "visitor_pass_issuerId_estateId_fkey" FOREIGN KEY ("issuerId", "estateId") REFERENCES "estate_membership"("id", "estateId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_pass" ADD CONSTRAINT "visitor_pass_issuerId_unitId_fkey" FOREIGN KEY ("issuerId", "unitId") REFERENCES "resident_assignment"("membershipId", "unitId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visitor_pass" ADD CONSTRAINT "visitor_pass_redeemedById_fkey" FOREIGN KEY ("redeemedById") REFERENCES "estate_membership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_event" ADD CONSTRAINT "access_event_estateId_fkey" FOREIGN KEY ("estateId") REFERENCES "estate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_event" ADD CONSTRAINT "access_event_passId_estateId_fkey" FOREIGN KEY ("passId", "estateId") REFERENCES "visitor_pass"("id", "estateId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_event" ADD CONSTRAINT "access_event_guardId_estateId_fkey" FOREIGN KEY ("guardId", "estateId") REFERENCES "estate_membership"("id", "estateId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_estateId_fkey" FOREIGN KEY ("estateId") REFERENCES "estate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_accessEventId_fkey" FOREIGN KEY ("accessEventId") REFERENCES "access_event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_estateId_companyId_fkey" FOREIGN KEY ("estateId", "companyId") REFERENCES "estate"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_membership" ADD CONSTRAINT "company_membership_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estate" ADD CONSTRAINT "estate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estate_membership" ADD CONSTRAINT "estate_membership_estateId_fkey" FOREIGN KEY ("estateId") REFERENCES "estate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "residential_unit" ADD CONSTRAINT "residential_unit_estateId_fkey" FOREIGN KEY ("estateId") REFERENCES "estate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resident_assignment" ADD CONSTRAINT "resident_assignment_unitId_estateId_fkey" FOREIGN KEY ("unitId", "estateId") REFERENCES "residential_unit"("id", "estateId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resident_assignment" ADD CONSTRAINT "resident_assignment_membershipId_estateId_fkey" FOREIGN KEY ("membershipId", "estateId") REFERENCES "estate_membership"("id", "estateId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_estateId_companyId_fkey" FOREIGN KEY ("estateId", "companyId") REFERENCES "estate"("id", "companyId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_unitId_estateId_fkey" FOREIGN KEY ("unitId", "estateId") REFERENCES "residential_unit"("id", "estateId") ON DELETE RESTRICT ON UPDATE CASCADE;

