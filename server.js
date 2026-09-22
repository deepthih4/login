
const express = require("express");
const cors = require("cors");

const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(cors());
app.use(express.json());

// ===============================
// SUPABASE CONNECTION
// ===============================

const supabaseUrl =
    process.env.SUPABASE_URL;

const supabaseKey =
    process.env.SUPABSE_ANONKEY;

if (!supabaseUrl || !supabaseKey) {

    console.error(
        "Missing Supabase URL or ANON KEY"
    );

    process.exit(1);
}

const supabase = createClient(
    supabaseUrl,
    supabaseKey,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// ===============================
// HOME
// ===============================

app.get("/", (req, res) => {

    res.send(
        "Login Server Running Successfully"
    );

});

// ===============================
// CREATE ACCOUNT
// ===============================

app.post("/register", async (req, res) => {

    try {

        const { name, email, password } =
            req.body;

        if (!name || !email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "All fields are required"

            });

        }

        if (password.length < 6) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must be at least 6 characters"

            });

        }

        const userEmail =
            email.trim().toLowerCase();

        // CREATE USER IN SUPABASE AUTH

        const { data, error } =
            await supabase.auth.signUp({

                email: userEmail,

                password: password,

                options: {

                    data: {
                        name: name.trim()
                    }

                }

            });

        if (error) {

            return res.status(400).json({

                success: false,

                message: error.message

            });

        }

        if (!data.user) {

            return res.status(400).json({

                success: false,

                message:
                    "Account creation failed"

            });

        }

        // EMAIL CONFIRMATION CHECK

        if (!data.session) {

            return res.status(201).json({

                success: true,

                message:
                    "Account created! Please confirm your email before login."

            });

        }

        return res.status(201).json({

            success: true,

            message:
                "Account created successfully"

        });

    } catch (error) {

        console.error(
            "Register Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Registration failed"

        });

    }

});

// ===============================
// LOGIN
// ===============================

app.post("/login", async (req, res) => {

    try {

        const { email, password } =
            req.body;

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password required"

            });

        }

        const userEmail =
            email.trim().toLowerCase();

        // SUPABASE AUTH LOGIN

        const { data, error } =
            await supabase.auth
                .signInWithPassword({

                    email: userEmail,

                    password: password

                });

        if (error) {

            return res.status(401).json({

                success: false,

                message: error.message

            });

        }

        if (!data.user || !data.session) {

            return res.status(401).json({

                success: false,

                message:
                    "Login failed"

            });

        }

        // LOGIN SUCCESS

        return res.json({

            success: true,

            message:
                "Login Successful",

            user: {

                id: data.user.id,

                name:
                    data.user.user_metadata
                        ?.name || "",

                email:
                    data.user.email

            },

            access_token:
                data.session.access_token

        });

    } catch (error) {

        console.error(
            "Login Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Login failed"

        });

    }

});

// ===============================
// START SERVER
// ===============================

const PORT =
    process.env.PORT || 3000;

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Server running on port ${PORT}`
        );

    }
);
