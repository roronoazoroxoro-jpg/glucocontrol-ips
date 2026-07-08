import { NextResponse } from "next/server";
import { prisma, withDbTimeout } from "@/lib/db";
import { dbErrorResponse } from "@/lib/api-error";
import { getStaffUser, staffUnauthorizedResponse, sanitizeStaffUser } from "@/lib/admin";

export const runtime = "nodejs";

export async function GET() {
  try {
    const staff = await getStaffUser();
    if (!staff) return staffUnauthorizedResponse();
    return NextResponse.json({ user: sanitizeStaffUser(staff) });
  } catch (error) {
    return dbErrorResponse("api/admin/me", error);
  }
}
