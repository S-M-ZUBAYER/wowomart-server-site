
// Import necessary packages
const express = require("express");
const cors = require("cors");
const poolNew = require("./config/db"); // Import the database connection pool
const fs = require("fs");
const path = require("path");

// Initialize the Express app
const app = express();
const port = process.env.PORT || 2000;

// Middleware
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON payloads
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded data

// Middleware to check and reconnect to the database
const checkAndReconnectDatabase = async (req, res, next) => {
  try {
    poolNew.getConnection((err, connection) => {
      if (err) {
        console.error("Database connection lost. Attempting to reconnect...");
        reconnectDatabase(5) // Retry up to 5 times
          .then(() => {
            console.log("Reconnected to the database.");
            next();
          })
          .catch((reconnectError) => {
            console.error("Reconnection failed:", reconnectError.message);
            return res.status(500).json({
              error: "Unable to reconnect to the database. Please try again later.",
            });
          });
      } else {
        console.log("Database connection is active.");
        connection.release(); // Release the connection back to the pool
        next();
      }
    });
  } catch (error) {
    console.error("Unexpected error during database check:", error);
    res.status(500).json({
      error: "An unexpected error occurred while checking the database connection.",
    });
  }
};

// Reconnection logic
const reconnectDatabase = (retries) => {
  return new Promise((resolve, reject) => {
    const attemptReconnect = (retryCount) => {
      poolNew.getConnection((err, connection) => {
        if (err) {
          if (retryCount <= 0) {
            return reject(err); // Stop retrying after all attempts are exhausted
          }
          console.log(`Retrying to connect... (${retries - retryCount + 1})`);
          setTimeout(() => attemptReconnect(retryCount - 1), 2000); // Retry after 2 seconds
        } else {
          console.log("Reconnection successful.");
          connection.release();
          resolve(); // Resolve the promise if reconnection is successful
        }
      });
    };
    attemptReconnect(retries);
  });
};

// // Use the middleware globally
app.use(checkAndReconnectDatabase);

// Dynamically load all routes from the `routes` folder
const routePath = path.join(__dirname, "routes");
fs.readdirSync(routePath).forEach((file) => {
  if (file.endsWith(".js")) {
    const route = require(`./routes/${file}`);
    app.use("/tht", route); // Attach each route to the `/tht` base path
  }
});

// Health check route
app.get("/", (req, res) => {
  res.send({ message: "Server is running." });
});

app.get("/health", (req, res) => {
  poolNew.getConnection((err) => {
    if (err) {
      return res.status(500).json({ error: "Database connection issue" });
    }
    res.status(200).json({ message: "Healthy" });
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  if (err instanceof SyntaxError) {
    return res.status(400).json({ error: "Bad Request: Invalid JSON" });
  }
  res.status(500).json({ error: "An unexpected error occurred." });
});

// Graceful shutdown
process.on("SIGINT", () => {
  poolNew.end((err) => {
    if (err) {
      console.error("Error closing database pool:", err.message);
    } else {
      console.log("Database pool closed.");
    }
    process.exit(0); // Exit the process
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
