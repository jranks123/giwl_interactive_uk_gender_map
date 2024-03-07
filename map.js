const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const ZOOM_THRESHOLD = [0.3, 7];
const OVERLAY_MULTIPLIER = 10;
const OVERLAY_OFFSET = OVERLAY_MULTIPLIER / 2 - 0.5;
const ZOOM_DURATION = 500;
const ZOOM_IN_STEP = 2;
const ZOOM_OUT_STEP = 1 / ZOOM_IN_STEP;
const HOVER_COLOR = "#d36f80"
let femaleIndexData = {};
let maleIndexData = {};
let genderEqualityIndexData = {};
let selectedData = genderEqualityIndexData;
selectedD = "";
selectedI = "";
selectedLAD = "";
const colorScale = d3.scaleLinear()
  .domain([0, 1]) // Domain from 0 to 1 for your data values
  .range(["#fff", "#0000ff"]);

// Function to load CSV file
function loadCSVFile(url, callback, param) {
  return new Promise((resolve, reject) => {
      d3.csv(url, function(error, data) {
          if (error) {
              console.error('Error loading CSV file:', error);
              reject(error);
              return;
          }
          const returnValue = callback(data, param);
          resolve(returnValue);
      });
  });
}


function checkIndicatorsHaveDescriptionsAndPrintDistinct(structuredData) {
  let missingDescriptions = new Set(); // Use a Set to store unique indicator names

  structuredData.forEach(data => {
    data.domains.forEach(domain => {
      domain.subdomains.forEach(subdomain => {
        subdomain.indicators.forEach(indicator => {
          if (!indicator.description || indicator.description.trim() === '') {
            // Add the indicator name to the Set if the description is missing or empty
            missingDescriptions.add(indicator.name);
          }
        });
      });
    });
  });

  if (missingDescriptions.size > 0) {
    console.log("Indicators missing descriptions (distinct names):", Array.from(missingDescriptions));
  } else {
    console.log("All indicators have descriptions.");
  }
}

function parseDescriptionsCsv(descriptionsCsvData) {
  const descriptionsMap = {};
  descriptionsCsvData.forEach(row => {
    if (!descriptionsMap[row.Domain]) {
      descriptionsMap[row.Domain] = {};
    }
    if (!descriptionsMap[row.Domain][row.Subdomain]) {
      descriptionsMap[row.Domain][row.Subdomain] = {};
    }
    descriptionsMap[row.Domain][row.Subdomain][row.Indicator] = row.Description;
  }); 
  console.log(descriptionsMap);
  return descriptionsMap;
}

function parseCsvToStructuredDataWithDescriptions(csvData, descriptionsMap) {
  return csvData.map(row => {
    const rowData = {
      lad_name: row.lad_name,
      lad_code: row.lad_code,
      index_overall: row.INDEX_OVERALL,
      domains: []
    };

    Object.keys(row).forEach(key => {
      if (!['lad_name', 'lad_code', 'INDEX_OVERALL'].includes(key)) {
        const parts = key.split('__').filter(Boolean);
        let domain = rowData.domains.find(d => d.name === parts[0]);
        if (!domain) {
          domain = { name: parts[0], index: null, subdomains: [] };
          rowData.domains.push(domain);
        }

        if (parts.length === 1) {
          domain.index = parseFloat(row[key]);
        } else if (parts.length >= 2) {
          let subdomain = domain.subdomains.find(sd => sd.name === parts[1]);
          if (!subdomain) {
            subdomain = { name: parts[1], index: null, indicators: [] };
            domain.subdomains.push(subdomain);
          }
          if (parts.length === 2) {
            subdomain.index = parseFloat(row[key]);
          } else if (parts.length === 3) {
            const description = descriptionsMap[parts[0]]?.[parts[1]]?.[parts[2]] || '';
            subdomain.indicators.push({ name: parts[2], index: parseFloat(row[key]), description });
          }
        }
      }
    });

    return rowData;
  });
}

