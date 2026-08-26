import type { BillingConfiguration } from "@/domain/configuration/billing-configuration";

export function isBillableCategory(
  category: string,
  configuration: BillingConfiguration,
): boolean {
  return configuration.billableCategories.includes(category);
}
