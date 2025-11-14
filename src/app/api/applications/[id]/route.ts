import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    return NextResponse.json(application);
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
    const body = await req.json();
    const { id: paramId } = await params;

    // Prefer the id from the URL, but fall back to body.id
    const id = paramId ?? body.id;

    if (!id) {
      return NextResponse.json(
        { error: "Missing application id" },
        { status: 400 }
      );
    }

    // Strip out fields we don't want to update directly
    const {
      id: _ignoreId,
      created_date: _ignoreCreated,
      updated_at: _ignoreUpdated,
      approved_date: _ignoreApproved,
      ...updateData
    } = body;

    const updated = await prisma.vendorApplication.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
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
