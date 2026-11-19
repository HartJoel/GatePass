import "server-only";
import { auth } from "@/server/auth/auth";
import { db } from "@/server/db/client";
import { AppError } from "@/server/errors/app-error";
import { logger } from "@/server/logger";
import type { RegisterCompanyInput } from "@/lib/validation/company.schema";

export interface RegisteredCompany {
  companyId: string;
  userId: string;
}

/**
 * Bootstrapping action: no actor exists yet, so there's nothing to authorize against (this is
 * the one service function in the project that doesn't start with an authorize* call).
 * Creates the Neon-managed user first, then the Company + COMPANY_ADMIN membership in one
 * transaction. If the transaction fails after the user was created, the user exists with no
 * company yet — TODO(next pass): have /dashboard detect that and offer to finish registration,
 * per the gatepass-auth skill, instead of just surfacing an error.
 */
export async function registerCompany(
  input: RegisterCompanyInput,
): Promise<RegisteredCompany> {
  const { data, error } = await auth.signUp.email({
    email: input.adminEmail,
    name: input.adminName,
    password: input.password,
  });

  if (error || !data?.user) {
    throw new AppError(
      "CONFLICT",
      error?.message ??
        "Could not create your account. The email may already be registered.",
    );
  }

  const userId = data.user.id;

  try {
    const company = await db.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: { name: input.companyName, contactEmail: input.adminEmail },
      });
      await tx.companyMembership.create({
        data: { companyId: company.id, userId, role: "COMPANY_ADMIN" },
      });
      return company;
    });

    return { companyId: company.id, userId };
  } catch (err) {
    logger.error("company_registration_partial_failure", {
      userId,
      message: err instanceof Error ? err.message : String(err),
    });
    throw new AppError(
      "INTERNAL",
      "Your account was created, but we couldn’t finish setting up your company. Sign in and try again.",
    );
  }
}
