import { getSelectedDataSet } from './utilities.js';

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;
const ZOOM_THRESHOLD = [0.3, 7];
const OVERLAY_MULTIPLIER = 10;
const OVERLAY_OFFSET = OVERLAY_MULTIPLIER / 2 - 0.5;
const ZOOM_DURATION = 500;
const ZOOM_IN_STEP = 2;
const ZOOM_OUT_STEP = 1 / ZOOM_IN_STEP;
const projection = d3
.geoMercator()
.center([-2.2, 54.7]) // Center coordinates for the UK
.scale(2200) // Adjust the scale as needed
.translate([WIDTH / 2, HEIGHT / 2]);
const HOVER_COLOR = "#d36f80";
const colorScale = d3.scaleLinear()
  .domain([0, 1]) // Domain from 0 to 1 for your data values
  .range(["#fff", "#0000ff"]);
const path = d3.geoPath().projection(projection);
const color = d3.scaleOrdinal(d3.schemeCategory20c.slice(1, 4));  


export function updateColourOfSelectedLAD(selectedLAD, i, svg) {    
    svg.selectAll("path.selected")
    .classed("selected", false)
    .attr("fill", color(i));

    d3.select(selectedLAD).classed("selected", true);
    d3.select(selectedLAD).attr("fill", HOVER_COLOR);
}


function zoomHandler(g) {
  g.attr("transform", d3.event.transform);
}

function ladMouseOverHandler(lad, d, i, allDataSets) {    
    const selectedDataSet = getSelectedDataSet(allDataSets);    
    d3.select(lad).attr("fill", HOVER_COLOR)
}

function ladMouseOutHandler(lad, d, i, allDataSets) {
  if (!d3.select(lad).classed("selected")) {
    d3.select(lad).attr("fill", color(i));
  }
}

function updateText(selectedLAD, allDataSets) {
  const selectedDataSet = getSelectedDataSet(allDataSets);
  const ladCode = selectedLAD.properties.LAD13NM;
  if ( selectedDataSet[ladCode]) {

    const unfilteredData = selectedDataSet[ladCode] ;
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

function ladClickHandler(lad, d, i, svg, allDataSets) { 
  updateColourOfSelectedLAD(lad, i, svg);
  updateText(lad, allDataSets);
}

function clickToZoom(zoomStep, ZOOM_DURATION) {
  svg
    .transition()
    .duration(ZOOM_DURATION)
    .call(zoom.scaleBy, zoomStep);
}




export function renderMap(g,root, path, color, svg, allDataSets) {

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
      .on("mouseover", function (d, i ) {
        ladMouseOverHandler(this, d, i, allDataSets);
      }) 
      .on("mouseout", function (d, i ) {
        ladMouseOutHandler(this, d, i, allDataSets);
      }) 
      .on("click", function (d, i ) {
        ladClickHandler(this, d, i, svg, allDataSets)
      }) 
  
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



export function createMap(allDataSets) {
    
    //  --------------- Step 1 ---------------
    // Prepare SVG container for placing the map,
    // and overlay a transparent rectangle for pan and zoom.
    const svg = d3
    .select("#map__container")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%");

    const zoom = d3
    .zoom()
    .scaleExtent(ZOOM_THRESHOLD)
    .on("zoom", () => zoomHandler(g));

    
    const g = svg.call(zoom).append("g");

    // --------------- Event handler ---------------

    // Prepare SVG path and color, import the
    // effect from above projection.
    d3.select("#btn-zoom--in").on("click", () => clickToZoom(ZOOM_IN_STEP, ZOOM_DURATION));
    d3.select("#btn-zoom--out").on("click", () => clickToZoom(ZOOM_OUT_STEP, ZOOM_DURATION));

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
        
    renderMap(g, ukmap, path, color, svg, allDataSets);

    return g;

}

// Function to update the map based on the selected dataset
export function updateMapVisualizationBasedOnDataSetChange(g, allDataSets, selectedLAD, selectedI) {  
        
    if (selectedI != undefined && selectedLAD != undefined) {            
      updateText(selectedLAD, allDataSets);
      updateColourOfSelectedLAD(selectedLAD, selectedI, svg);      
    }
    updateMapColors(g, allDataSets);
  }


  export function updateMapColors(g, allDataSets) {  

    console.log(g);
    console.log(allDataSets);

    const selectedDataSet = getSelectedDataSet(allDataSets);
    // No index selected, retain existing color logic
    if (true) {  
      g.selectAll("path")
        .attr("fill", (d, i) => color(i)); // Your existing color logic
    } else {
      // An index is selected, color the LADs based on their value for the selected index
      g.selectAll("path")
        .attr("fill", d => {            
          if (d.properties && selectedDataSet[d.properties.LAD13NM]) {
            const value = parseFloat(selectedDataSet[d.properties.LAD13NM].index_overall); // Ensure this is a number          
            console.log(value);
            return value != null ? colorScale(value) : "#ccc"; // Use a fallback color if no data
          } else {
            return "#ccc"; // Default color if properties are missing or LAD13NM is not in selectedData
          }
        });
    }
  }