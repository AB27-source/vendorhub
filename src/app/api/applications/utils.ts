import { randomUUID } from "crypto";
import type { VendorApplication } from "@prisma/client";

type ApplicationStatus = VendorApplication["status"];

const VALID_STATUSES = new Set<ApplicationStatus>([
  "DRAFT",
  "PENDING_REVIEW",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "ON_HOLD",
]);

export type ClientStatus = Lowercase<ApplicationStatus>;

export type SerializedApplication = Omit<
  VendorApplication,
  "status" | "approved_date" | "created_date" | "updated_at"
> & {
  status: ClientStatus;
  approved_date: string | null;
  created_date: string;
  updated_at: string;
};

export function normalizeStatus(
  value?: string | ApplicationStatus | null
): ApplicationStatus | undefined {
  if (!value) return undefined;
  const candidate =
    typeof value === "string" ? (value as string).toUpperCase() : value;
  return VALID_STATUSES.has(candidate as ApplicationStatus)
    ? (candidate as ApplicationStatus)
    : undefined;
}

export function normalizeApprovedDate(
  value?: string | Date | null
): Date | null | undefined {
  if (value === undefined) return undefined;
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}

export function serializeApplication(
  application: VendorApplication
): SerializedApplication {
  return {
    ...application,
    status: application.status.toLowerCase() as ClientStatus,
    approved_date: application.approved_date
      ? application.approved_date.toString()
      : null,
    created_date: application.created_date.toISOString(),
    updated_at: application.updated_at.toISOString(),
  };
}

type GenerateCodeArgs = {
  providedCode?: string | null;
  companyName?: string | null;
};

export function generateApplicationCode({
  providedCode,
  companyName,
}: GenerateCodeArgs): string {
  const trimmed = providedCode?.trim();
  if (trimmed) {
    return trimmed;
  }

  const baseName = companyName?.trim();
  const normalizedCompany = baseName
    ? baseName
        .replace(/\s+/g, "") // remove spaces entirely (UnitedBrothers...)
        .replace(/[^a-zA-Z0-9]/g, "")
    : undefined;

  const prefix = normalizedCompany && normalizedCompany.length > 0
    ? normalizedCompany
    : "APP";

  const suffix = randomUUID().split("-")[0].toUpperCase();
  return `${prefix}-${suffix}`;
}
