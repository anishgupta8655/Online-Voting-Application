// const mongoose = require("mongoose");
// require("dotenv").config();

// // Define the mongoDB connection URL
// // mongoDB://localhost:27017/database

// const mongoURL = process.env.MONGODB_URL_LOCAL;

// // set up mongoDB connection
// mongoose.connect(mongoURL, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// });

// // Get the default connection
// // Mongoose maintains a default connection object representing the mongoDB connection
// const db = mongoose.connection;

// // Define eventlistener for dabatbase connection

// db.on("connected", () => {
//     console.log("Connected to mongoDB Server");
// });
// db.on("disconnected", () => {
//     console.log("mongoDB Server disconnected");
// });
// db.on("error", (err) => {
//     console.log("Connection Error", err);
// });

// // Export the database connection
// module.exports = db;

const mongoose = require("mongoose");
require("dotenv").config();

// Ensure MongoDB URL is provided
const mongoURL = process.env.MONGODB_URL_LOCAL;
if (!mongoURL) {
  console.error(
    "Error: MONGODB_URL_LOCAL is not set in environment variables."
  );
  process.exit(1);
}

// Set up MongoDB connection
mongoose
  .connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB Server"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

// Get the default connection
const db = mongoose.connection;

// Define event listeners for database connection
db.on("disconnected", () => {
  console.warn("⚠️ MongoDB Server Disconnected");
});

db.on("error", (err) => {
  console.error("❌ MongoDB Connection Error:", err);
});

// Export the database connection
module.exports = db;
