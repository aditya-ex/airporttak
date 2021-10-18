const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/airports", async (req, res) => {
  try {
    let jsonData = fs.readFileSync("alaska_airports_II.json");
    let parsedData = JSON.parse(jsonData);
    let transportType = req.body.type;
    // let currentLocation = req.body.locationId;
    let airports = [];
    // let distances = [];
    for (let el in parsedData) {
      if (
        parsedData[el].Type == transportType
        // &&
        // parsedData[el].LocationID == currentLocation
      ) {
        airports.push(parsedData[el]);
      }
    }

    res.send(airports);
    // console.log(airports);
  } catch (err) {
    console.log(err);
  }
});

app.post("/distanceBtwAirports", async (req, res) => {
  let jsonData = fs.readFileSync("alaska_airports_II.json");
  let parsedData = JSON.parse(jsonData);
  let transportType = req.body.type;
  let lIdOfAirport1 = req.body.locationOFairport1;
  let lIdOfAirport2 = req.body.locationOFairport2;
  let airport1 = [];
  let airport2 = [];
  for (let el in parsedData) {
    if (
      parsedData[el].Type == transportType &&
      parsedData[el].LocationID == lIdOfAirport1
    ) {
      airport1.push(parsedData[el]);
    }
  }
  for (let el in parsedData) {
    if (
      parsedData[el].Type == transportType &&
      parsedData[el].LocationID == lIdOfAirport2
    ) {
      airport2.push(parsedData[el]);
    }
  }

  if (typeof Number.prototype.toRad === "undefined") {
    Number.prototype.toRad = function () {
      return (this * Math.PI) / 180;
    };
  }
  let lat1 = airport1[0].Lat;
  let lon1 = airport1[0].Lon;
  let lat2 = airport2[0].Lat;
  let lon2 = airport2[0].Lon;
  let R = 6371e3; // metres
  console.log(lat1);
  let φ1 = lat1.toRad();
  console.log(φ1);
  let φ2 = lat2.toRad();
  let Δφ = (lat2 - lat1).toRad();
  let Δλ = (lon2 - lon1).toRad();
  let a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let d = R * c;

  res.send(`the distance in meters is: ${d}`);
});

app.post("/threeNearestAirports", async (req, res) => {
  let jsonData = fs.readFileSync("alaska_airports_II.json");
  let parsedData = JSON.parse(jsonData);
  let transportType = req.body.type;
  let sourceId = req.body.locationID;
  let source = [];
  let nearestAirports = [];
  for (let el in parsedData) {
    if (
      parsedData[el].Type == transportType &&
      parsedData[el].LocationID == sourceId
    ) {
      source.push(parsedData[el]);
    }
  }
  for (let el in parsedData) {
    let lat1 = source[0].Lat;
    let lon1 = source[0].Lon;
    let lat2 = parsedData[el].Lat;
    let lon2 = parsedData[el].Lon;
    if (typeof Number.prototype.toRad === "undefined") {
      Number.prototype.toRad = function () {
        return (this * Math.PI) / 180;
      };
    }
    let R = 6371e3; // metres
    // console.log(lat1);
    let φ1 = lat1.toRad();
    // console.log(φ1);
    let φ2 = lat2.toRad();
    let Δφ = (lat2 - lat1).toRad();
    let Δλ = (lon2 - lon1).toRad();
    let a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c;
    if (d < 1000000 && parsedData[el].LocationID != source[0].LocationID) {
      nearestAirports.push(parsedData[el]);
    }
  }
  async function threeNearest(nearestAirports, arr_size) {
    let i, first, second, third;
    if (arr_size < 4) {
      res.send(nearestAirports);
    }
    first = Number.MAX_VALUE;
    second = Number.MAX_VALUE;
    third = Number.MAX_VALUE;
    for (i = 0; i < arr_size; i++) {
      if (nearestAirports[i] < first) {
        third = second;
        second = first;
        first = nearestAirports[i];
      } else if (nearestAirports[i] < second) {
        third = second;
        second = nearestAirports[i];
      } else nearestAirports[i] < third;
      third = nearestAirports[i];
    }
    res.send(
      `smallest distance : ${first}, second nearest: ${second} and third nearest: ${third}`
    );
  }
  let arr_size = nearestAirports.length;
  await threeNearest(nearestAirports, arr_size);
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`server up and running on port ${port}`));
