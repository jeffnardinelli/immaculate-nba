const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('client'));

// Create/Connect to database
const db = new sqlite3.Database('./data/players.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    db.serialize(() => {
        // Create players table
        db.run(`
            CREATE TABLE IF NOT EXISTS players (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                keyWord TEXT NOT NULL,
                teams TEXT NOT NULL,
                story TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('Error creating players table:', err);
            } else {
                console.log('Players table ready');
                // Check if table is empty and add sample data
                checkAndAddSampleData();
            }
        });
    });
}

// Add your existing players to database
function checkAndAddSampleData() {
    db.get("SELECT COUNT(*) as count FROM players", (err, row) => {
        if (err) {
            console.error('Error checking players:', err);
            return;
        }
        
        if (row.count === 0) {
            console.log('Adding sample players to database...');
            
            // Add Jamal Crawford as a test
            const samplePlayer = {
                name: 'Jamal Crawford',
                keyWord: 'Crow',
                teams: JSON.stringify(['CHI', 'NYK', 'GSW', 'ATL', 'POR', 'LAC', 'MIN', 'PHO', 'BKN']),
                story: "A (CHI) bull with a crow's head takes the place of the (NYK) Statue of Liberty, standing next to the (GSW) Golden Gate Bridge. The crow-bull statue comes alive and flies across the country, where it's attacked by a massive (ATL) hawk. The hawk rips off the crow's head and it falls into the forest, (POR) blazing a fiery trail of black feathers before the crow's head lands on a (LAC) clipper ship filled with crows. The ship sails north where it's attacked by a pack of (MIN) wolves. The original crow rises from the ashes like a (PHO) phoenix, and sadly gathers his fellow dead crows in a (BKN) net."
            };
            
            db.run(
                `INSERT INTO players (name, keyWord, teams, story) VALUES (?, ?, ?, ?)`,
                [samplePlayer.name, samplePlayer.keyWord, samplePlayer.teams, samplePlayer.story],
                (err) => {
                    if (err) {
                        console.error('Error adding sample player:', err);
                    } else {
                        console.log('Sample player added successfully');
                    }
                }
            );
        }
    });
}

// API Routes

// Get all players
app.get('/api/players', (req, res) => {
    db.all("SELECT * FROM players ORDER BY name", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        
        // Convert to game format
        const players = {};
        rows.forEach(row => {
            players[row.name] = {
                keyWord: row.keyWord,
                teams: JSON.parse(row.teams),
                story: row.story
            };
        });
        res.json(players);
    });
});

// Add new player
app.post('/api/players', (req, res) => {
    const { name, keyWord, teams, story } = req.body;
    
    db.run(
        `INSERT INTO players (name, keyWord, teams, story) VALUES (?, ?, ?, ?)`,
        [name, keyWord, JSON.stringify(teams), story],
        function(err) {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            res.json({
                id: this.lastID,
                message: 'Player added successfully'
            });
        }
    );
});

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

// Get single player
app.get('/api/players/:name', (req, res) => {
    db.get(
        "SELECT * FROM players WHERE name = ?",
        [req.params.name],
        (err, row) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            if (!row) {
                res.status(404).json({ error: 'Player not found' });
                return;
            }
            res.json({
                name: row.name,
                keyWord: row.keyWord,
                teams: JSON.parse(row.teams),
                story: row.story
            });
        }
    );
});

// Update player
app.put('/api/players/:name', (req, res) => {
    const { newName, keyWord, teams, story } = req.body;
    const oldName = req.params.name;
    
    db.run(
        `UPDATE players 
         SET name = ?, keyWord = ?, teams = ?, story = ?
         WHERE name = ?`,
        [newName || oldName, keyWord, JSON.stringify(teams), story, oldName],
        function(err) {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: 'Player not found' });
                return;
            }
            res.json({ 
                message: 'Player updated successfully',
                changes: this.changes 
            });
        }
    );
});

// Delete player
app.delete('/api/players/:name', (req, res) => {
    db.run(
        `DELETE FROM players WHERE name = ?`,
        [req.params.name],
        function(err) {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            if (this.changes === 0) {
                res.status(404).json({ error: 'Player not found' });
                return;
            }
            res.json({ 
                message: 'Player deleted successfully',
                changes: this.changes 
            });
        }
    );
});



// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('========================================');
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Open your browser to http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop the server');
    console.log('========================================');
});