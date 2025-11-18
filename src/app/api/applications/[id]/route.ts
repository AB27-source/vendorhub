import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  normalizeApprovedDate,
  normalizeStatus,
  serializeApplication,
} from "../utils";

type Params = { id: string };

// GET /api/applications/[id]
export async function GET(
  _req: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;

    const application = await prisma.vendorApplication.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(serializeApplication(application));
  } catch (error) {
    console.error("GET /api/applications/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to load application" },
      { status: 500 }
    );
  }
}

// PATCH /api/applications/[id]
export async function PATCH(
  req: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const body = ((await req.json()) ?? {}) as Record<string, unknown>;
    const { id: paramId } = await params;

    // Prefer the id from the URL, but fall back to body.id
    const bodyId = typeof body.id === "string" ? body.id : undefined;
    const id = paramId ?? bodyId;

    if (!id) {
      return NextResponse.json(
        { error: "Missing application id" },
        { status: 400 }
      );
    }

    // Strip out fields we don't want to update directly
    const normalizedStatus = normalizeStatus(
      typeof body.status === "string" ? body.status : undefined
    );
    const normalizedApprovedDate = normalizeApprovedDate(
      typeof body.approved_date === "string" || body.approved_date instanceof Date
        ? (body.approved_date as string | Date)
        : undefined
    );

    const baseData: Record<string, unknown> = { ...body };
    delete baseData.id;
    delete baseData.created_date;
    delete baseData.updated_at;
    delete baseData.applicationCode;
    delete baseData.status;
    delete baseData.approved_date;

    const data: Prisma.VendorApplicationUpdateInput = {
      ...(baseData as Prisma.VendorApplicationUpdateInput),
    };

    if (normalizedStatus) {
      data.status = normalizedStatus;
      if (
        normalizedApprovedDate === undefined &&
        normalizedStatus === "APPROVED"
      ) {
        data.approved_date = new Date();
      }
      if (
        normalizedApprovedDate === undefined &&
        normalizedStatus !== "APPROVED"
      ) {
        data.approved_date = null;
      }
    }

    if (normalizedApprovedDate !== undefined) {
      data.approved_date = normalizedApprovedDate;
    }

    const updated = await prisma.vendorApplication.update({
      where: { id },
      data,
    });

    return NextResponse.json(serializeApplication(updated));
  } catch (error) {
    console.error("PATCH /api/applications/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}

// DELETE /api/applications/[id] (optional)
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;

    await prisma.vendorApplication.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/applications/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
