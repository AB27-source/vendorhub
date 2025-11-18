"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import VendorApplicationForm, {
  VendorApplicationFormData,
} from "@/components/vendor/VendorApplicationForm";
import ApplicationStatus from "@/components/vendor/ApplicationStatus";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Plus,
} from "lucide-react";

type VendorStatus =
  | "draft"
  | "pending_review"
  | "under_review"
  | "approved"
  | "rejected"
  | "on_hold";

type VendorApplication = VendorApplicationFormData & {
  id: string;
  created_date: string | Date;
  applicationCode: string;
  admin_notes?: string | null;
  rejection_reason?: string | null;
};

const statusConfig: Record<
  VendorStatus,
  {
    icon?: React.ComponentType<{ className?: string }>;
    color: string;
    label: string;
  }
> = {
  draft: {
    icon: FileText,
    color: "bg-slate-100 text-slate-700 border-slate-200",
    label: "Draft",
  },
  pending_review: {
    icon: Clock,
    color: "bg-amber-100 text-amber-700 border-amber-200",
    label: "Pending Review",
  },
  under_review: {
    icon: AlertCircle,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    label: "Under Review",
  },
  approved: {
    icon: CheckCircle2,
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    label: "Approved",
  },
  rejected: {
    icon: XCircle,
    color: "bg-red-100 text-red-700 border-red-200",
    label: "Rejected",
  },
  on_hold: {
    icon: AlertCircle,
    color: "bg-orange-100 text-orange-700 border-orange-200",
    label: "On Hold",
  },
};

