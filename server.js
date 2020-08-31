'use strict';

// Application Dependencies
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const superAgent = require('superagent');
// To give access to all who try to use my link
app.use(cors());

// Define Our PORT
const PORT = process.env.PORT || 3000;

// Pages Route Definitions

app.get('/', mainPageHandiling);
app.get('/location', locationHandling);
app.get('/weather', weatherHandiling);
app.use(errorPage);

// Functions

// Route function Handling

// Main page

function mainPageHandiling(req, res) {
  res.status(200).send('Welcome to my page for testing API');
}

// location
function locationHandling(req, res) {
  const cityData = req.query.city;
  let locationAPIKey = process.env.GEOCODE_API_KEY;
  const url = `https://eu1.locationiq.com/v1/search.php?key=${locationAPIKey}&q=${cityData}&format=json`;

  superAgent.get(url).then((data) => {
    const locationData = new Location(data.body, cityData);
    res.status(200).send(locationData);
  });
}

// Weather
function weatherHandiling(req, res) {
  // Empty the array each time the page is called;
  const weatherData = require('./data/weather.json');

  let requiredData = weatherData.data.map((item) => {
    return {
      forecast: item.weather.description,
      time: item.datetime,
    };
  });

  res.status(200).send(requiredData);
}

// Error Page
function errorPage(req, res) {
  res.status(500).send({
    status: 500,
    responseText: `Sorry,something went wrong`,
  });
}

// Location Constructor

function Location(data, cityName) {
  this.search_query = cityName;
  this.formatted_query = data[0].display_name;
  this.latitude = data[0].lat;
  this.longitude = data[0].lon;
}

// weather Constructor

// Array to containe All Weather Objects
// Weather.all = [];

// function Weather(data) {
//   this.forecast = data.weather.description;
//   this.time = data.datetime;
//   Weather.all.push(this);
// }

// Listen on the server

app.listen(PORT, () => {
  console.log(`Listining to ${PORT}`);
});
