import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/applications  – list all applications
export async function GET() {
  try {
    const applications = await prisma.vendorApplication.findMany({
      orderBy: { created_date: "desc" },
    });
    return NextResponse.json(applications);
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
    const body = await req.json();

    // You can.validate here if you want; for now we trust the payload
    const application = await prisma.vendorApplication.create({
      data: {
        ...body,
        created_date: new Date(), // make sure this field exists in your Prisma model
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("POST /api/applications error:", error);
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}
