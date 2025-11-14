"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  ExternalLink,
  Globe,
  Flag,
  CreditCard,
} from "lucide-react";

type VendorStatus =
  | "draft"
  | "pending_review"
  | "under_review"
  | "approved"
  | "rejected"
  | "on_hold";

type Vendor = {
  id: string;
  company_name: string;
  vendor_type: "domestic" | "international";
  status: VendorStatus;

  approved_date?: string | null;

  business_type?: string | null;
  tax_id?: string | null;
  vat_number?: string | null;
  country_of_incorporation?: string | null;
  industry: string;
  years_in_business?: number | null;
  annual_revenue_range?: string | null;
  website?: string | null;
  services_offered?: string | null;

  primary_contact_name: string;
  primary_contact_email: string;
  primary_contact_phone?: string | null;

  business_address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  country?: string | null;

  admin_notes?: string | null;
  rejection_reason?: string | null;

  business_license_url?: string | null;
  tax_document_url?: string | null;
  insurance_certificate_url?: string | null;
  business_registration_url?: string | null;
  vat_registration_url?: string | null;
  certificate_of_good_standing_url?: string | null;
  bank_details_document_url?: string | null;
  import_export_license_url?: string | null;
  compliance_certificates_url?: string | null;

  bank_name?: string | null;
  preferred_currency?: string | null;
  swift_code?: string | null;
  iban?: string | null;
  bank_account_number?: string | null;
};

type VendorReviewModalProps = {
  vendor: Vendor;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<Vendor>) => void;
  isUpdating: boolean;
};

const statusConfig: Record<VendorStatus, { color: string; label: string }> = {
  draft: {
    color: "bg-slate-100 text-slate-700 border-slate-200",
    label: "Draft",
  },
  pending_review: {
    color: "bg-amber-100 text-amber-700 border-amber-200",
    label: "Pending Review",
  },
  under_review: {
    color: "bg-blue-100 text-blue-700 border-blue-200",
    label: "Under Review",
  },
  approved: {
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    label: "Approved",
  },
  rejected: {
    color: "bg-red-100 text-red-700 border-red-200",
    label: "Rejected",
  },
  on_hold: {
    color: "bg-orange-100 text-orange-700 border-orange-200",
    label: "On Hold",
  },
};

