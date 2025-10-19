const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});


app.post('/submit', async (req, res) => {

    const { name, score } = req.body;
    if (!name || typeof score !== 'number') {
        return res.status(400).json({ success: false, error: 'invalid input' });
    }

    try {
        await pool.query('INSERT INTO leaderboard (name, score) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET score = $2', [name, score]);
        res.json({ success: true });

    } catch (err) {
        console.error('something went wrong', err);
        res.status(500).json({ error: 'something went wrong' });
    }

});

app.get('/leaderboard', async (req, res) => {
    try {
        const result = await pool.query(`SELECT name, score FROM leaderboard ORDER BY score DESC LIMIT 1000`);

        res.json(result.rows);
    } catch (err) {
        console.error('something went wrong', err);
        res.status(500).json({ error: 'something went wrong' });
    }
});

app.listen(PORT, () => {
    console.log(`server running at ${PORT}`);
});
