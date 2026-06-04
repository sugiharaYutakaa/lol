import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import { revalidatePath } from 'next/cache';
import { CSV_FILES, isCsvFileName } from '@/lib/csv-files';
import { readCsvFromS3, writeCsvToS3 } from '@/lib/s3';

// Helpers --------------------------------------------------------------------

function csvFileName(params: { file: string }): string {
  // Accept both "counters" and "counters.csv"
  return params.file.endsWith('.csv') ? params.file : `${params.file}.csv`;
}

function parseCsv<T extends Record<string, string>>(text: string): T[] {
  return Papa.parse<T>(text, {
    header: true,
    skipEmptyLines: true,
    transform: (v) => v.trim(),
  }).data;
}

function toCsv(headers: readonly string[], rows: Record<string, string>[]): string {
  return Papa.unparse({
    fields: [...headers],
    data: rows.map((row) => headers.map((h) => row[h] ?? '')),
  }) + '\n';
}

function revalidateAll() {
  revalidatePath('/', 'layout');
}

// GET — return all rows as JSON ---------------------------------------------

export async function GET(
  _req: NextRequest,
  { params }: { params: { file: string } },
) {
  const name = csvFileName(params);
  if (!isCsvFileName(name)) {
    return NextResponse.json({ error: 'unknown file' }, { status: 400 });
  }
  const text = await readCsvFromS3(name);
  const rows = parseCsv(text);
  return NextResponse.json(rows);
}

// POST — append a row -------------------------------------------------------

export async function POST(
  req: NextRequest,
  { params }: { params: { file: string } },
) {
  const name = csvFileName(params);
  if (!isCsvFileName(name)) {
    return NextResponse.json({ error: 'unknown file' }, { status: 400 });
  }

  const body: Record<string, string> = await req.json();
  const headers = CSV_FILES[name];

  // Validate all required columns are present and non-empty
  for (const h of headers) {
    if (!body[h]?.trim()) {
      return NextResponse.json({ error: `missing field: ${h}` }, { status: 400 });
    }
  }

  const text = await readCsvFromS3(name);
  const rows = parseCsv(text);
  const newRow: Record<string, string> = {};
  for (const h of headers) {
    newRow[h] = body[h].trim();
  }
  rows.push(newRow);

  await writeCsvToS3(name, toCsv(headers, rows));
  revalidateAll();
  return NextResponse.json({ ok: true, row: newRow }, { status: 201 });
}

// PUT — update a row by index -----------------------------------------------

export async function PUT(
  req: NextRequest,
  { params }: { params: { file: string } },
) {
  const name = csvFileName(params);
  if (!isCsvFileName(name)) {
    return NextResponse.json({ error: 'unknown file' }, { status: 400 });
  }

  const { index, row: body }: { index: number; row: Record<string, string> } =
    await req.json();
  const headers = CSV_FILES[name];

  const text = await readCsvFromS3(name);
  const rows = parseCsv(text);

  if (index < 0 || index >= rows.length) {
    return NextResponse.json({ error: 'index out of range' }, { status: 400 });
  }

  for (const h of headers) {
    if (body[h] !== undefined) {
      rows[index][h] = body[h].trim();
    }
  }

  await writeCsvToS3(name, toCsv(headers, rows));
  revalidateAll();
  return NextResponse.json({ ok: true, row: rows[index] });
}

// DELETE — remove a row by index --------------------------------------------

export async function DELETE(
  req: NextRequest,
  { params }: { params: { file: string } },
) {
  const name = csvFileName(params);
  if (!isCsvFileName(name)) {
    return NextResponse.json({ error: 'unknown file' }, { status: 400 });
  }

  const { index }: { index: number } = await req.json();

  const text = await readCsvFromS3(name);
  const rows = parseCsv(text);

  if (index < 0 || index >= rows.length) {
    return NextResponse.json({ error: 'index out of range' }, { status: 400 });
  }

  const removed = rows.splice(index, 1)[0];
  await writeCsvToS3(name, toCsv(CSV_FILES[name], rows));
  revalidateAll();
  return NextResponse.json({ ok: true, removed });
}