// Usage example with Promises
loadCSVFile('data/indicator_dictionary.csv', parseDescriptionsCsv)
    .then(descriptionsMap => {
        console.log("Descriptions Map Ready:", descriptionsMap);
        return Promise.all([
            loadCSVFile('data/female_index.csv', parseCsvToStructuredDataWithDescriptions, descriptionsMap),
            loadCSVFile('data/male_index.csv', parseCsvToStructuredDataWithDescriptions, descriptionsMap),
            loadCSVFile('data/gender_equality_index.csv', parseCsvToStructuredDataWithDescriptions, descriptionsMap)
        ]);
    })
    .then(([femaleIndexData, maleIndexData, genderEqualityIndexData]) => {
        // At this point, all CSVs have been loaded and processed
        checkIndicatorsHaveDescriptionsAndPrintDistinct(femaleIndexData);
        checkIndicatorsHaveDescriptionsAndPrintDistinct(maleIndexData);
        checkIndicatorsHaveDescriptionsAndPrintDistinct(genderEqualityIndexData);
        console.log(femaleIndexData);
        console.log(maleIndexData);
        console.log(genderEqualityIndexData);
    })
    .catch(error => {
        console.error("An error occurred:", error);
    });


// --------------- Event handler ---------------
const zoom = d3
  .zoom()
  .scaleExtent(ZOOM_THRESHOLD)
  .on("zoom", zoomHandler);

function zoomHandler() {
  g.attr("transform", d3.event.transform);
}

function mouseOverHandler(d, i) {
  const value = parseFloat(selectedData[d.properties.LAD13NM][selectedIndex]);
  d3.select(this).attr("fill", HOVER_COLOR)
  
}

function mouseOutHandler(d, i) {
  if (!d3.select(this).classed("selected")) {
    d3.select(this).attr("fill", color(i));
  }
}

function updateText(d) {
  const ladCode = d.properties.LAD13NM;
  if ( selectedData[ladCode]) {

    const unfilteredData = selectedData[ladCode] ;
    const excludedFields = ["lad_code", "region_code", "country"];
  
      // Filter out excluded fields from data
    const data = Object.keys(unfilteredData)
      .filter(key => !excludedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = unfilteredData[key];
        return obj;
      }, {});
  
      let displayText = `<h3>You've selected ${data.lad_name} </h3>  <button id="toggle-btn">Hide Data</button>`;
      displayText += "<div id=\"data-table\"><table>";
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          displayText += `<tr><td><strong>${key}</strong></td><td>${data[key]}</td></tr>`;
        }
      }
      displayText += "</table></div>";
      d3.select("#map__text").html(displayText);
      // Add the 'selected' class to the clicked district path
  
    } else {
      d3.select("#map__text").text(`No data available for ${ladCode}`);
    }

        // Show the toggle button when a district is selected
  document.getElementById('toggle-btn').style.display = 'block';

  // Change the icon based on the visibility of the table
  document.getElementById('toggle-btn').onclick = function() {
    const mapText = document.getElementById('data-table');
    if (mapText.style.display === 'none') {
      mapText.style.display = 'block';
      this.innerHTML = 'Hide data';
    } else {
      mapText.style.display = 'none';
      this.innerHTML = 'Show data';
    }
  };
  
}

function updateColours(selectedLAD, i) { 
    const isSelected = d3.select(selectedLAD).classed("selected");

    svg.selectAll("path.selected")
    .classed("selected", false)
    .attr("fill", color(i));

    d3.select(selectedLAD).classed("selected", true);
    d3.select(selectedLAD).attr("fill", HOVER_COLOR);
}

function clickHandler(d, i) {

  selectedD = d;
  selectedI = i;
  selectedLAD = this;
  

  
  updateColours(selectedLAD, selectedI);
  updateText(d);
}

function clickToZoom(zoomStep) {
  svg
    .transition()
    .duration(ZOOM_DURATION)
    .call(zoom.scaleBy, zoomStep);
}

d3.select("#btn-zoom--in").on("click", () => clickToZoom(ZOOM_IN_STEP));
d3.select("#btn-zoom--out").on("click", () => clickToZoom(ZOOM_OUT_STEP));

//  --------------- Step 1 ---------------
// Prepare SVG container for placing the map,
// and overlay a transparent rectangle for pan and zoom.
const svg = d3
  .select("#map__container")
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%");

