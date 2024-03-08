export function checkIndicatorsHaveDescriptionsAndPrintDistinct(structuredData) {
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