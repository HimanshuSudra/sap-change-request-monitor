// src/services/settings.service.ts
import prisma from "@/lib/prisma";
import { FilterOptions } from "@/types";

/** Get all filter options grouped by key */
export async function getFilterOptions(): Promise<FilterOptions> {
  const settings = await prisma.setting.findMany({
    where: { active: true },
    orderBy: [{ key: "asc" }, { order: "asc" }],
  });

  const grouped: Record<string, string[]> = {};
  for (const s of settings) {
    if (!grouped[s.key]) grouped[s.key] = [];
    grouped[s.key].push(s.value);
  }

  // Always include the hardcoded trMovedBy options
  grouped.trMovedBy = ["Lokesh", "Manoj"];

  // Collect distinct years from records
  const yearRows = await prisma.changeRecord.findMany({
    select: { year: true },
    distinct: ["year"],
    orderBy: { year: "desc" },
  });
  const years = yearRows.map((r) => r.year).filter(Boolean);

  return {
    typeOfRequest: grouped.typeOfRequest ?? [],
    status: grouped.status ?? [],
    moveTo: grouped.moveTo ?? [],
    trMovedBy: grouped.trMovedBy,
    years,
  };
}

/** Add a new setting option */
export async function createSettingOption(key: string, value: string) {
  return prisma.setting.create({
    data: { key, value, order: 999 },
  });
}

/** Remove a setting option */
export async function deleteSettingOption(id: string) {
  return prisma.setting.delete({ where: { id } });
}
