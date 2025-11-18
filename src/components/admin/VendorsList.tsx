"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Eye, Building2, Globe, Flag } from "lucide-react";

type VendorStatus =
  | "draft"
  | "pending_review"
  | "under_review"
  | "approved"
  | "rejected"
  | "on_hold";

export type VendorRow = {
  id: string;
  applicationCode: string;
  company_name: string;
  business_type?: string | null;
  vendor_type: "domestic" | "international";
  primary_contact_name: string;
  primary_contact_email: string;
  industry: string;
  created_date: string | Date;
  approved_date?: string | Date | null;
  status: VendorStatus;
};

const statusConfig: Record<
  VendorStatus,
  {
    color: string;
    label: string;
  }
> = {
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

type VendorsListProps = {
  vendors: VendorRow[];
  isLoading: boolean;
  onSelectVendor: (vendor: VendorRow) => void;
};

export default function VendorsList({
  vendors,
  isLoading,
  onSelectVendor,
}: VendorsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 border rounded-lg"
            >
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
      </div>
    );
  }

  if (!vendors || vendors.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">No vendor applications found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead>Company</TableHead>
            <TableHead>Application Code</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendors.map((vendor) => {
            const createdDate =
              typeof vendor.created_date === "string"
                ? new Date(vendor.created_date)
                : vendor.created_date;

            return (
              <TableRow
                key={vendor.id}
                className="hover:bg-slate-50 transition-colors"
              >
                <TableCell>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {vendor.company_name}
                    </p>
                    <p className="text-sm text-slate-500 capitalize">
                      {vendor.business_type?.replace(/_/g, " ")}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="font-mono text-sm text-slate-600">
                    {vendor.applicationCode}
                  </p>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      vendor.vendor_type === "international"
                        ? "border-blue-300 bg-blue-50 text-blue-700"
                        : "border-green-300 bg-green-50 text-green-700"
                    }
                  >
                    {vendor.vendor_type === "international" ? (
                      <>
                        <Globe className="w-3 h-3 mr-1" />
                        International
                      </>
                    ) : (
                      <>
                        <Flag className="w-3 h-3 mr-1" />
                        Domestic
                      </>
                    )}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm font-medium">
                      {vendor.primary_contact_name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {vendor.primary_contact_email}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="capitalize">{vendor.industry}</span>
                </TableCell>
                <TableCell>
                  {format(createdDate, "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <Badge
                    className={`${statusConfig[vendor.status]?.color} border`}
                  >
                    {statusConfig[vendor.status]?.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectVendor(vendor)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
