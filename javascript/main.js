import { loadCSVFile, parseDescriptionsCsv, parseCsvToStructuredDataWithDescriptions } from './csv.js'
import { checkIndicatorsHaveDescriptionsAndPrintDistinct } from './qa.js'
import { updateMapVisualizationBasedOnDataSetChange, updateMapColors, renderMap, createMap } from './mapDrawing.js';
import { calculateAndStorePercentiles } from './percentiles.js'
import { populateDomains } from './domainSelectors.js';

// Usage example with Promises
loadCSVFile('data/indicator_dictionary.csv', parseDescriptionsCsv)
    .then(descriptionsMap => {
        return Promise.all([
            loadCSVFile('data/female_index.csv', parseCsvToStructuredDataWithDescriptions, descriptionsMap),
            loadCSVFile('data/male_index.csv', parseCsvToStructuredDataWithDescriptions, descriptionsMap),
            loadCSVFile('data/gender_equality_index.csv', parseCsvToStructuredDataWithDescriptions, descriptionsMap)
        ]);
    })
    .then(([femaleDataSet, maleDataSet, genderEqualityDataSet]) => {
        // At this point, all CSVs have been loaded and processed
        checkIndicatorsHaveDescriptionsAndPrintDistinct(femaleDataSet);        
        checkIndicatorsHaveDescriptionsAndPrintDistinct(maleDataSet);
        checkIndicatorsHaveDescriptionsAndPrintDistinct(genderEqualityDataSet);
        calculateAndStorePercentiles(femaleDataSet);
        calculateAndStorePercentiles(maleDataSet);
        calculateAndStorePercentiles(genderEqualityDataSet);

        console.log(femaleDataSet);
        console.log(maleDataSet);
        console.log(genderEqualityDataSet);

        const allDataSets = {
          "femaleDataSet": femaleDataSet
          , "maleDataSet": maleDataSet
          , "genderEqualityDataSet": genderEqualityDataSet
        }

        const g = createMap(allDataSets);        
        
        document.getElementById('indexSelection').addEventListener('change', function() {  
          updateMapColors(g, allDataSets);
        });

        // Listen for changes on the dropdown and update the map visualization
 

        // Initial update call to render the default selected dataset view
        updateMapVisualizationBasedOnDataSetChange(g, allDataSets);
        updateMapColors(g, allDataSets);
        populateDomains(allDataSets, g);


    })
    .catch(error => {
        console.error("An error occurred:", error);
    });











