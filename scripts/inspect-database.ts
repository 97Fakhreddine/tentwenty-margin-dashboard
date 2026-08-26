import { prisma } from "../src/infrastructure/database/prisma";

async function main(): Promise<void> {
  const [employees, timesheets, salaries, projects, imports] =
    await Promise.all([
      prisma.employee.count(),
      prisma.timesheetEntry.count(),
      prisma.monthlySalary.count(),
      prisma.project.count(),
      prisma.importBatch.count(),
    ]);

  console.table({
    employees,
    timesheets,
    salaries,
    projects,
    imports,
  });

  const sampleProjects = await prisma.project.findMany({
    take: 5,
    orderBy: {
      referenceCode: "asc",
    },
  });

  console.table(sampleProjects);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
