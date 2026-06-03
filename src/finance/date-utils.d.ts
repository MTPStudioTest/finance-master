export {};

declare global {
  interface Window {
    FinanceDates: {
      addDaysDateOnly(value: unknown, days: number): string;
      compareDateOnly(a: unknown, b: unknown): number;
      dateOnlyFromParts(year: number, month: number, day: number): string;
      dateOnlyToNoonIso(value: unknown): string;
      isDateOnly(value: unknown): boolean;
      monthKey(value: unknown): string;
      todayDateOnly(): string;
      toDateOnly(value: unknown): string;
    };
  }
}
