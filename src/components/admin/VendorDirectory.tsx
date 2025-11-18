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
import { Eye, Building2 } from "lucide-react";

import type { VendorRow } from "./VendorsList";

type VendorDirectoryProps = {
  vendors: VendorRow[];
  isLoading: boolean;
  onSelectVendor: (vendor: VendorRow) => void;
};

export default function VendorDirectory({
  vendors,
  isLoading,
  onSelectVendor,
}: VendorDirectoryProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array(4)
          .fill(0)
          .map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 border rounded-lg"
            >
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
      </div>
    );
  }

  if (!vendors.length) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">No vendors yet</p>
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
            <TableHead>Primary Contact</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Approved On</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendors.map((vendor) => {
            const approvedDate = vendor.approved_date
              ? typeof vendor.approved_date === "string"
                ? new Date(vendor.approved_date)
                : vendor.approved_date
              : null;

            return (
              <TableRow key={vendor.id} className="hover:bg-slate-50">
                <TableCell>
                  <p className="font-semibold text-slate-900">
                    {vendor.company_name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {vendor.industry}
                  </p>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs text-slate-600">
                    {vendor.applicationCode}
                  </span>
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
                  <Badge variant="outline" className="capitalize">
                    {vendor.vendor_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  {approvedDate ? format(approvedDate, "MMM d, yyyy") : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectVendor(vendor)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
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
