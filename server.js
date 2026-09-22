// SUPABASE CONNECTION

const supabaseUrl = process.env.SUPABASE_URL;

const supabaseKey =
    process.env.SUPABSE_ANONKEY;

if (!supabaseUrl || !supabaseKey) {
    console.error(
        "Missing Supabase Environment Variables"
    );

    process.exit(1);
}

const supabase = createClient(
    supabaseUrl,
    supabaseKey
);
