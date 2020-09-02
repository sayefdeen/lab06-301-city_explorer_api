'use strict';

// Application Dependencies
const express = require('express');
const cors = require('cors');
const pg = require('pg');
require('dotenv').config();
const app = express();
const superAgent = require('superagent');
// To give access to all who try to use my link
app.use(cors());

// Define Our PORT
const PORT = process.env.PORT || 3000;
const client = new pg.Client(process.env.DATABASE_URL);

// Pages Route Definitions

app.get('/', mainPageHandiling);
app.get('/location', locationHandling);
app.get('/weather', weatherHandiling);
app.get('/trails', trailsHandiling);
app.get('/movies', moviesHandiling);
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

  let selectAllSQL = `SELECT * FROM locations`;
  let selectSQL = `SELECT * FROM locations WHERE search_query=$1`;
  let safeValues = [];
  client.query(selectAllSQL).then((result) => {
    if (result.rows.length <= 0) {
      superAgent.get(url).then((data) => {
        console.log(`from API`);
        const locationData = new Location(data.body, cityData);
        insertLocationInDB(locationData);
        res.status(200).josn(locationData);
        // res.status(200).json(data.body);
      });
    } else {
      safeValues = [cityData];
      client.query(selectSQL, safeValues).then((result) => {
        if (result.rows.length <= 0) {
          superAgent.get(url).then((data1) => {
            console.log(`From API Again`);
            const locationData = new Location(data1.body, cityData);
            insertLocationInDB(locationData);
            res.status(200).json(data1);
            // res.status(200).json(locationData);
          });
        } else {
          console.log('form data base');
          res.status(200).json(result.rows[0]);
        }
      });
    }
  });
}

// Weather
function weatherHandiling(req, res) {
  const latitude = req.query.latitude;
  const longitude = req.query.longitude;
  const weatherAPIKey = process.env.WEATHER_API_KEY;
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${latitude}&lon=${longitude}&key=${weatherAPIKey}`;

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
  const latitude = req.query.latitude;
  const longitude = req.query.longitude;
  const url = `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&key=${trailAPIKey}`;
  console.log(url);
  superAgent
    .get(url)
    .then((data) => {
      let trailArray = data.body.trails.map((trail) => {
        return new Trails(trail);
      });
      console.log(trailArray);
      res.status(200).send(trailArray);
    })
    .catch(() => {
      errorPage(
        req,
        res,
        'something went wrong in etting the data from locationiq web'
      );
    });
}

// Movies Handler

function moviesHandiling(req, res) {
  let countryArrayCode = getAllCodes();
  // Get all the countries Codes and store it in an array
  let formated_query = req.query.formatted_query;
  let countryArray = formated_query.split(',');
  let countryName = countryArray[countryArray.length - 1].trim();
  // console.log(`This is the array that was called ${countryArrayCode}`);
  res.status(200).send(countryArrayCode);

  // let countryCode = countryArrayCode
  //   .filter((obj) => {
  //     return obj.english_name === countryName;
  //   })
  //   .map((item) => {
  //     return item.iso_3166_1;
  //   });
  // console.log(countryCode);
  // const moviesAPIKey = process.env.MOVIE_API_KEY;
  // const url = `https://api.themoviedb.org/3/discover/movie?api_key=${moviesAPIKey}&region=${countryName}&include_adult=false&include_video=false&page=1`;
  // console.log(url);
  // superAgent.get(url).then(data=>{
  //   let newMovie = new
  // });
}

// Error Page
function errorPage(req, res, massage = `Sorry,something went wrong`) {
  res.status(500).send({
    status: 500,
    responseText: massage,
  });
}

// Array for all countries Codes

// get All countries Codes

function getAllCodes() {
  let url = `https://api.themoviedb.org/3/configuration/countries?api_key=${process.env.MOVIE_API_KEY}`;
  return superAgent.get(url).then((data) => {
    // console.log(data.body);
    return data.body;
  });
}

// Save into DataBase

function insertLocationInDB(obj) {
  let insertSQL = `INSERT INTO locations (search_query,formatted_query,latitude,longitude) VALUES ($1,$2,$3,$4)`;
  let safeValues = [
    obj.search_query,
    obj.formatted_query,
    obj.latitude,
    obj.longitude,
  ];
  client.query(insertSQL, safeValues).then(() => {
    console.log('storing data in database');
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

client.connect().then(() => {
  app.listen(PORT, () => {
    console.log(`Listining to ${PORT}`);
  });
});
