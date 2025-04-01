// const jwt = require("jsonwebtoken");

// const jwtAuthMiddleware = (req, res, next) => {
//     // first check request headers has authorization or not
//     const authorization = req.headers.authorization;
//     if (!authorization)
//         return res.status(401).json({ error: "Token Not Found" });

//     // Extract the jwt token from the request headers
//     const token = req.headers.authorization.split(" ")[1];
//     if (!token) return res.status(401).json({ error: "Unauthorized" });

//     try {
//         // Verify the JWT token
//         const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

//         // Attach user information to the request object
//         req.user = decoded;
//         next();
//     } catch (err) {
//         console.error(err);
//         res.status(401).json({ error: "Invalid token" });
//     }
// };

// // Function to generate JWT token
// const generateToken = (userData) => {
//     // Generate a new JWT token using user data
//     return jwt.sign(userData, process.env.JWT_SECRET_KEY);
// };

// module.exports = { jwtAuthMiddleware, generateToken };

const jwt = require("jsonwebtoken");
require("dotenv").config();

// Middleware to verify JWT token
const jwtAuthMiddleware = (req, res, next) => {
  try {
    // Ensure JWT secret key is set
    if (!process.env.JWT_SECRET_KEY) {
      console.error(
        "❌ JWT_SECRET_KEY is not defined in environment variables."
      );
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Check if authorization header exists
    const authorization = req.headers.authorization;
    if (!authorization) {
      return res.status(401).json({ error: "Token Not Found" });
    }

    // Extract token from the Bearer scheme
    const token = authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify the JWT token
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
      if (err) {
        console.error("❌ JWT Verification Error:", err.message);
        return res.status(401).json({ error: "Invalid Token" });
      }

      // Attach user information to the request object
      req.user = decoded;
      next();
    });
  } catch (err) {
    console.error("❌ JWT Middleware Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Function to generate JWT token
const generateToken = (userData) => {
  try {
    // Ensure JWT secret key is set
    if (!process.env.JWT_SECRET_KEY) {
      throw new Error(
        "JWT_SECRET_KEY is not defined in environment variables."
      );
    }

    // Generate a new JWT token with expiration
    return jwt.sign(userData, process.env.JWT_SECRET_KEY, { expiresIn: "2h" });
  } catch (err) {
    console.error("❌ Token Generation Error:", err);
    return null;
  }
};

module.exports = { jwtAuthMiddleware, generateToken };
