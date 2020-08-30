'use strict';

const express = require('express');
require('dotenv').config();

const app = express();

// Define Our PORT

const PORT = process.env.PORT || 3000;

// Listen on the server

app.listen(PORT, () => {
  console.log(`Listining to ${PORT}`);
});
