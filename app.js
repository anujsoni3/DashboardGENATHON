const express = require('express');
const bodyParser = require('body-parser');
const path = require('path'); // Import path
const session = require('express-session'); // Import session middleware
const flash = require('connect-flash'); // Import flash for messaging
const { Pool } = require('pg');

const app = express();
const port = 3000;

// PostgreSQL connection setup
const pool = new Pool({
   user: 'postgres',
   host: 'localhost',
   database: 'analytics',
   password: 'postgres',
   port: 5432
});

// Setting EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Ensure this path is correct

// Serving static files (CSS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'your_secret_key', // Replace with your own secret
  resave: false,
  saveUninitialized: true,
}));
app.use(flash());

// Route to display the welcome page (index1.ejs)
app.get('/', (req, res) => {
    res.render('index'); // Serve index1.ejs first
});

app.get('/api/call-logs', async (req, res) => {
    const sortColumn = req.query.sort || 'emp_code'; // Default sort column
    const sortOrder = req.query.order === 'desc' ? 'DESC' : 'ASC'; // Default sort order
    const limit = parseInt(req.query.limit) || 10; // Default limit if not specified

    const validSortColumns = ['emp_code', 'employee_name', 'call_type', 'duration', 'missed_calls', 'connected_calls', 'call_status', 'region', 'customer_feedback', 'date'];
    const sanitizedSortColumn = validSortColumns.includes(sortColumn) ? sortColumn : 'emp_code';

    try {
        const query = `SELECT emp_code, 
                              employee_name, 
                              call_type, 
                              duration, 
                              missed_calls,
                              connected_calls, 
                              call_status,
                              region, 
                              customer_feedback 
                       FROM call_logs
                       ORDER BY ${sanitizedSortColumn} ${sortOrder}
                       LIMIT $1`; // Use parameterized query for limit
        const result = await pool.query(query, [limit]);
        console.log('Query Result:', result.rows);
        res.json(result.rows);
    } catch (err) {
        console.error('Database query error:', err.message);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
});




app.listen(port, () => {
   console.log(`Server running on http://localhost:${port}`);
});
