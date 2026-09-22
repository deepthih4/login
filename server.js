
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(cors());
app.use(express.json());

// SUPABASE CONNECTION

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
);

// HOME

app.get("/", (req, res) => {

    res.send(
        "Login Server Running Successfully"
    );

});

// CREATE ACCOUNT

app.post("/register", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });

        }

        if (password.length < 6) {

            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });

        }

        const userEmail =
            email.trim().toLowerCase();

        // CHECK EXISTING USER

        const { data: existingUser, error: checkError } =
            await supabase
                .from("login_users")
                .select("id")
                .eq("email", userEmail)
                .maybeSingle();

        if (checkError) {
            throw checkError;
        }

        if (existingUser) {

            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });

        }

        // HASH PASSWORD

        const hashedPassword =
            await bcrypt.hash(password, 10);

        // SAVE USER

        const { error } = await supabase
            .from("login_users")
            .insert({
                name: name.trim(),
                email: userEmail,
                password_hash: hashedPassword
            });

        if (error) {

            if (error.code === "23505") {

                return res.status(409).json({
                    success: false,
                    message: "Email already registered"
                });

            }

            throw error;

        }

        return res.status(201).json({
            success: true,
            message: "Account created successfully"
        });

    } catch (error) {

        console.error("Register Error:", error);

        return res.status(500).json({
            success: false,
            message: "Registration failed"
        });

    }

});

// LOGIN

app.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Email and password required"
            });

        }

        const userEmail =
            email.trim().toLowerCase();

        // FIND USER

        const { data: user, error } =
            await supabase
                .from("login_users")
                .select(
                    "id, name, email, password_hash"
                )
                .eq("email", userEmail)
                .maybeSingle();

        if (error) {
            throw error;
        }

        if (!user) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });

        }

        // VERIFY PASSWORD

        const validPassword =
            await bcrypt.compare(
                password,
                user.password_hash
            );

        if (!validPassword) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });

        }

        // LOGIN SUCCESS

        return res.json({

            success: true,

            message: "Login Successful",

            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }

        });

    } catch (error) {

        console.error("Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Login failed"
        });

    }

});

// START SERVER

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `Server running on port ${PORT}`
    );

});