export default function ApplyPage() {
  const [showForm, setShowForm] = useState(false);
  const [storedCode, setStoredCode] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("vendorApplicationCode");
    }
    return null;
  });
  const [storedEmail, setStoredEmail] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return window.localStorage.getItem("vendorApplicationEmail");
    }
    return null;
  });
  const [lookupCode, setLookupCode] = useState("");
  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupError, setLookupError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const persistApplicationAccess = (code: string, email: string) => {
    const normalizedCode = code.trim();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedCode || !normalizedEmail) return;
    setStoredCode(normalizedCode);
    setStoredEmail(normalizedEmail);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("vendorApplicationCode", normalizedCode);
      window.localStorage.setItem("vendorApplicationEmail", normalizedEmail);
    }
    setLookupError(null);
  };

  const clearStoredAccess = (resetError = true) => {
    setStoredCode(null);
    setStoredEmail(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("vendorApplicationCode");
      window.localStorage.removeItem("vendorApplicationEmail");
    }
    setLookupCode("");
    setLookupEmail("");
    if (resetError) {
      setLookupError(null);
    }
  };

  const hasStoredCredentials = Boolean(storedCode && storedEmail);

  const { data: myApplication, isLoading: isApplicationLoading } =
    useQuery<VendorApplication | null>({
      queryKey: ["vendorApplication", storedCode, storedEmail],
      queryFn: async () => {
        if (!storedCode || !storedEmail) return null;
        const params = new URLSearchParams({
          code: storedCode,
          email: storedEmail,
        });
        const res = await fetch(`/api/applications?${params.toString()}`, {
          cache: "no-store",
        });
        if (res.status === 404) {
          const missingCode = storedCode;
          const missingEmail = storedEmail;
          clearStoredAccess(false);
          setLookupCode(missingCode ?? "");
          setLookupEmail(missingEmail ?? "");
          setLookupError(
            "We couldn't find an application with that code and email. Please try again."
          );
          return null;
        }
        if (res.status === 400) {
          clearStoredAccess(false);
          setLookupError("Please provide both an application code and email.");
          return null;
        }
        if (!res.ok) {
          throw new Error("Failed to load application");
        }
        return res.json();
      },
      enabled: hasStoredCredentials,
      retry: false,
    });

  const currentApplication = hasStoredCredentials ? myApplication : null;
  const hasApplication = !!currentApplication;
  const isInitialLoading = Boolean(
    hasStoredCredentials && isApplicationLoading && !currentApplication
  );

  const handleLookupSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedCode = lookupCode.trim();
    const trimmedEmail = lookupEmail.trim();
    if (!trimmedCode || !trimmedEmail) {
      setLookupError("Please enter both your application code and email.");
      return;
    }
    persistApplicationAccess(trimmedCode, trimmedEmail);
    setLookupCode("");
    setLookupEmail("");
  };

  const handleUseDifferentCode = () => {
    clearStoredAccess();
    setShowForm(false);
  };

  const handleStartNewApplication = () => {
    clearStoredAccess();
    setShowForm(true);
  };

  // Create new application
  const createMutation = useMutation<
    VendorApplication,
    Error,
    VendorApplicationFormData
  >({
    mutationFn: async (data: VendorApplicationFormData) => {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error("Failed to create application");
      }
      return res.json() as Promise<VendorApplication>;
    },
    onSuccess: (application) => {
      persistApplicationAccess(
        application.applicationCode,
        application.primary_contact_email
      );
      queryClient.invalidateQueries({
        queryKey: ["vendorApplication"],
        exact: false,
      });
      setShowForm(false);
    },
  });

  // Update existing application
  const updateMutation = useMutation<
    VendorApplication,
    Error,
    { id: string; data: VendorApplicationFormData }
  >({
    mutationFn: async ({ id, data }) => {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error("Failed to update application");
      }
      return res.json() as Promise<VendorApplication>;
    },
    onSuccess: (application) => {
      persistApplicationAccess(
        application.applicationCode,
        application.primary_contact_email
      );
      queryClient.invalidateQueries({
        queryKey: ["vendorApplication"],
        exact: false,
      });
      setShowForm(false);
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSave = (data: VendorApplicationFormData) => {
    if (currentApplication) {
      updateMutation.mutate({ id: currentApplication.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Vendor Application
          </h1>
          <p className="text-slate-600">
            Submit and manage your vendor onboarding application
          </p>
        </div>

        {/* Lookup existing application */}
        {!storedCode && !showForm && (
          <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-slate-200 mb-8">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-xl">Already submitted?</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-slate-600 mb-4">
                Enter your application code and the email used on the submission to view its status.
              </p>
              <form
                className="flex flex-col gap-3 md:flex-row"
                onSubmit={handleLookupSubmit}
              >
                <Input
                  value={lookupCode}
                  onChange={(event) => setLookupCode(event.target.value)}
                  placeholder="Application Code"
                  className="md:flex-1"
                />
                <Input
                  type="email"
                  value={lookupEmail}
                  onChange={(event) => setLookupEmail(event.target.value)}
                  placeholder="Email used on submission"
                  className="md:flex-1"
                />
                <Button
                  type="submit"
                  className="bg-slate-900 text-white w-full md:w-auto"
                >
                  Check Status
                </Button>
              </form>
              {lookupError && (
                <p className="text-sm text-red-600 mt-3">{lookupError}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {!hasApplication && !showForm && (
          <Card className="border-2 border-dashed border-slate-300 bg-white/50 backdrop-blur-sm shadow-lg mb-8">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                No Application Yet
              </h2>
              <p className="text-slate-600 mb-6">
                Start your vendor onboarding by creating an application.
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 text-lg h-auto"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Application
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Existing application summary + status */}
        {hasApplication && currentApplication && !showForm && (
          <div className="space-y-6 mb-8">
            <ApplicationStatus
              application={currentApplication}
              statusConfig={statusConfig}
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-500">Application Code</p>
                <p className="font-mono text-lg text-slate-900">
                  {currentApplication.applicationCode}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  onClick={handleUseDifferentCode}
                  className="whitespace-nowrap"
                >
                  Enter Different Code
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleStartNewApplication}
                  className="whitespace-nowrap"
                >
                  Start New Application
                </Button>
              </div>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-slate-200">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-xl">Application Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                      <p className="text-sm text-slate-500 mb-1">Company Name</p>
                      <p className="font-semibold text-slate-900">
                      {currentApplication.company_name}
                      </p>
                    </div>
                  <div>
                      <p className="text-sm text-slate-500 mb-1">Business Type</p>
                      <p className="font-semibold text-slate-900 capitalize">
                      {currentApplication.business_type?.replace(/_/g, " ")}
                      </p>
                    </div>
                  <div>
                      <p className="text-sm text-slate-500 mb-1">
                        Primary Contact
                      </p>
                      <p className="font-semibold text-slate-900">
                      {currentApplication.primary_contact_name}
                      </p>
                    </div>
                  <div>
                      <p className="text-sm text-slate-500 mb-1">Email</p>
                      <p className="font-semibold text-slate-900">
                      {currentApplication.primary_contact_email}
                      </p>
                    </div>
                  <div>
                      <p className="text-sm text-slate-500 mb-1">Industry</p>
                      <p className="font-semibold text-slate-900 capitalize">
                      {currentApplication.industry}
                      </p>
                    </div>
                  <div>
                      <p className="text-sm text-slate-500 mb-1">
                        Years in Business
                      </p>
                      <p className="font-semibold text-slate-900">
                      {currentApplication.years_in_business || "N/A"}{" "}
                      {currentApplication.years_in_business ? "years" : ""}
                      </p>
                    </div>
                  </div>

                {/* {currentApplication.admin_notes && (
                  <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm font-semibold text-slate-700 mb-2">
                      Admin Notes:
                    </p>
                    <p className="text-slate-600">
                      {currentApplication.admin_notes}
                    </p>
                  </div>
                )} */}

                {currentApplication.status === "rejected" &&
                  currentApplication.rejection_reason && (
                    <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm font-semibold text-red-700 mb-2">
                        Rejection Reason:
                      </p>
                      <p className="text-red-600">
                        {currentApplication.rejection_reason}
                      </p>
                    </div>
                  )}

                {(currentApplication.status === "draft" ||
                  currentApplication.status === "rejected") && (
                  <div className="mt-6">
                    <Button
                      onClick={() => setShowForm(true)}
                      className="bg-slate-900 hover:bg-slate-800 text-white"
                    >
                      Edit Application
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Form (for new OR edit) */}
        {showForm && (
          <VendorApplicationForm
            vendor={currentApplication}
            onSave={handleSave}
            onCancel={() => setShowForm(false)}
            isLoading={isSaving}
          />
        )}
      </div>
    </div>
  );
}
