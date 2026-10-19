const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/v2/https");

const app = require("./app");
const connectDB = require("./config/db");

setGlobalOptions({ maxInstances: 10 });

let dbPromise;

function initializeDB() {
  if (!dbPromise) {
    dbPromise = connectDB().catch((error) => {
      dbPromise = null;
      throw error;
    });
  }

  return dbPromise;
}

exports.api = onRequest(async (req, res) => {
  try {
    await initializeDB();
    app(req, res);
  } catch (error) {
    console.error("Database connection failed:", error);

    if (!res.headersSent) {
      res.status(500).send("Database connection failed");
    }
  }
});
