"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type VendorStatus =
  | "draft"
  | "pending_review"
  | "under_review"
  | "approved"
  | "rejected"
  | "on_hold";

type StatusConfigEntry = {
  icon?: React.ComponentType<{ className?: string }>;
  color: string;  // Tailwind classes e.g. "bg-slate-100 text-slate-700 border-slate-200"
  label: string;
};

type ApplicationStatusProps = {
  application: {
    status: VendorStatus;
    created_date: string | Date; // Prisma JSON will send a string
    applicationCode?: string | null;
  };
  statusConfig: Record<string, StatusConfigEntry>; // keep flexible for now
};

export default function ApplicationStatus({
  application,
  statusConfig,
}: ApplicationStatusProps) {
  const status = statusConfig[application.status];
  const StatusIcon = status?.icon;

  const createdDate =
    typeof application.created_date === "string"
      ? new Date(application.created_date)
      : application.created_date;

  return (
    <Card className="bg-gradient-to-br from-white to-slate-50 shadow-lg border-slate-200">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-xl">Application Status</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {StatusIcon && (
              <div
                className={`w-12 h-12 rounded-full ${status.color} border flex items-center justify-center`}
              >
                <StatusIcon className="w-6 h-6" />
              </div>
            )}
            <div>
              <p className="text-sm text-slate-500">Current Status</p>
              <Badge
                className={`${status.color} border mt-1 text-base px-3 py-1`}
              >
                {status.label}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Submitted</p>
            <p className="font-semibold text-slate-900">
              {format(createdDate, "MMM d, yyyy")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {["draft", "pending_review", "under_review", "approved"].map(
            (statusKey, index) => {
              const order = [
                "draft",
                "pending_review",
                "under_review",
                "approved",
              ];
              const isActive =
                order.indexOf(application.status) >= index;
              const isCurrent = application.status === statusKey;

              return (
                <div
                  key={statusKey}
                  className={`h-2 rounded-full transition-all ${
                    isCurrent
                      ? "bg-slate-900"
                      : isActive
                      ? "bg-emerald-500"
                      : "bg-slate-200"
                  }`}
                />
              );
            },
          )}
        </div>

      </CardContent>
    </Card>
  );
}
