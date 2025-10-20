const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

app.post('/submit', async (req, res) => {
    const { name, password, score } = req.body;

    if (!name || typeof score !== 'number' || !password) {
        return res.status(400).json({ success: false, error: 'Invalid input' });
    }

    try {
        const userResult = await pool.query('SELECT * FROM leaderboard WHERE name = $1', [name]);

        if (userResult.rows.length === 0) {
            // If the user doesn't exist, hash the password and insert
            const hashedPassword = await bcrypt.hash(password, 10);
            await pool.query('INSERT INTO leaderboard (name, password) VALUES ($1, $2)', [name, hashedPassword]);
            console.log(`New user ${name} added with hashed password.`);
        } else {
            // If the user exists, check the password
            const user = userResult.rows[0];
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({ success: false, error: 'Invalid password' });
            }
        }

        // Insert or update the score without hashing the password again
        await pool.query(
            'INSERT INTO leaderboard (name, score) VALUES ($1, $2) ' +
            'ON CONFLICT (name) DO UPDATE SET score = $2',
            [name, score]
        );

        res.json({ success: true });

    } catch (err) {
        console.error('Error during score submission:', err);
        res.status(500).json({ success: false, error: 'Something went wrong' });
    }
});

app.get('/leaderboard', async (req, res) => {
    try {
        const result = await pool.query('SELECT name, score FROM leaderboard ORDER BY score DESC LIMIT 1000');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching leaderboard:', err);
        res.status(500).json({ success: false, error: 'Something went wrong' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
