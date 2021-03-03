const express = require("express");
const router = express.Router();
const { Client } = require("pg");

// Init Postgres
const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: true })
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0; // This bypasses the SSL verification

// Connect to Postgres 
client.connect(err => {
    if (err) {
        console.error('connection error', err.stack)
    } else {
        console.log('songs API:', 'Connected to postgres db!')
    }
})

// GET all data from songs
router.get("/", async (req, res) => {
    try {
        const activities = await client.query('SELECT * FROM songs ORDER BY year ASC;');
        res.status(201).json(activities.rows);
    } catch (err) {
        res.status(400).json({
            error: `${err})`,
        });
    }
});

module.exports = router;
