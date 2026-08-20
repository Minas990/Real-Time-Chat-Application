import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const ssm = new SSMClient({});

const IDEMPOTENCY_TABLE = process.env.IDEMPOTENCY_TABLE_NAME;
const BREVO_API_KEY_PARAM = process.env.BREVO_API_KEY_PARAM;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;

let cachedApiKey;

async function getBrevoApiKey() {
  if (cachedApiKey) return cachedApiKey;
  const result = await ssm.send(
    new GetParameterCommand({ Name: BREVO_API_KEY_PARAM, WithDecryption: true })
  );
  cachedApiKey = result.Parameter.Value;
  return cachedApiKey;
}

async function alreadyProcessed(eventKey) {
  const ttl = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 2;
  try {
    await ddb.send(
      new PutCommand({
        TableName: IDEMPOTENCY_TABLE,
        Item: { eventKey, expiresAt: ttl },
        ConditionExpression: "attribute_not_exists(eventKey)",
      })
    );
    return false;
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") return true;
    throw err;
  }
}

function buildEmail(eventType, userEmail, userName) {
  if (eventType === "user.created") {
    return {
      subject: `Welcome, ${userName}!`,
      htmlContent: `<p>Hi ${userName}, welcome aboard.</p>`,
    };
  }
  return {
    subject: `Goodbye, ${userName}`,
    htmlContent: `<p>Hi ${userName}, your account has been deleted. Sorry to see you go.</p>`,
  };
}

async function sendBrevoEmail(apiKey, toEmail, subject, htmlContent) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { email: BREVO_SENDER_EMAIL },
      to: [{ email: toEmail }],
      subject,
      htmlContent,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Brevo send failed: ${response.status} ${body}`);
  }
}

export const handler = async (event) => {
  const apiKey = await getBrevoApiKey();
  const batchItemFailures = [];

  for (const record of event.Records) {
    try {
      const body = JSON.parse(record.body);
      const message = JSON.parse(body.Message);
      const eventType = body.MessageAttributes?.eventType?.Value ?? message.eventType;
      const { userId, email, name } = message;

      const eventKey = `${eventType}:${userId}`;
      if (await alreadyProcessed(eventKey)) continue;

      const { subject, htmlContent } = buildEmail(eventType, email, name);
      await sendBrevoEmail(apiKey, email, subject, htmlContent);
    } catch (err) {
      console.error("Failed to process record", record.messageId, err);
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  return { batchItemFailures };
};
