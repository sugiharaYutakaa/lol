/** Client-side utilities for CSV data CRUD via API routes. */

export async function addRow(
  csvFile: string,
  row: Record<string, string>,
): Promise<void> {
  const res = await fetch(`/api/data/${csvFile}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(row),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Failed to add row');
  }
}

async function findRowIndex(
  csvFile: string,
  match: Record<string, string>,
): Promise<number> {
  const res = await fetch(`/api/data/${csvFile}`);
  if (!res.ok) throw new Error('Failed to fetch data');
  const rows: Record<string, string>[] = await res.json();
  return rows.findIndex((row) =>
    Object.entries(match).every(([k, v]) => row[k] === v),
  );
}

export async function updateRow(
  csvFile: string,
  match: Record<string, string>,
  row: Record<string, string>,
): Promise<void> {
  const index = await findRowIndex(csvFile, match);
  if (index < 0) throw new Error('Row not found');
  const res = await fetch(`/api/data/${csvFile}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ index, row }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Failed to update row');
  }
}

export async function deleteRow(
  csvFile: string,
  match: Record<string, string>,
): Promise<void> {
  const index = await findRowIndex(csvFile, match);
  if (index < 0) throw new Error('Row not found');
  const res = await fetch(`/api/data/${csvFile}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ index }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Failed to delete row');
  }
}
