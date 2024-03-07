const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const ZOOM_THRESHOLD = [0.3, 7];
const OVERLAY_MULTIPLIER = 10;
const OVERLAY_OFFSET = OVERLAY_MULTIPLIER / 2 - 0.5;
const ZOOM_DURATION = 500;
const ZOOM_IN_STEP = 2;
const ZOOM_OUT_STEP = 1 / ZOOM_IN_STEP;
const HOVER_COLOR = "#d36f80"
let districtData = {};
let womenData = {};
let menData = {};
let ratioData = {};
let selectedData = districtData;
selectedD = "";
selectedI = "";
selectedLAD = "";

// Function to load CSV file
function loadCSVFile(url, callback) {
    d3.csv(url, function(error, data) {
        if (error) {
            console.error('Error loading CSV file:', error);
            return;
        }
        callback(data);
    });
}

// Function to parse CSV data
function parseCSV(data) {

    data.forEach(function(row) {
        districtData[row.lad_name] = row;
        
        womenData[row.lad_name] = {
          "lad_code": row.lad_code
          , "lad_name": row.lad_name
          , "region_name": row.region_name
          , "country": row.country 
          , "Index": row.index_w
          , "Paid Work": row.paid_work_w
          , "Money": row.money_w
          , "Unpaid Work": row.unpaid_work_w
          , "Education": row.education_w
          , "Power": row.power_w
          , "Health": row.health_w
        }

        menData[row.lad_name] = {
          "lad_code": row.lad_code
          , "lad_name": row.lad_name
          , "region_name": row.region_name
          , "country": row.country 
          ,"Index": row.index_m
          , "Paid Work": row.paid_work_m
          , "Money": row.money_m
          , "Unpaid Work": row.unpaid_work_m
          , "Education": row.education_m
          , "Power": row.power_m
          , "Health": row.health_m
        }

        ratioData[row.lad_name] = {
          "lad_code": row.lad_code
          , "lad_name": row.lad_name
          , "region_name": row.region_name
          , "country": row.country 
          ,"Index": row.index_RatioMM
          , "Paid Work": row.paid_work_RatioMM
          , "Money": row.money_RatioMM
          , "Unpaid Work": row.unpaid_work_RatioMM
          , "Education": row.education_RatioMM
          , "Power": row.power_RatioMM
          , "Health": row.health_RatioMM
        }

    });


}


// Load and parse the CSV file
loadCSVFile('new_gender_data.csv', parseCSV);


// --------------- Event handler ---------------
const zoom = d3
  .zoom()
  .scaleExtent(ZOOM_THRESHOLD)
  .on("zoom", zoomHandler);

function zoomHandler() {
  g.attr("transform", d3.event.transform);
}

function mouseOverHandler(d, i) {
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

  console.log("setting");
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

  console.log("Hello");
  console.log(selectedI);
  console.log(selectedD);
  console.log(selectedLAD);
  if (selectedI != "" && selectedD != "") {    
    console.log("Hello2");    
    updateText(selectedD);
    updateColours(selectedLAD, selectedI);
  }
  
  

  // Assuming you have a global `g` variable for your map's <g> SVG element
  // Update the map's paths with the new data
  // const paths = g.selectAll("path")
  //                .data(activeData); // Here, replace with the correct binding, possibly needing adjustment

  // If your district data matches directly with GeoJSON features,
  // you might need to join this `activeData` with your GeoJSON structure
  // For demonstration, the code directly applies the dataset assuming a direct match

  // Enter (if necessary) and update paths
  // paths.enter()
  //      .append("path")
  //      .merge(paths)
  //      .attr("d", path) // Make sure `path` is your geoPath projection function
  //      .attr("fill", (d, i) => colorScale(i)); // Example: use a color scale based on index

  // Handle exit
  // paths.exit().remove();

  // Add any other necessary updates (e.g., event handlers, tooltips)
}

// Listen for changes on the dropdown and update the map visualization
document.getElementById('datasetSelection').addEventListener('change', updateMapVisualization);

// Initial update call to render the default selected dataset view
updateMapVisualization();
