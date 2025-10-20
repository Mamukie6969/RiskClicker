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

        const hashedPassword = await bcrypt.hash(password, 10);

        if (userResult.rows.length === 0) {
            await pool.query(
                'INSERT INTO leaderboard (name, password, score) VALUES ($1, $2, $3)',
                [name, hashedPassword, score]
            );
            console.log(` New user ${name} added with score ${score}.`);
        } else {
            const user = userResult.rows[0];
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({ success: false, error: 'Invalid password' });
            }

            await pool.query(
                'UPDATE leaderboard SET score = $1 WHERE name = $2',
                [score, name]
            );
        }

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
    console.log(`Server running at ${PORT}`);
});
