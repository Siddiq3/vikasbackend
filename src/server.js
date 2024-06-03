const express = require('express');
require('dotenv').config();
const cors = require('cors');
require('./conn'); // Ensure this points to your actual database connection file

const vikasserver = require('./routes/vikasserver');




const app = express();

// Dynamic port
const port = process.env.PORT || 1303;

app.use(express.json());
app.use(cors());

// Existing routes
app.use(vikasserver);



app.listen(port, () => {
    console.log(`Connection is live at port no. ${port}`);
});
