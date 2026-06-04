import 'server-only';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

const BUCKET = process.env.S3_BUCKET ?? '';
const REGION = process.env.AWS_REGION ?? 'ap-northeast-1';

let _client: S3Client | null = null;

function getClient(): S3Client {
  if (!_client) {
    _client = new S3Client({ region: REGION });
  }
  return _client;
}

/** Read a CSV file from S3 and return its text content. */
export async function readCsvFromS3(fileName: string): Promise<string> {
  const res = await getClient().send(
    new GetObjectCommand({ Bucket: BUCKET, Key: fileName }),
  );
  return (await res.Body?.transformToString('utf-8')) ?? '';
}

/** Write CSV text to S3. */
export async function writeCsvToS3(
  fileName: string,
  content: string,
): Promise<void> {
  await getClient().send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: fileName,
      Body: content,
      ContentType: 'text/csv; charset=utf-8',
    }),
  );
}
