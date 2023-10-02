const fs = require('fs');
const csv = require('csv-parser');
const turf = require('@turf/turf');

// Define an array to store the resulting GeoJSON features
const geojsonFeatures = [];

// Read the CSV file and process each row
fs.createReadStream('../data/CityPair_Clean_CRS.csv')
  .pipe(csv())
  .on('data', (row) => {
    const originLongitude = parseFloat(row.Melbourne_Longitude);
    const originLatitude = parseFloat(row.Melbourne_Latitude);
    const destLongitude = parseFloat(row.Longitude);
    const destLatitude = parseFloat(row.Latitude);

    // Calculate intermediary points along the great circle route
    const startPoint = turf.point([originLongitude, originLatitude]);
    const endPoint = turf.point([destLongitude, destLatitude]);
    const greatCircle = turf.greatCircle(startPoint, endPoint, { steps: 5 });
    const lineString = turf.lineString(greatCircle.geometry.coordinates);

    // Add the LineString feature to the array
    geojsonFeatures.push(lineString);
  })
  .on('end', () => {
    // Combine all LineString features into a FeatureCollection
    const geojson = turf.featureCollection(geojsonFeatures);

    // Export the GeoJSON to a file (optional)
    fs.writeFileSync('geodesic_lines_2.geojson', JSON.stringify(geojson, null, 2));

    // Output the GeoJSON to the console (optional)
    console.log(JSON.stringify(geojson, null, 2));
  });
