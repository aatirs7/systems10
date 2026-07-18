import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { brands } from "@/db/schema";
import { requireApiKey } from "@/lib/api-auth";

// GET /api/marketplace/claimable
// LMS handoff stub (spec §3.8): brands with status "closed" become claimable in the student
// marketplace. Claim rules and the student-facing detail view live in the separate LMS spec;
// this is the acquisition side's read contract.
export async function GET(req: Request) {
  const unauthorized = requireApiKey(req);
  if (unauthorized) return unauthorized;

  const rows = await db
    .select({
      id: brands.id,
      brandName: brands.brandName,
      tiktokHandle: brands.tiktokHandle,
      monthlyGmv: brands.monthlyGmv,
      category: brands.category,
      domain: brands.domain,
      dateSourced: brands.dateSourced,
    })
    .from(brands)
    .where(eq(brands.status, "closed"))
    .orderBy(desc(brands.monthlyGmv));

  return NextResponse.json({ count: rows.length, claimable: rows });
}
