/**
 * Allowed CSV file names and their column headers.
 * Used by the API to validate requests and serialise rows back to CSV.
 */
export const CSV_FILES = {
  'champion_lanes.csv': ['lane', 'champion'],
  'counters.csv': ['lane', 'enemy', 'pick', 'reason'],
  'first_pick.csv': ['lane', 'pick', 'reason'],
  'balance_pick.csv': ['lane', 'category', 'pick', 'reason'],
} as const;

export type CsvFileName = keyof typeof CSV_FILES;

export function isCsvFileName(name: string): name is CsvFileName {
  return name in CSV_FILES;
}
