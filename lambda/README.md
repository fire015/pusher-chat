# Chat Lambda Webhook

This is an example of an AWS Lambda function that receives messages from a Pusher webhook and stores them in DynamoDB.

## Setup

Create a Lambda function with a [function URL](https://docs.aws.amazon.com/lambda/latest/dg/urls-configuration.html). Choose Node.js as the runtime (v18+). Set the function URL auth type to none.

Create a DynamoDB table in the same region with partition key `Channel` (string) and sort key `Timestamp` (number).

Give the Lambda execution role permission to write to the DynamoDB table. Add to it's IAM policy statement:
```json
{
    "Effect": "Allow",
    "Action": [
        "dynamodb:BatchWriteItem"
    ],
    "Resource": "arn:aws:dynamodb:[region]:[account]:table/[dynamo_table]"
}
```

Deploy this folder to your Lambda function:
```bash
npm install

zip -r9 build.zip .

aws lambda update-function-code \
    --region [region] \
    --function-name [lambda_name] \
    --publish \
    --zip-file fileb://build.zip
```

Set the Lambda function environment variables:

* DYNAMO_TABLE_NAME
* PUSHER_APP_ID
* PUSHER_APP_KEY
* PUSHER_APP_SECRET
* PUSHER_CLUSTER

Copy the Lambda function URL and add a webhook in Pusher (triggered by client events).

Start sending messages in the chat room.