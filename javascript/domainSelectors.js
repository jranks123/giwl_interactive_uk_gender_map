
  import { getSelectedDataSet, getSelectedDomain, getSelectedSubdomain, getSelectedIndicator } from "./utilities.js";
    import { updateMapAndTextBasedOnSelection } from "./mapDrawing.js";

  function updateSubdomains(selectedDomain, allDataSets) {
    const subdomainDropdown = document.getElementById('subdomainDropdown');
    subdomainDropdown.innerHTML = '<option value="all">All Subdomains</option>'; // Reset
  
    // Disable subdomain and indicator dropdowns if "All Domains" is selected
    const disableDropdown = selectedDomain === 'all';
    subdomainDropdown.disabled = disableDropdown;
    updateIndicators('all', allDataSets, disableDropdown); // Pass additional parameter to control disable state
  
    if (!disableDropdown) {
      // Fetch the current dataset
      const data = getSelectedDataSet(allDataSets);
  
      // Use a Set to track unique subdomain names to prevent duplicates
      const uniqueSubdomainNames = new Set();
  
      data.forEach(item => {
        item.domains.forEach(domain => {
          if (domain.name === selectedDomain) {
            domain.subdomains.forEach(subdomain => {
              uniqueSubdomainNames.add(subdomain.name); // Add to Set to ensure uniqueness
            });
          }
        });
      });
  
      // Now, iterate over the unique subdomain names and add them as options
      uniqueSubdomainNames.forEach(subdomainName => {
        const option = document.createElement('option');
        option.value = subdomainName;
        option.text = subdomainName;
        subdomainDropdown.appendChild(option);
      });
    }
  }


  function updateIndicators(selectedSubdomain, allDataSets, disableDropdown = false) {
    const indicatorDropdown = document.getElementById('indicatorDropdown');
    indicatorDropdown.innerHTML = '<option value="all">All Indicators</option>'; // Reset
    indicatorDropdown.disabled = disableDropdown || selectedSubdomain === 'all'; // Disable based on condition
  
    if (!disableDropdown && selectedSubdomain !== 'all') {
      // Fetch the current dataset
      const data = getSelectedDataSet(allDataSets);
  
      // Prepare to collect unique indicators to prevent duplicates
      const uniqueIndicators = new Set();
  
      data.forEach(item => {
        item.domains.forEach(domain => {
          domain.subdomains.forEach(subdomain => {
            if (subdomain.name === selectedSubdomain) {
              subdomain.indicators.forEach(indicator => {
                uniqueIndicators.add(indicator.name); // Add to Set to ensure uniqueness
              });
            }
          });
        });
      });
  
      // Iterate over unique indicators and add them as options
      uniqueIndicators.forEach(indicatorName => {
        const option = document.createElement('option');
        option.value = indicatorName;
        option.text = indicatorName;
        indicatorDropdown.appendChild(option);
      });
    }
  }

  export function populateDomains(allDataSets, g) {
    
    const data = getSelectedDataSet(allDataSets)


    const domainDropdown = document.getElementById('domainDropdown');
    const uniqueDomains = new Set(); // Use a Set to ensure uniqueness

    data.forEach((item) => {
        item.domains.forEach((domain) => {
            uniqueDomains.add(domain.name);
        });
    });

    uniqueDomains.forEach(domainName => {
        const option = document.createElement('option');
        option.value = domainName;
        option.text = domainName;
        domainDropdown.appendChild(option);
    });

    document.getElementById('subdomainDropdown').disabled = true;
    document.getElementById('indicatorDropdown').disabled = true;

    document.getElementById('domainDropdown').addEventListener('change', (e) => {
        updateSubdomains(e.target.value, allDataSets);
        updateIndicators('all', allDataSets); // Reset indicators when domain changes
        updateMapAndTextBasedOnSelection(g, allDataSets, getSelectedDomain(), getSelectedSubdomain(), getSelectedIndicator());
    });
    
    document.getElementById('subdomainDropdown').addEventListener('change', (e) => {
        updateIndicators(e.target.value, allDataSets);
        updateMapAndTextBasedOnSelection(g, allDataSets, getSelectedDomain(), getSelectedSubdomain(), getSelectedIndicator());

    });

    document.getElementById('indicatorDropdown').addEventListener('change', function() {
        const selectedIndicator = this.value;
        updateMapAndTextBasedOnSelection(g, allDataSets, getSelectedDomain(), getSelectedSubdomain(), getSelectedIndicator());
      });

  }

  