"use strict";

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const TABLE_NAME = process.env.TABLE_NAME;

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(body)
  };
}

exports.handler = async (event) => {
  const confirmationNumber =
    event.pathParameters?.confirmationNumber?.trim();

  if (!confirmationNumber) {
    return response(400, {
      message: "Confirmation number is required."
    });
  }

  try {
    const result = await client.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          confirmationNumber
        }
      })
    );

    if (!result.Item) {
      return response(404, {
        message: "No transaction found for this confirmation number."
      });
    }

    return response(200, {
      message: "Transaction retrieved successfully.",
      transaction: result.Item
    });

  } catch (error) {
    console.error("DynamoDB lookup failed:", error);

    return response(500, {
      message: "Unable to retrieve the transaction."
    });
  }
};