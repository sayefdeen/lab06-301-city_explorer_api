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
app.get('/trail', trailsHandiling);
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
  const lat = req.query.lat;
  const lon = req.query.lon;
  const weatherAPIKey = process.env.WEATHER_API_KEY;
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${weatherAPIKey}`;

  superAgent.get(url).then((data) => {
    let requiredData = data.body.data.map((item) => {
      return new Weather(item);
    });
    res.status(200).send(requiredData);
  });
}

// Trail

function trailsHandiling(req, res) {
  const trailAPIKey = process.env.TRAIL_API_KEY;
  const lat = req.query.lat;
  const lon = req.query.lon;
  const url = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=10&key=${trailAPIKey}`;
  superAgent.get(url).then((data) => {
    let trailArray = data.body.trails.map((trail) => {
      return new Trails(trail);
    });
    res.status(200).send(trailArray);
  });
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

function Weather(data) {
  this.forecast = data.weather.description;
  this.time = data.datetime;
}

function Trails(data) {
  (this.name = data.name),
    (this.location = data.location),
    (this.length = data.length),
    (this.stars = data.stars),
    (this.star_votes = data.starVotes),
    (this.summary = data.summary),
    (this.trail_url = data.url),
    (this.conditions = `${data.conditionDetails}, ${data.conditionStatus}`),
    (this.condition_date = data.conditionDate.split(' ')[0]),
    (this.condition_time = data.conditionDate.split(' ')[1]);
}

// Listen on the server

app.listen(PORT, () => {
  console.log(`Listining to ${PORT}`);
});
