import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";
import { brands, contacts, outreachLog } from "../src/db/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
}

const db = drizzle(neon(process.env.DATABASE_URL), { schema });

async function main() {
  console.log("Seeding demo brands...");

  // Clear existing demo data (outreach + contacts cascade from brands).
  await db.delete(outreachLog);
  await db.delete(contacts);
  await db.delete(brands);

  const inserted = await db
    .insert(brands)
    .values([
      {
        brandName: "Glow Ritual",
        tiktokHandle: "glowritual",
        monthlyGmv: "48000",
        category: "Beauty",
        status: "sourced",
      },
      {
        brandName: "PeakForm Supplements",
        tiktokHandle: "peakformsupps",
        monthlyGmv: "120000",
        category: "Health",
        domain: "peakform.co",
        contactType: "owner",
        status: "ready_to_contact",
      },
      {
        brandName: "Nimbus Home",
        tiktokHandle: "nimbushome",
        monthlyGmv: "82000",
        category: "Home",
        contactType: "owner",
        status: "sequencing",
      },
      {
        brandName: "Lumen Skincare",
        tiktokHandle: "lumenskin",
        monthlyGmv: "205000",
        category: "Beauty",
        domain: "lumenskin.com",
        contactType: "owner",
        status: "interested",
      },
      {
        brandName: "Trailhead Gear",
        tiktokHandle: "trailheadgear",
        monthlyGmv: "64000",
        category: "Outdoors",
        contactType: "generic",
        status: "closed",
      },
    ])
    .returning();

  const bySlug = Object.fromEntries(inserted.map((b) => [b.tiktokHandle, b]));

  await db.insert(contacts).values([
    {
      brandId: bySlug["peakformsupps"].id,
      contactName: "Dana Ruiz",
      title: "Founder",
      email: "dana@peakform.co",
      emailVerified: true,
      linkedinUrl: "https://www.linkedin.com/in/example-dana",
    },
    {
      brandId: bySlug["nimbushome"].id,
      contactName: "Kai Osei",
      title: "Co-Founder",
      email: "kai@nimbushome.com",
      emailVerified: true,
    },
    {
      brandId: bySlug["lumenskin"].id,
      contactName: "Priya Nair",
      title: "CEO",
      email: "priya@lumenskin.com",
      emailVerified: true,
      linkedinUrl: "https://www.linkedin.com/in/example-priya",
    },
    {
      brandId: bySlug["trailheadgear"].id,
      contactName: null,
      title: null,
      email: "hello@trailheadgear.com",
      emailVerified: false,
    },
  ]);

  await db.insert(outreachLog).values([
    {
      brandId: bySlug["nimbushome"].id,
      channel: "email",
      sequenceStep: 1,
      sentAt: new Date(),
      opened: true,
      replied: false,
    },
    {
      brandId: bySlug["lumenskin"].id,
      channel: "email",
      sequenceStep: 2,
      sentAt: new Date(),
      opened: true,
      replied: true,
      replySentiment: "positive",
    },
  ]);

  console.log(`Seeded ${inserted.length} brands.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
