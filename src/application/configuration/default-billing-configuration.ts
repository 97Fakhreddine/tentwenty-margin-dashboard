import {
  DEFAULT_BILLABLE_CATEGORIES,
  type BillingConfiguration,
} from "@/domain";

export const DEFAULT_BILLING_CONFIGURATION: BillingConfiguration = {
  billableCategories: DEFAULT_BILLABLE_CATEGORIES,
  monthlyOverheadAed: 0,
};
