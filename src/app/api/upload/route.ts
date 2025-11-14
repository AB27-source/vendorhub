import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export const runtime = "nodejs"; // needed because we use fs

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const originalName = file.name || "file";
    const ext = originalName.includes(".")
      ? originalName.split(".").pop()
      : "";
    const fileName = ext ? `${randomUUID()}.${ext}` : randomUUID();
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    // URL that the browser can use to access the file
    const file_url = `/uploads/${fileName}`;

    return NextResponse.json({ file_url });
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
