/*
  Warnings:

  - You are about to alter the column `approved_date` on the `VendorApplication` table. The data in that column could be lost. The data in that column will be cast from `String` to `DateTime`.
  - Added the required column `applicationCode` to the `VendorApplication` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_VendorApplication" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "applicationCode" TEXT NOT NULL,
    "vendor_type" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "business_type" TEXT NOT NULL,
    "tax_id" TEXT,
    "vat_number" TEXT,
    "country_of_incorporation" TEXT,
    "primary_contact_name" TEXT NOT NULL,
    "primary_contact_email" TEXT NOT NULL,
    "primary_contact_phone" TEXT,
    "business_address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip_code" TEXT,
    "country" TEXT NOT NULL,
    "website" TEXT,
    "industry" TEXT NOT NULL,
    "years_in_business" INTEGER,
    "annual_revenue_range" TEXT,
    "services_offered" TEXT,
    "business_license_url" TEXT,
    "tax_document_url" TEXT,
    "insurance_certificate_url" TEXT,
    "business_registration_url" TEXT,
    "certificate_of_good_standing_url" TEXT,
    "bank_details_document_url" TEXT,
    "import_export_license_url" TEXT,
    "compliance_certificates_url" TEXT,
    "vat_registration_url" TEXT,
    "bank_name" TEXT,
    "bank_account_number" TEXT,
    "swift_code" TEXT,
    "iban" TEXT,
    "preferred_currency" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "admin_notes" TEXT,
    "rejection_reason" TEXT,
    "approved_date" DATETIME,
    "created_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_VendorApplication" ("admin_notes", "annual_revenue_range", "approved_date", "bank_account_number", "bank_details_document_url", "bank_name", "business_address", "business_license_url", "business_registration_url", "business_type", "certificate_of_good_standing_url", "city", "company_name", "compliance_certificates_url", "country", "country_of_incorporation", "created_date", "iban", "id", "import_export_license_url", "industry", "insurance_certificate_url", "preferred_currency", "primary_contact_email", "primary_contact_name", "primary_contact_phone", "rejection_reason", "services_offered", "state", "status", "swift_code", "tax_document_url", "tax_id", "updated_at", "vat_number", "vat_registration_url", "vendor_type", "website", "years_in_business", "zip_code") SELECT "admin_notes", "annual_revenue_range", "approved_date", "bank_account_number", "bank_details_document_url", "bank_name", "business_address", "business_license_url", "business_registration_url", "business_type", "certificate_of_good_standing_url", "city", "company_name", "compliance_certificates_url", "country", "country_of_incorporation", "created_date", "iban", "id", "import_export_license_url", "industry", "insurance_certificate_url", "preferred_currency", "primary_contact_email", "primary_contact_name", "primary_contact_phone", "rejection_reason", "services_offered", "state", "status", "swift_code", "tax_document_url", "tax_id", "updated_at", "vat_number", "vat_registration_url", "vendor_type", "website", "years_in_business", "zip_code" FROM "VendorApplication";
DROP TABLE "VendorApplication";
ALTER TABLE "new_VendorApplication" RENAME TO "VendorApplication";
CREATE UNIQUE INDEX "VendorApplication_applicationCode_key" ON "VendorApplication"("applicationCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
