const colorScale = d3.scaleLinear()
  .domain([0, 1]) // Domain from 0 to 1 for your data values
  .range(["#fff", "#0000ff"]);

export function getSelectedDataSet(allDataSets) {
     // Get the selected dataset value from the dropdown
     const selectedDataSet = document.getElementById('indexSelection').value;
     var index = {};
     // Determine which dataset to use based on the selection     
     switch (selectedDataSet) {    
       case 'femaleIndex':
        index = allDataSets['femaleDataSet'];
         break;
       case 'maleIndex':
        index = allDataSets['maleDataSet'];
         break;
       case 'genderEqualityIndex':
        index = allDataSets['genderEqualityDataSet'];
         break;
       default:
         console.error('Selected dataset is not recognized.');
         return; // Exit the function if the selected dataset is not recognized
     }

     return index;
}


export function getSelectedDomain() {
  // Get the selected dataset value from the dropdown
  return document.getElementById('domainDropdown').value;  
}

export function getSelectedSubdomain() {
  // Get the selected dataset value from the dropdown
  return document.getElementById('subdomainDropdown').value;  
}

export function getSelectedIndicator() {
  // Get the selected dataset value from the dropdown
  return document.getElementById('indicatorDropdown').value;  
}


function getDomainFromDomainsArray(domains, domainName) {
  const domainObject = domains.find(dom => dom.name === domainName)
  return domainObject || null
}

function getSubdomainFromSubdomainsArray(subDomains, subDomainName) {
  const domainObject = domains.find(dom => dom.name === domainName)
  return domainObject || null
}

export function getLADByName(dataSet, ladName) {
  const ladObject = dataSet.find(lad => lad.lad_name === ladName);
  return ladObject || null; // Return the found object or null if not found
}


function getValueFromDomainSubDomainIndicator(ladFromDataSet ) { 
  const selectedDomain = getSelectedDomain();
  const selectedSubdomain = getSelectedSubdomain();
  const selectedIndicator = getSelectedIndicator();

  if (selectedDomain === "all") {
    return ladFromDataSet.percentile
  } else if (selectedSubdomain === "all") {
      const domain = getDomainFromDomainsArray(ladFromDataSet.domains, selectedDomain);
      console.log(ladFromDataSet)
      console.log(domain.name);
      console.log(domain.percentile);
      return domain.percentile;      
  } else if (selectedIndicator === 'all') {
    return ladFromDataSet[selectedDomain][selectedSubdomain].percentile
  } else {
    return ladFromDataSet[selectedDomain][selectedSubdomain][selectedIndicator].percentile
  }
}

export function getLadColour(allDataSets, ladName) {
  const dataSet = getSelectedDataSet(allDataSets);

  const ladFromDataSet = getLADByName(dataSet, ladName)          

  if (ladFromDataSet) {
    
    const value = parseFloat(getValueFromDomainSubDomainIndicator(ladFromDataSet)); // Ensure this is a number                          
    return value != null ? colorScale(value/100) : "#ccc";
  

  }
  return "#ccc"            
}