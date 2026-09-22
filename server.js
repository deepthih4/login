
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();

app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.send("Login Server Running Successfully");
});

// Login API
app.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password required"
            });
        }

        const adminEmail = process.env.ADMIN_EMAIL;
        const passwordHash = process.env.ADMIN_PASSWORD_HASH;

        if (!adminEmail || !passwordHash) {
            return res.status(500).json({
                success: false,
                message: "Server configuration missing"
            });
        }

        const emailMatches =
            email.trim().toLowerCase() ===
            adminEmail.trim().toLowerCase();

        const passwordMatches =
            await bcrypt.compare(password, passwordHash);

        if (!emailMatches || !passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        return res.json({
            success: true,
            message: "Login successful"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });

    }

});

// Render PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
