import pg from "pg";

const { Pool } = pg;

let pool;

function getPool() {
  if (pool) return pool;
  pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    max: 2,
  });
  return pool;
}

export const handler = async (event) => {
  const client = getPool();
  const batchItemFailures = [];

  for (const record of event.Records) {
    try {
      const body = JSON.parse(record.body);
      const message = JSON.parse(body.Message);
      const { userId } = message;

      await client.query(
        "UPDATE messages SET is_deleted = true WHERE sender_id = $1 AND is_deleted = false",
        [userId]
      );
    } catch (err) {
      console.error("Failed to process record", record.messageId, err);
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  return { batchItemFailures };
};