export default function VendorReviewModal({
  vendor,
  onClose,
  onUpdate,
  isUpdating,
}: VendorReviewModalProps) {
  const [adminNotes, setAdminNotes] = useState(vendor.admin_notes || "");
  const [rejectionReason, setRejectionReason] = useState(
    vendor.rejection_reason || ""
  );

  const isDomestic = vendor.vendor_type === "domestic";

  const handleApprove = () => {
    onUpdate(vendor.id, {
      status: "approved",
      admin_notes: adminNotes,
      approved_date: new Date().toISOString().split("T")[0] as any,
      rejection_reason: null,
    });
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    onUpdate(vendor.id, {
      status: "rejected",
      admin_notes: adminNotes,
      rejection_reason: rejectionReason,
    });
  };

  const handleMarkUnderReview = () => {
    onUpdate(vendor.id, {
      status: "under_review",
      admin_notes: adminNotes,
    });
  };

  const domesticDocuments = [
    { label: "Business License", url: vendor.business_license_url },
    { label: "W-9 Tax Form", url: vendor.tax_document_url },
    {
      label: "Certificate of Insurance",
      url: vendor.insurance_certificate_url,
    },
  ];

  const internationalDocuments = [
    {
      label: "Certificate of Incorporation/Business Registration",
      url: vendor.business_registration_url,
    },
    { label: "W-8BEN / W-8BEN-E Tax Form", url: vendor.tax_document_url },
    {
      label: "VAT Registration Certificate",
      url: vendor.vat_registration_url,
    },
    {
      label: "Certificate of Good Standing",
      url: vendor.certificate_of_good_standing_url,
    },
    {
      label: "Bank Account Verification Document",
      url: vendor.bank_details_document_url,
    },
    {
      label: "Certificate of Insurance",
      url: vendor.insurance_certificate_url,
    },
    {
      label: "Import/Export License",
      url: vendor.import_export_license_url,
    },
    {
      label: "Industry Compliance Certificates",
      url: vendor.compliance_certificates_url,
    },
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-2xl">
                {vendor.company_name}
              </DialogTitle>
              <Badge
                variant="outline"
                className={
                  isDomestic
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-blue-300 bg-blue-50 text-blue-700"
                }
              >
                {isDomestic ? (
                  <>
                    <Flag className="w-3 h-3 mr-1" />
                    Domestic
                  </>
                ) : (
                  <>
                    <Globe className="w-3 h-3 mr-1" />
                    International
                  </>
                )}
              </Badge>
            </div>
            <Badge className={`${statusConfig[vendor.status]?.color} border`}>
              {statusConfig[vendor.status]?.label}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Company Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            {!isDomestic && (
              <TabsTrigger value="banking">Banking Info</TabsTrigger>
            )}
            <TabsTrigger value="review">Review &amp; Action</TabsTrigger>
          </TabsList>

          {/* Company details */}
          <TabsContent value="details" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Business Type</p>
                <p className="font-semibold capitalize">
                  {vendor.business_type?.replace(/_/g, " ")}
                </p>
              </div>
              {isDomestic ? (
                <div>
                  <p className="text-sm text-slate-500 mb-1">Tax ID / EIN</p>
                  <p className="font-semibold">{vendor.tax_id || "N/A"}</p>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">VAT Number</p>
                    <p className="font-semibold">
                      {vendor.vat_number || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">
                      Country of Incorporation
                    </p>
                    <p className="font-semibold">
                      {vendor.country_of_incorporation || "N/A"}
                    </p>
                  </div>
                </>
              )}
              <div>
                <p className="text-sm text-slate-500 mb-1">Industry</p>
                <p className="font-semibold capitalize">{vendor.industry}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Years in Business</p>
                <p className="font-semibold">
                  {vendor.years_in_business ?? "N/A"}{" "}
                  {vendor.years_in_business != null ? "years" : ""}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Annual Revenue</p>
                <p className="font-semibold">
                  {vendor.annual_revenue_range || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Website</p>
                <p className="font-semibold">{vendor.website || "N/A"}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-500 mb-1">Services Offered</p>
              <p className="font-semibold">
                {vendor.services_offered || "N/A"}
              </p>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg mb-4">
                Contact Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Primary Contact</p>
                  <p className="font-semibold">{vendor.primary_contact_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Email</p>
                  <p className="font-semibold">
                    {vendor.primary_contact_email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Phone</p>
                  <p className="font-semibold">
                    {vendor.primary_contact_phone || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg mb-4">Business Address</h3>
              <p className="text-slate-700">
                {vendor.business_address && `${vendor.business_address}, `}
                {vendor.city && `${vendor.city}, `}
                {vendor.state} {vendor.zip_code}
                {vendor.country && `, ${vendor.country}`}
              </p>
            </div>
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents" className="space-y-4 mt-6">
            <div>
              <h3 className="font-semibold text-lg mb-4">
                {isDomestic
                  ? "Domestic Vendor Documents"
                  : "International Vendor Documents"}
              </h3>
              <div className="space-y-3">
                {(isDomestic ? domesticDocuments : internationalDocuments).map(
                  ({ label, url }) => (
                    <div
                      key={label}
                      className="p-4 border border-slate-200 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-slate-500" />
                          <span className="font-medium">{label}</span>
                        </div>
                        {url ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
                          >
                            <span className="text-sm">View Document</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : (
                          <span className="text-sm text-slate-400">
                            Not uploaded
                          </span>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </TabsContent>

          {/* Banking (international only) */}
          {!isDomestic && (
            <TabsContent value="banking" className="space-y-6 mt-6">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 text-emerald-900">
                  <CreditCard className="w-5 h-5" />
                  International Banking Details
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Bank Name</p>
                    <p className="font-semibold">
                      {vendor.bank_name || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">
                      Preferred Currency
                    </p>
                    <p className="font-semibold">
                      {vendor.preferred_currency || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">
                      SWIFT/BIC Code
                    </p>
                    <p className="font-semibold font-mono">
                      {vendor.swift_code || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">IBAN</p>
                    <p className="font-semibold font-mono">
                      {vendor.iban || "Not provided"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-slate-600 mb-1">
                      Bank Account Number
                    </p>
                    <p className="font-semibold font-mono">
                      {vendor.bank_account_number || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}

          {/* Review & action */}
          <TabsContent value="review" className="space-y-6 mt-6">
            <div>
              <Label htmlFor="admin_notes">Admin Notes</Label>
              <Textarea
                id="admin_notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes about this vendor..."
                className="mt-2 h-24"
              />
            </div>

            {vendor.status !== "rejected" && (
              <div>
                <Label htmlFor="rejection_reason">
                  Rejection Reason (required when rejecting)
                </Label>
                <Textarea
                  id="rejection_reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide reason if rejecting this application..."
                  className="mt-2 h-24"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              {vendor.status !== "approved" && (
                <Button
                  onClick={handleApprove}
                  disabled={isUpdating}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve Vendor
                </Button>
              )}
              {vendor.status !== "rejected" && (
                <Button
                  onClick={handleReject}
                  disabled={isUpdating}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Application
                </Button>
              )}
              {vendor.status === "pending_review" && (
                <Button
                  onClick={handleMarkUnderReview}
                  disabled={isUpdating}
                  variant="outline"
                  className="flex-1"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Mark Under Review
                </Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
