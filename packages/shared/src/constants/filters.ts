export const DateRangeFilter = {
  THIS_WEEK: "THIS_WEEK",
  THIS_MONTH: "THIS_MONTH",
  LAST_3_MONTHS: "LAST_3_MONTHS",
  ALL_TIME: "ALL_TIME"
} as const;

export type DateRangeFilterType = typeof DateRangeFilter[keyof typeof DateRangeFilter];
