import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function firstDayOfCurrentMonth(): Date {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function fmtFY(d: Date): string {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1; 
  if (m >= 4) return `${y}-${String((y + 1) % 100).padStart(2, "0")}`;
  return `${y - 1}-${String(y % 100).padStart(2, "0")}`;
}

async function main() {
  const month = firstDayOfCurrentMonth();
  const fy = fmtFY(month);

  const samples = [
    {
      state: "Gujarat",
      district: "Surat",
      fy,
      month,
      householdsWorked: 123456,
      persondaysTotal: 789012,
      avgDaysPerHH: 38.4,
      womenPersondaysShare: 52.3,
      totalExpLakhs: 9123.4,
      jobcardsTotal: 456789,
      workersTotal: 678901,
    },
    {
      state: "Gujarat",
      district: "Ahmedabad",
      fy,
      month,
      householdsWorked: 84567,
      persondaysTotal: 412345,
      avgDaysPerHH: 31.2,
      womenPersondaysShare: 49.7,
      totalExpLakhs: 6345.7,
      jobcardsTotal: 345678,
      workersTotal: 523456,
    },
  ];

  for (const m of samples) {
    await prisma.metric.upsert({
      where: {
        state_district_fy_month: {
          state: m.state,
          district: m.district,
          fy: m.fy,
          month: m.month,
        },
      },
      update: {
        householdsWorked: m.householdsWorked,
        persondaysTotal: m.persondaysTotal,
        avgDaysPerHH: m.avgDaysPerHH,
        womenPersondaysShare: m.womenPersondaysShare,
        totalExpLakhs: m.totalExpLakhs,
        jobcardsTotal: m.jobcardsTotal,
        workersTotal: m.workersTotal,
      },
      create: { ...m },
    });
  }

  console.log("Seeded sample metrics for Gujarat.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
