"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Upload,
  X,
  FileText,
  Loader2,
  Save,
  Globe,
  Flag,
} from "lucide-react";
import { toast } from "sonner";

type VendorStatus =
  | "draft"
  | "pending_review"
  | "under_review"
  | "approved"
  | "rejected"
  | "on_hold";

export type VendorApplicationFormData = {
  vendor_type: "domestic" | "international";
  company_name: string;
  business_type: string;
  tax_id: string;
  vat_number: string;
  country_of_incorporation: string;
  primary_contact_name: string;
  primary_contact_email: string;
  primary_contact_phone: string;
  business_address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  website: string;
  industry: string;
  years_in_business: number | ""; // allow empty in the UI
  annual_revenue_range: string;
  services_offered: string;
  business_license_url: string;
  tax_document_url: string;
  insurance_certificate_url: string;
  business_registration_url: string;
  certificate_of_good_standing_url: string;
  bank_details_document_url: string;
  import_export_license_url: string;
  compliance_certificates_url: string;
  vat_registration_url: string;
  bank_name: string;
  bank_account_number: string;
  swift_code: string;
  iban: string;
  preferred_currency: string;
  status: VendorStatus;
};

type VendorApplicationFormProps = {
  vendor?: Partial<VendorApplicationFormData> | null;
  onSave: (data: VendorApplicationFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
};

export default function VendorApplicationForm({
  vendor,
  onSave,
  onCancel,
  isLoading,
}: VendorApplicationFormProps) {
  const [formData, setFormData] = useState<VendorApplicationFormData>({
    vendor_type: "domestic",
    company_name: "",
    business_type: "",
    tax_id: "",
    vat_number: "",
    country_of_incorporation: "",
    primary_contact_name: "",
    primary_contact_email: "",
    primary_contact_phone: "",
    business_address: "",
    city: "",
    state: "",
    zip_code: "",
    country: "United States",
    website: "",
    industry: "",
    years_in_business: "",
    annual_revenue_range: "",
    services_offered: "",
    business_license_url: "",
    tax_document_url: "",
    insurance_certificate_url: "",
    business_registration_url: "",
    certificate_of_good_standing_url: "",
    bank_details_document_url: "",
    import_export_license_url: "",
    compliance_certificates_url: "",
    vat_registration_url: "",
    bank_name: "",
    bank_account_number: "",
    swift_code: "",
    iban: "",
    preferred_currency: "",
    status: "draft",
    ...(vendor ?? {}),
  });

  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const handleInputChange = (field: keyof VendorApplicationFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // NEW: uses your /api/upload route instead of base44.integrations.Core.UploadFile
  const handleFileUpload = async (field: keyof VendorApplicationFormData, file: File | null) => {
    if (!file) return;

    setUploading((prev) => ({ ...prev, [field]: true }));
    try {
      const body = new FormData();
      body.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const { file_url } = (await res.json()) as { file_url: string };
      handleInputChange(field, file_url);
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleSubmit = (status: VendorStatus) => {
    const dataToSave: VendorApplicationFormData = {
      ...formData,
      status,
      years_in_business:
        formData.years_in_business === ""
          ? ""
          : Number(formData.years_in_business),
    };
    onSave(dataToSave);
  };

  const isDomestic = formData.vendor_type === "domestic";

  return (
    <div className="space-y-6">
      {/* Vendor type */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
        <CardHeader className="border-b border-blue-100">
          <CardTitle className="text-xl flex items-center gap-2">
            <Globe className="w-6 h-6 text-blue-600" />
            Vendor Type
          </CardTitle>
          <CardDescription>
            Select whether you are a domestic or international vendor
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <RadioGroup
            value={formData.vendor_type}
            onValueChange={(value: "domestic" | "international") =>
              handleInputChange("vendor_type", value)
            }
            className="grid grid-cols-2 gap-4"
          >
            <div className="relative">
              <RadioGroupItem value="domestic" id="domestic" className="peer sr-only" />
              <Label
                htmlFor="domestic"
                className="flex flex-col items-center justify-center rounded-lg border-2 border-slate-200 bg-white p-6 hover:bg-slate-50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 cursor-pointer transition-all"
              >
                <Flag className="w-8 h-8 mb-3 text-blue-600" />
                <span className="text-lg font-semibold">Domestic Vendor</span>
                <span className="text-sm text-slate-500 mt-1 text-center">
                  Operating within the United States
                </span>
              </Label>
            </div>
            <div className="relative">
              <RadioGroupItem
                value="international"
                id="international"
                className="peer sr-only"
              />
              <Label
                htmlFor="international"
                className="flex flex-col items-center justify-center rounded-lg border-2 border-slate-200 bg-white p-6 hover:bg-slate-50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50 cursor-pointer transition-all"
              >
                <Globe className="w-8 h-8 mb-3 text-blue-600" />
                <span className="text-lg font-semibold">International Vendor</span>
                <span className="text-sm text-slate-500 mt-1 text-center">
                  Operating outside the United States
                </span>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Company info */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-slate-200">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-xl">Company Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) =>
                  handleInputChange("company_name", e.target.value)
                }
                placeholder="ABC Corporation"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="business_type">Business Type *</Label>
              <Select
                value={formData.business_type}
                onValueChange={(value) =>
                  handleInputChange("business_type", value)
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sole_proprietorship">
                    Sole Proprietorship
                  </SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="llc">LLC</SelectItem>
                  <SelectItem value="corporation">Corporation</SelectItem>
                  <SelectItem value="non_profit">Non-Profit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isDomestic ? (
              <div>
                <Label htmlFor="tax_id">Tax ID / EIN *</Label>
                <Input
                  id="tax_id"
                  value={formData.tax_id}
                  onChange={(e) => handleInputChange("tax_id", e.target.value)}
                  placeholder="XX-XXXXXXX"
                  className="mt-1"
                />
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="vat_number">
                    VAT / Tax Registration Number *
                  </Label>
                  <Input
                    id="vat_number"
                    value={formData.vat_number}
                    onChange={(e) =>
                      handleInputChange("vat_number", e.target.value)
                    }
                    placeholder="Enter VAT number"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="country_of_incorporation">
                    Country of Incorporation *
                  </Label>
                  <Input
                    id="country_of_incorporation"
                    value={formData.country_of_incorporation}
                    onChange={(e) =>
                      handleInputChange(
                        "country_of_incorporation",
                        e.target.value,
                      )
                    }
                    placeholder="e.g., United Kingdom"
                    className="mt-1"
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="industry">Industry *</Label>
              <Select
                value={formData.industry}
                onValueChange={(value) => handleInputChange("industry", value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="services">Services</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="construction">Construction</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="logistics">Logistics</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="years_in_business">
                Years in Business{" "}
                <span className="text-slate-400 font-normal">(Optional)</span>
              </Label>
              <Input
                id="years_in_business"
                type="number"
                value={formData.years_in_business}
                onChange={(e) =>
                  handleInputChange(
                    "years_in_business",
                    e.target.value === ""
                      ? ""
                      : Number(e.target.value),
                  )
                }
                placeholder="5"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="annual_revenue_range">
                Annual Revenue Range{" "}
                <span className="text-slate-400 font-normal">(Optional)</span>
              </Label>
              <Select
                value={formData.annual_revenue_range}
                onValueChange={(value) =>
                  handleInputChange("annual_revenue_range", value)
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-100k">$0 - $100K</SelectItem>
                  <SelectItem value="100k-500k">$100K - $500K</SelectItem>
                  <SelectItem value="500k-1m">$500K - $1M</SelectItem>
                  <SelectItem value="1m-5m">$1M - $5M</SelectItem>
                  <SelectItem value="5m-10m">$5M - $10M</SelectItem>
                  <SelectItem value="10m+">$10M+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) =>
                  handleInputChange("website", e.target.value)
                }
                placeholder="https://example.com"
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="services_offered">
              Services / Products Offered
            </Label>
            <Textarea
              id="services_offered"
              value={formData.services_offered}
              onChange={(e) =>
                handleInputChange("services_offered", e.target.value)
              }
              placeholder="Describe your services or products..."
              className="mt-1 h-24"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact info */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-slate-200">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-xl">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primary_contact_name">
                Primary Contact Name *
              </Label>
              <Input
                id="primary_contact_name"
                value={formData.primary_contact_name}
                onChange={(e) =>
                  handleInputChange("primary_contact_name", e.target.value)
                }
                placeholder="John Doe"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="primary_contact_email">Email *</Label>
              <Input
                id="primary_contact_email"
                type="email"
                value={formData.primary_contact_email}
                onChange={(e) =>
                  handleInputChange("primary_contact_email", e.target.value)
                }
                placeholder="john@example.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="primary_contact_phone">Phone</Label>
              <Input
                id="primary_contact_phone"
                value={formData.primary_contact_phone}
                onChange={(e) =>
                  handleInputChange("primary_contact_phone", e.target.value)
                }
                placeholder="+1 (555) 123-4567"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business address */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-slate-200">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-xl">Business Address</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label htmlFor="business_address">Street Address</Label>
            <Input
              id="business_address"
              value={formData.business_address}
              onChange={(e) =>
                handleInputChange("business_address", e.target.value)
              }
              placeholder="123 Main Street"
              className="mt-1"
            />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="New York"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="state">
                {isDomestic ? "State" : "State/Province"}
              </Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                placeholder={isDomestic ? "NY" : "State/Province"}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="zip_code">
                {isDomestic ? "ZIP Code" : "Postal Code"}
              </Label>
              <Input
                id="zip_code"
                value={formData.zip_code}
                onChange={(e) =>
                  handleInputChange("zip_code", e.target.value)
                }
                placeholder={isDomestic ? "10001" : "Postal Code"}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="country">Country *</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) =>
                handleInputChange("country", e.target.value)
              }
              placeholder="United States"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Banking info for international */}
      {!isDomestic && (
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 shadow-lg">
          <CardHeader className="border-b border-emerald-100">
            <CardTitle className="text-xl text-emerald-900">
              Banking Information
            </CardTitle>
            <CardDescription>
              Required for international wire transfers
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name}
                  onChange={(e) =>
                    handleInputChange("bank_name", e.target.value)
                  }
                  placeholder="International Bank"
                  className="mt-1 bg-white"
                />
              </div>
              <div>
                <Label htmlFor="preferred_currency">Preferred Currency</Label>
                <Input
                  id="preferred_currency"
                  value={formData.preferred_currency}
                  onChange={(e) =>
                    handleInputChange("preferred_currency", e.target.value)
                  }
                  placeholder="EUR, GBP, etc."
                  className="mt-1 bg-white"
                />
              </div>
              <div>
                <Label htmlFor="swift_code">SWIFT/BIC Code</Label>
                <Input
                  id="swift_code"
                  value={formData.swift_code}
                  onChange={(e) =>
                    handleInputChange("swift_code", e.target.value)
                  }
                  placeholder="AAAA BB CC 123"
                  className="mt-1 bg-white"
                />
              </div>
              <div>
                <Label htmlFor="iban">IBAN (if applicable)</Label>
                <Input
                  id="iban"
                  value={formData.iban}
                  onChange={(e) =>
                    handleInputChange("iban", e.target.value)
                  }
                  placeholder="GB29 NWBK 6016 1331 9268 19"
                  className="mt-1 bg-white"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="bank_account_number">
                  Bank Account Number
                </Label>
                <Input
                  id="bank_account_number"
                  value={formData.bank_account_number}
                  onChange={(e) =>
                    handleInputChange(
                      "bank_account_number",
                      e.target.value,
                    )
                  }
                  placeholder="Account number"
                  className="mt-1 bg-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-slate-200">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-xl">
            {isDomestic
              ? "Required Documents - Domestic Vendor"
              : "Required Documents - International Vendor"}
          </CardTitle>
          <CardDescription>
            {isDomestic
              ? "Please upload the following documents for domestic vendor registration"
              : "Please upload the following documents for international vendor registration"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {isDomestic ? (
            <>
              {[
                {
                  field: "business_license_url",
                  label: "Business License",
                  required: true,
                },
                {
                  field: "tax_document_url",
                  label: "W-9 Tax Form",
                  required: true,
                },
                {
                  field: "insurance_certificate_url",
                  label: "Certificate of Insurance",
                  required: true,
                },
              ].map(({ field, label, required }) => (
                <div
                  key={field}
                  className="p-4 border border-slate-200 rounded-lg"
                >
                  <Label className="text-sm font-semibold mb-2 block">
                    {label} {required && <span className="text-red-500">*</span>}
                  </Label>
                  {formData[field as keyof VendorApplicationFormData] ? (
                    <div className="flex items-center justify-between">
                      <a
                        href={
                          formData[field as keyof VendorApplicationFormData] as string
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
                      >
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">View Document</span>
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleInputChange(
                            field as keyof VendorApplicationFormData,
                            "",
                          )
                        }
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        id={field}
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(
                            field as keyof VendorApplicationFormData,
                            e.target.files?.[0] ?? null,
                          )
                        }
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <Button
                        variant="outline"
                        onClick={() =>
                          document.getElementById(field)?.click()
                        }
                        disabled={uploading[field]}
                        className="w-full"
                      >
                        {uploading[field] ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload {label}
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <>
              {[
                {
                  field: "business_registration_url",
                  label:
                    "Certificate of Incorporation/Business Registration",
                  required: true,
                },
                {
                  field: "tax_document_url",
                  label: "W-8BEN / W-8BEN-E Tax Form",
                  required: true,
                },
                {
                  field: "vat_registration_url",
                  label: "VAT Registration Certificate",
                  required: true,
                },
                {
                  field: "certificate_of_good_standing_url",
                  label: "Certificate of Good Standing",
                  required: true,
                },
                {
                  field: "bank_details_document_url",
                  label: "Bank Account Verification Document",
                  required: true,
                },
                {
                  field: "insurance_certificate_url",
                  label: "Certificate of Insurance",
                  required: false,
                },
                {
                  field: "import_export_license_url",
                  label: "Import/Export License (if applicable)",
                  required: false,
                },
                {
                  field: "compliance_certificates_url",
                  label: "Industry Compliance Certificates",
                  required: false,
                },
              ].map(({ field, label, required }) => (
                <div
                  key={field}
                  className="p-4 border border-slate-200 rounded-lg"
                >
                  <Label className="text-sm font-semibold mb-2 block">
                    {label} {required && <span className="text-red-500">*</span>}
                  </Label>
                  {formData[field as keyof VendorApplicationFormData] ? (
                    <div className="flex items-center justify-between">
                      <a
                        href={
                          formData[field as keyof VendorApplicationFormData] as string
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
                      >
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">View Document</span>
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleInputChange(
                            field as keyof VendorApplicationFormData,
                            "",
                          )
                        }
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        id={field}
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(
                            field as keyof VendorApplicationFormData,
                            e.target.files?.[0] ?? null,
                          )
                        }
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <Button
                        variant="outline"
                        onClick={() =>
                          document.getElementById(field)?.click()
                        }
                        disabled={uploading[field]}
                        className="w-full"
                      >
                        {uploading[field] ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload {label}
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6"
        >
          Cancel
        </Button>
        <Button
          variant="outline"
          onClick={() => handleSubmit("draft")}
          disabled={isLoading}
          className="px-6"
        >
          <Save className="w-4 h-4 mr-2" />
          Save as Draft
        </Button>
        <Button
          onClick={() => handleSubmit("pending_review")}
          disabled={isLoading}
          className="bg-slate-900 hover:bg-slate-800 text-white px-6"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit for Review"
          )}
        </Button>
      </div>
    </div>
  );
}
