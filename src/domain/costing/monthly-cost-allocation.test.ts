import { describe, expect, it } from "vitest";

import type { BillingConfiguration } from "@/domain/configuration/billing-configuration";
import type { MonthlySalary } from "@/domain/salaries/monthly-salary";
import type { TimesheetEntry } from "@/domain/timesheets/timesheet-entry";

import { calculateEmployeeProjectCost } from "./employee-project-cost";
import { calculateMonthlyCostAllocation } from "./monthly-cost-allocation";

const configuration: BillingConfiguration = {
  billableCategories: ["Projects", "Enhancements", "Hosting"],

  monthlyOverheadAed: 0,
};

const salaries: MonthlySalary[] = [
  {
    employeeNumber: "001",
    period: {
      year: 2025,
      month: 1,
    },
    amountAed: 1_000,
  },
  {
    employeeNumber: "002",
    period: {
      year: 2025,
      month: 1,
    },
    amountAed: 500,
  },
];

const entries: TimesheetEntry[] = [
  {
    period: {
      year: 2025,
      month: 1,
    },

    employeeNumber: "001",

    expenseType: "DL",

    department: "Development",

    designation: "Developer",

    category: "Projects",

    referenceCode: "Q001",

    projectOrTaskName: "Project",

    companyOrCostCenter: "Client",

    description: null,

    hours: 10,
  },

  {
    period: {
      year: 2025,
      month: 1,
    },

    employeeNumber: "001",

    expenseType: "IDL",

    department: "Development",

    designation: "Developer",

    category: "FC - Meetings",

    referenceCode: null,

    projectOrTaskName: "Meetings",

    companyOrCostCenter: null,

    description: null,

    hours: 10,
  },
];

describe("calculateMonthlyCostAllocation", () => {
  it("allocates support and non-billable costs to billable hours", () => {
    const allocation = calculateMonthlyCostAllocation({
      salaries,
      timesheetEntries: entries,
      configuration,
    });

    expect(allocation.totalSalaryAed).toBe(1_500);

    expect(allocation.supportStaffSalaryAed).toBe(500);

    expect(allocation.nonBillableTimeCostAed).toBe(500);

    expect(allocation.indirectCostPoolAed).toBe(1_000);

    expect(allocation.indirectHourlyRateAed).toBe(100);

    const employeeRate = allocation.employeeRates.get("001");

    expect(employeeRate?.directHourlyRateAed).toBe(50);

    const projectCost = calculateEmployeeProjectCost({
      hours: 10,

      directHourlyRateAed: employeeRate?.directHourlyRateAed ?? 0,

      indirectHourlyRateAed: allocation.indirectHourlyRateAed ?? 0,
    });

    expect(projectCost).toBe(1_500);
  });
});
