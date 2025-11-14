"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Clock, CheckCircle2, XCircle } from "lucide-react";

type StatsOverviewProps = {
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
};

export default function StatsOverview({ stats }: StatsOverviewProps) {
  const statCards = [
    {
      title: "Total Applications",
      value: stats.total,
      icon: Users,
      color: "from-slate-500 to-slate-600",
    },
    {
      title: "Pending Review",
      value: stats.pending,
      icon: Clock,
      color: "from-amber-500 to-amber-600",
    },
    {
      title: "Approved",
      value: stats.approved,
      icon: CheckCircle2,
      color: "from-emerald-500 to-emerald-600",
    },
    {
      title: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      color: "from-red-500 to-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.title}
            className="bg-white/80 backdrop-blur-sm shadow-lg border-slate-200 relative overflow-hidden"
          >
            <div
              className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full transform translate-x-8 -translate-y-8`}
            />
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {stat.title}
                </CardTitle>
                <div
                  className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-10`}
                >
                  <Icon className="w-5 h-5 text-slate-700" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
