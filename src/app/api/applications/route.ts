import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  generateApplicationCode,
  normalizeApprovedDate,
  normalizeStatus,
  serializeApplication,
} from "./utils";

// GET /api/applications  – list applications or fetch by code
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get("code");
    const email = searchParams.get("email");
    const includeAll = searchParams.get("includeAll") === "true";

    if (code) {
      if (!email) {
        return NextResponse.json(
          { error: "Email is required when querying by application code" },
          { status: 400 }
        );
      }

      const normalizedEmail = email.trim().toLowerCase();
      const application = await prisma.vendorApplication.findFirst({
        where: { applicationCode: code } as Prisma.VendorApplicationWhereInput,
      });

      if (!application) {
        return NextResponse.json(
          { error: "Application not found" },
          { status: 404 }
        );
      }

      if (application.primary_contact_email.toLowerCase() !== normalizedEmail) {
        return NextResponse.json(
          { error: "Application not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(serializeApplication(application));
    }

    if (email) {
      return NextResponse.json(
        { error: "Application code is required when querying by email" },
        { status: 400 }
      );
    }

    if (!includeAll) {
      return NextResponse.json([]);
    }

    const applications = await prisma.vendorApplication.findMany({
      orderBy: { created_date: "desc" },
    });
    return NextResponse.json(applications.map(serializeApplication));
  } catch (error) {
    console.error("GET /api/applications error:", error);
    return NextResponse.json(
      { error: "Failed to load applications" },
      { status: 500 }
    );
  }
}

// POST /api/applications – create a new application
export async function POST(req: Request) {
  try {
    const body = ((await req.json()) ?? {}) as Record<string, unknown>;

    const normalizedStatus = normalizeStatus(
      typeof body.status === "string" ? body.status : undefined
    );
    const normalizedApprovedDate = normalizeApprovedDate(
      typeof body.approved_date === "string" || body.approved_date instanceof Date
        ? (body.approved_date as string | Date)
        : undefined
    );
    const companyName =
      typeof body.company_name === "string" ? body.company_name : undefined;

    const baseData: Record<string, unknown> = { ...body };
    delete baseData.id;
    delete baseData.created_date;
    delete baseData.updated_at;
    delete baseData.status;
    delete baseData.approved_date;
    delete baseData.applicationCode;

    const data = {
      ...(baseData as Prisma.VendorApplicationUncheckedCreateInput),
      ...(normalizedStatus ? { status: normalizedStatus } : {}),
      ...(normalizedApprovedDate !== undefined
        ? { approved_date: normalizedApprovedDate }
        : {}),
      applicationCode: generateApplicationCode({
        providedCode:
          typeof body.applicationCode === "string"
            ? body.applicationCode
            : undefined,
        companyName,
      }),
      created_date: new Date(),
    } as Prisma.VendorApplicationUncheckedCreateInput;

    // You can.validate here if you want; for now we trust the payload
    const application = await prisma.vendorApplication.create({
      data,
    });

    return NextResponse.json(serializeApplication(application), {
      status: 201,
    });
  } catch (error) {
    console.error("POST /api/applications error:", error);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}