const g = svg.call(zoom).append("g");

g
  .append("rect")
  .attr("width", WIDTH * OVERLAY_MULTIPLIER)
  .attr("height", HEIGHT * OVERLAY_MULTIPLIER)
  .attr(
    "transform",
    `translate(-${WIDTH * OVERLAY_OFFSET},-${HEIGHT * OVERLAY_OFFSET})`
  )
  .style("fill", "none")
  .style("pointer-events", "all");

// --------------- Step 2 ---------------
// Project GeoJSON from 3D to 2D plane, and set
// projection config.
const projection = d3
  .geoMercator()
  .center([-2.2, 54.7]) // Center coordinates for the UK
  .scale(2200) // Adjust the scale as needed
  .translate([WIDTH / 2, HEIGHT / 2]);

// --------------- Step 3 ---------------
// Prepare SVG path and color, import the
// effect from above projection.
const path = d3.geoPath().projection(projection);
const color = d3.scaleOrdinal(d3.schemeCategory20c.slice(1, 4));

// --------------- Step 4 ---------------
// 1. Plot the map from data source `hongkong`
// 2. Place the district name in the map
renderMap(ukmap);

function renderMap(root) {
  // Draw districts and register event listeners
  g
    .append("g")
    .selectAll("path")
    .data(root.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", (d, i) => color(i))
    .attr("stroke", "#FFF")
    .attr("stroke-width", 0.5)
    .on("mouseover", mouseOverHandler)
    .on("mouseout", mouseOutHandler)
    .on("click", clickHandler);

  // Place name labels in the middle of a district
  // Introduce some offset (dy, dx) to adjust the position
  g
    .append("g")
    .selectAll("text")
    .data(root.features)
    .enter()
    .append("text")
    .attr("transform", d => `translate(${path.centroid(d)})`)
    .attr("text-anchor", "middle")
    .attr("font-size", 10)
    .attr("dx", d => _.get(d, "offset[0]", null))
    .attr("dy", d => _.get(d, "offset[1]", null))
    .text(d => d.properties.name);
}

let isTableVisible = false;



// Function to update the map based on the selected dataset
function updateMapVisualization() {  
  // Get the selected dataset value from the dropdown
  const selectedDataset = document.getElementById('datasetSelection').value;

  // Determine which dataset to use based on the selection
  let activeData;
  switch (selectedDataset) {
    case 'district':
      selectedData = districtData;
      break;
    case 'women':
      selectedData = womenData;
      break;
    case 'men':
      selectedData = menData;
      break;
    case 'ratio':
      selectedData = ratioData;
      break;
    default:
      console.error('Selected dataset is not recognized.');
      return; // Exit the function if the selected dataset is not recognized
  }


  if (selectedI != "" && selectedD != "") {            
    updateText(selectedD);
    updateColours(selectedLAD, selectedI);
    updateMapColors(document.getElementById('indexSelection').value);
  }
}

document.getElementById('indexSelection').addEventListener('change', function() {  
  updateMapColors(this.value);
});

function updateMapColors(selectedIndex) {  
  // No index selected, retain existing color logic
  if (selectedIndex === 'none') {  
    g.selectAll("path")
      .attr("fill", (d, i) => color(i)); // Your existing color logic
  } else {
    // An index is selected, color the LADs based on their value for the selected index
    g.selectAll("path")
      .attr("fill", d => {
        if (d.properties && selectedData[d.properties.LAD13NM]) {
          const value = parseFloat(selectedData[d.properties.LAD13NM][selectedIndex]); // Ensure this is a number          
          return value != null ? colorScale(value) : "#ccc"; // Use a fallback color if no data
        } else {
          return "#ccc"; // Default color if properties are missing or LAD13NM is not in selectedData
        }
      });
  }
}

// Listen for changes on the dropdown and update the map visualization
document.getElementById('datasetSelection').addEventListener('change', updateMapVisualization);

// Initial update call to render the default selected dataset view
updateMapVisualization();
updateMapColors(document.getElementById('indexSelection').value);

