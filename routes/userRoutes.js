// const express = require("express");
// const router = express.Router();
// const User = require("./../models/user");
// const { jwtAuthMiddleware, generateToken } = require("./../jwt");

// // Post route to add a person
// router.post("/signup", async (req, res) => {
//     try {
//         const data = req.body; // assuming the request body contains the person data

//         // Check if there is already an admin user
//         const adminUser = await User.findOne({ role: "admin" });
//         if (data.role === "admin" && adminUser) {
//             return res.status(400).json({ error: "Admin user already exists" });
//         }

//         // Validate Aadhar Card Number must have exactly 12 digit
//         if (!/^\d{12}$/.test(data.aadharCardNumber)) {
//             return res.status(400).json({
//                 error: "Aadhar Card Number must be exactly 12 digits",
//             });
//         }

//         // Check if a user with the same Aadhar Card Number already exists
//         const existingUser = await User.findOne({
//             aadharCardNumber: data.aadharCardNumber,
//         });
//         if (existingUser) {
//             return res.status(400).json({
//                 error: "User with the same Aadhar Card Number already exists",
//             });
//         }

//         // create a new User using the mongoose model
//         const newUser = new User(data);

//         // Save the new user to the database
//         const response = await newUser.save();
//         console.log("data saved");

//         const payload = {
//             id: response.id,
//         };

//         console.log(JSON.stringify(payload));
//         const token = generateToken(payload);
//         console.log("Token is: ", token);

//         res.status(200).json({ response: response, token: token });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

// // Log In Routes
// router.post("/login", async (req, res) => {
//     try {
//         // Extract aadharCardNumber and password from request body
//         const { aadharCardNumber, password } = req.body;

//         // Check if aadharCardNumber or password is missing
//         if (!aadharCardNumber || !password) {
//             return res.status(400).json({
//                 error: "Aadhar Card Number and password are required",
//             });
//         }

//         // Find the user by aadharCardNumber
//         const user = await User.findOne({ aadharCardNumber: aadharCardNumber });

//         // If user does not exist or password does not match, return error
//         if (!user || !(await user.comparePassword(password))) {
//             return res
//                 .status(401)
//                 .json({ error: "Invalid Aadhar Card Number or Password" });
//         }

//         // generate token
//         const payload = {
//             id: user.id,
//         };

//         const token = generateToken(payload);

//         // return token as response
//         res.json({ token });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

// router.get("/profile", jwtAuthMiddleware, async (req, res) => {
//     try {
//         const userData = req.userPayload;
//         const userId = userData.id;
//         const user = await User.findById(userId);

//         res.status(200).json({ user });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });

// router.put("/profile/password", async (req, res) => {
//     try {
//         const userId = req.user;
//         const { currentPassword, newPassword } = req.body;

//         const user = await User.findById(userId);

//         if (!(await user.comparePassword(currentPassword))) {
//             return res
//                 .status(401)
//                 .json({ error: "Invalid username and password" });
//         }

//         user.password = newPassword;
//         await user.save();

//         console.log("password updated");
//         res.status(200).json({ message: "password updated" });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { jwtAuthMiddleware, generateToken } = require("../jwt");

// POST - Sign Up
router.post("/signup", async (req, res) => {
  try {
    const data = req.body;

    // Check if an admin user already exists
    const adminUser = await User.findOne({ role: "admin" });
    if (data.role === "admin" && adminUser) {
      return res.status(400).json({ error: "Admin user already exists" });
    }

    // Validate Aadhar Card Number (must be exactly 12 digits)
    if (!/^\d{12}$/.test(data.aadharCardNumber)) {
      return res.status(400).json({
        error: "Aadhar Card Number must be exactly 12 digits",
      });
    }

    // Check if user with the same Aadhar Card Number already exists
    const existingUser = await User.findOne({
      aadharCardNumber: data.aadharCardNumber,
    });
    if (existingUser) {
      return res.status(400).json({
        error: "User with the same Aadhar Card Number already exists",
      });
    }

    // Create a new User
    const newUser = new User(data);
    const savedUser = await newUser.save();
    console.log("User registered successfully");

    // Generate JWT token
    const payload = { id: savedUser.id };
    const token = generateToken(payload);

    res.status(201).json({ user: savedUser, token });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST - Log In
router.post("/login", async (req, res) => {
  try {
    const { aadharCardNumber, password } = req.body;

    if (!aadharCardNumber || !password) {
      return res
        .status(400)
        .json({ error: "Aadhar Card Number and password are required" });
    }

    // Find user by Aadhar Card Number
    const user = await User.findOne({ aadharCardNumber });

    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ error: "Invalid Aadhar Card Number or Password" });
    }

    // Generate token
    const token = generateToken({ id: user.id });

    res.status(200).json({ token });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// GET - Profile
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.userData.id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT - Update Password (Protected Route)
router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.userData.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Both current and new passwords are required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if current password matches
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: "Incorrect current password" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    console.log("Password updated successfully");
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password Update Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
