"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import VendorApplicationForm, {
  VendorApplicationFormData,
} from "@/components/vendor/VendorApplicationForm";
import ApplicationStatus from "@/components/vendor/ApplicationStatus";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  const queryClient = useQueryClient();

  // Load all applications (for now: "my" application is just the first one)
  const { data: applications = [], isLoading } = useQuery<VendorApplication[]>({
    queryKey: ["vendorApplications"],
    queryFn: async () => {
      const res = await fetch("/api/applications", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Failed to load applications");
      }
      return res.json();
    },
  });

  const myApplication = applications[0] ?? null;
  const hasApplication = !!myApplication;

  // Create new application
  const createMutation = useMutation({
    mutationFn: async (data: VendorApplicationFormData) => {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error("Failed to create application");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendorApplications"] });
      setShowForm(false);
    },
  });

  // Update existing application
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: VendorApplicationFormData;
    }) => {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error("Failed to update application");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendorApplications"] });
      setShowForm(false);
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleSave = (data: VendorApplicationFormData) => {
    if (myApplication) {
      updateMutation.mutate({ id: myApplication.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
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
        {hasApplication && !showForm && (
          <div className="space-y-6 mb-8">
            <ApplicationStatus
              application={myApplication}
              statusConfig={statusConfig}
            />

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-slate-200">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-xl">Application Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Company Name</p>
                    <p className="font-semibold text-slate-900">
                      {myApplication.company_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Business Type</p>
                    <p className="font-semibold text-slate-900 capitalize">
                      {myApplication.business_type?.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">
                      Primary Contact
                    </p>
                    <p className="font-semibold text-slate-900">
                      {myApplication.primary_contact_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Email</p>
                    <p className="font-semibold text-slate-900">
                      {myApplication.primary_contact_email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Industry</p>
                    <p className="font-semibold text-slate-900 capitalize">
                      {myApplication.industry}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">
                      Years in Business
                    </p>
                    <p className="font-semibold text-slate-900">
                      {myApplication.years_in_business || "N/A"}{" "}
                      {myApplication.years_in_business ? "years" : ""}
                    </p>
                  </div>
                </div>

                {/* {myApplication.admin_notes && (
                  <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-sm font-semibold text-slate-700 mb-2">
                      Admin Notes:
                    </p>
                    <p className="text-slate-600">
                      {myApplication.admin_notes}
                    </p>
                  </div>
                )} */}

                {myApplication.status === "rejected" &&
                  myApplication.rejection_reason && (
                    <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm font-semibold text-red-700 mb-2">
                        Rejection Reason:
                      </p>
                      <p className="text-red-600">
                        {myApplication.rejection_reason}
                      </p>
                    </div>
                  )}

                {(myApplication.status === "draft" ||
                  myApplication.status === "rejected") && (
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
            vendor={myApplication}
            onSave={handleSave}
            onCancel={() => setShowForm(false)}
            isLoading={isSaving}
          />
        )}
      </div>
    </div>
  );
}
