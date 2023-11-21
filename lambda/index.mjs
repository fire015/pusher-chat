import { BatchWriteItemCommand, DynamoDB } from "@aws-sdk/client-dynamodb";
import Pusher from "pusher";

const dynamoDB = new DynamoDB({ region: process.env.AWS_REGION });
const dynamoTable = process.env.DYNAMO_TABLE_NAME || "PusherChatMessages";

const pusher = new Pusher({
  appId: String(process.env.PUSHER_APP_ID),
  key: String(process.env.PUSHER_APP_KEY),
  secret: String(process.env.PUSHER_APP_SECRET),
  cluster: String(process.env.PUSHER_CLUSTER),
  useTLS: true,
});

const badRequestResponse = { statusCode: 400, body: JSON.stringify({ error: "Bad Request" }) };
const okResponse = { statusCode: 200, body: JSON.stringify({ success: true }) };

/** @param req {import("aws-lambda").APIGatewayProxyEventV2} */
export const handler = async (req) => {
  console.log(`Received ${req.requestContext.http.method} request from ${req.headers["user-agent"]}`);

  if (req.requestContext.http.method !== "POST" || !req.body) {
    return badRequestResponse;
  }

  const webhook = pusher.webhook({
    headers: req.headers,
    rawBody: req.body,
  });

  if (!webhook.isValid()) {
    console.error("Webhook invalid");
    return badRequestResponse;
  }

  const events = webhook.getEvents();
  console.log(events);

  /** @type {import("@aws-sdk/client-dynamodb").WriteRequest[]} */
  const items = [];

  events.forEach((event) => {
    const { message, timestamp } = JSON.parse(event.data);

    items.push({
      PutRequest: {
        Item: {
          Channel: { S: event.channel },
          // @ts-ignore
          UserID: { S: event.user_id },
          Message: { S: message },
          Timestamp: { N: timestamp },
        },
      },
    });
  });

  const command = new BatchWriteItemCommand({
    RequestItems: {
      [dynamoTable]: items,
    },
  });

  await dynamoDB.send(command);

  return okResponse;
};
