-- CreateTable
CREATE TABLE "Employee" (
    "employeeNumber" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "MonthlySalary" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeNumber" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "amountAed" REAL NOT NULL,
    CONSTRAINT "MonthlySalary_employeeNumber_fkey" FOREIGN KEY ("employeeNumber") REFERENCES "Employee" ("employeeNumber") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TimesheetEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "employeeNumber" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "expenseType" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "referenceCode" TEXT,
    "projectOrTaskName" TEXT,
    "companyOrCostCenter" TEXT,
    "description" TEXT,
    "hours" REAL NOT NULL,
    CONSTRAINT "TimesheetEntry_employeeNumber_fkey" FOREIGN KEY ("employeeNumber") REFERENCES "Employee" ("employeeNumber") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Project" (
    "referenceCode" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "priceAed" REAL NOT NULL,
    "salesYear" INTEGER NOT NULL,
    "salesMonth" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT
);

-- CreateTable
CREATE TABLE "ImportBatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kind" TEXT NOT NULL,
    "sourceFileName" TEXT NOT NULL,
    "recordCount" INTEGER NOT NULL,
    "warningCount" INTEGER NOT NULL DEFAULT 0,
    "importedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "MonthlySalary_year_month_idx" ON "MonthlySalary"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlySalary_employeeNumber_year_month_key" ON "MonthlySalary"("employeeNumber", "year", "month");

-- CreateIndex
CREATE INDEX "TimesheetEntry_year_month_idx" ON "TimesheetEntry"("year", "month");

-- CreateIndex
CREATE INDEX "TimesheetEntry_employeeNumber_year_month_idx" ON "TimesheetEntry"("employeeNumber", "year", "month");

-- CreateIndex
CREATE INDEX "TimesheetEntry_referenceCode_idx" ON "TimesheetEntry"("referenceCode");

-- CreateIndex
CREATE INDEX "TimesheetEntry_category_idx" ON "TimesheetEntry"("category");

-- CreateIndex
CREATE INDEX "Project_salesYear_salesMonth_idx" ON "Project"("salesYear", "salesMonth");
