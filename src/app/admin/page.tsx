"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import StatsOverview from "@/components/admin/StatsOverview";
import VendorsList from "@/components/admin/VendorsList";
import VendorDirectory from "@/components/admin/VendorDirectory";
import VendorReviewModal from "@/components/admin/VendorReviewModal";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function AdminPage() {
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<
    "applications" | "vendors"
  >("applications");
  const [activeApplicationTab, setActiveApplicationTab] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const queryClient = useQueryClient();

  // Load all vendor applications
  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ["allVendors"],
    queryFn: async () => {
      const res = await fetch("/api/applications?includeAll=true", {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Failed to load vendor applications");
      }
      return res.json();
    },
  });

  // Update a vendor (approve/reject/under_review, notes, etc.)
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        throw new Error("Failed to update vendor");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allVendors"] });
      setSelectedVendor(null);
    },
  });

  // Dashboard stats
  const stats = {
    total: vendors.length,
    pending: vendors.filter(
      (v: any) => v.status === "pending_review" || v.status === "under_review"
    ).length,
    approved: vendors.filter((v: any) => v.status === "approved").length,
    rejected: vendors.filter((v: any) => v.status === "rejected").length,
  };

  // Filtered list based on tab
  const filteredApplications =
    activeApplicationTab === "all"
      ? vendors
      : vendors.filter((v: any) => {
          if (activeApplicationTab === "pending") {
            return v.status === "pending_review" || v.status === "under_review";
          }
          return v.status === activeApplicationTab;
        });

  const approvedVendors = vendors.filter((v: any) => v.status === "approved");

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
          <p className="text-slate-600">Review and manage vendor applications</p>
        </div>

        <Tabs
          value={activeSection}
          onValueChange={(val) =>
            setActiveSection(val as "applications" | "vendors")
          }
          className="space-y-6"
        >
          <TabsList className="bg-slate-100 w-fit">
            <TabsTrigger value="applications" className="data-[state=active]:bg-white">
              Applications
            </TabsTrigger>
            <TabsTrigger value="vendors" className="data-[state=active]:bg-white">
              Vendors
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-6">
            <StatsOverview stats={stats} />

            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-slate-200">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-xl">Vendor Applications</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs
                  value={activeApplicationTab}
                  onValueChange={(val) =>
                    setActiveApplicationTab(
                      val as "all" | "pending" | "approved" | "rejected"
                    )
                  }
                >
                  <TabsList className="bg-slate-100 mb-6">
                    <TabsTrigger value="all" className="data-[state=active]:bg-white">
                      All Applications
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="data-[state=active]:bg-white">
                      Pending
                    </TabsTrigger>
                    <TabsTrigger value="approved" className="data-[state=active]:bg-white">
                      Approved
                    </TabsTrigger>
                    <TabsTrigger value="rejected" className="data-[state=active]:bg-white">
                      Rejected
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeApplicationTab}>
                    <VendorsList
                      vendors={filteredApplications}
                      isLoading={isLoading}
                      onSelectVendor={setSelectedVendor}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendors">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-slate-200">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-xl">Vendor Directory</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <VendorDirectory
                  vendors={approvedVendors}
                  isLoading={isLoading}
                  onSelectVendor={setSelectedVendor}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Review modal */}
      {selectedVendor && (
        <VendorReviewModal
          vendor={selectedVendor}
          onClose={() => setSelectedVendor(null)}
          onUpdate={(id, data) => updateMutation.mutate({ id, data })}
          isUpdating={updateMutation.isPending}
        />
      )}
    </div>
  );
}
