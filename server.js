'use strict';

const express = require('express');
require('dotenv').config();

const app = express();

// Define Our PORT

const PORT = process.env.PORT || 3000;

// Main Page

app.get('/', (req, res) => {
  res.status(200).send('Welcome to my page for testing API');
});

// Location Page

app.get('/location', (req, res) => {
  const locationData = require('./data/location.json');
  const cityData = req.query.city;

  // Create an Object

  let locationObj = new Location(locationData, cityData);
  res.status(200).send(locationObj);
});

// Weather Page

app.get('/weather', (req, res) => {
  // Empty the array each time the page is called;
  Weather.all = [];
  const weatherData = require('./data/weather.json');

  weatherData.data.forEach((item) => {
    new Weather(item);
  });

  res.status(200).send(Weather.all);
});

app.use((req, res) => {
  res.status(500).send({
    status: 500,
    responseText: `Sorry,something went wrong`,
  });
});
// Function

// Location Constructor

function Location(data, cityName) {
  this.search_query = cityName;
  this.formatted_query = data[0].display_name;
  this.latitude = data[0].lat;
  this.longitude = data[0].lon;
}

// weather Constructor

// Array to containe All Weather Objects
Weather.all = [];

function Weather(data) {
  this.forecast = data.weather.description;
  this.time = data.datetime;
  Weather.all.push(this);
}

// Listen on the server

app.listen(PORT, () => {
  console.log(`Listining to ${PORT}`);
});
