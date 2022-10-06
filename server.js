const path = require('path');
const express = require('express');

const print = console.log;


const app = express();
const PORT = process.env.PORT || 4321;
// const MODE = process.env.NODE_ENV || 'development';

// middlewares
app.use(express.json()); // parse incoming json message
app.use(express.static(path.join(__dirname, '/dist'))); //serve static assets


// routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/dist/index.html'));
});


app.listen(PORT, () => { print(`Server is up and running. Access: http://localhost:${PORT}`); });
