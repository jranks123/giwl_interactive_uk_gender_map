export const calculatePercentileRanks = (values) => {
    const sortedValues = [...values].sort((a, b) => a - b);
    return values.map(value => {
        const lowerCount = sortedValues.filter(v => v < value).length;
        const sameCount = sortedValues.filter(v => v === value).length;
        return (lowerCount + 0.5 * sameCount) / values.length * 100;
    });
  };
  
  
  export function collectIndexValuesForPercentileCalculation(structuredData) {
    const indexCollections = {};
   
    let overallIndexes = structuredData.map(lad => lad.index_overall);
    let overallPercentiles = calculatePercentileRanks(overallIndexes);
  
    structuredData.forEach((lad, i) => {
        lad.percentile = overallPercentiles[i];
        lad.domains.forEach(domain => {
            const domainKey = `Domain-${domain.name}`;
            indexCollections[domainKey] = indexCollections[domainKey] || [];
            indexCollections[domainKey].push(domain.index);
  
            domain.subdomains.forEach(subdomain => {
                const subdomainKey = `Subdomain-${domain.name}-${subdomain.name}`;
                indexCollections[subdomainKey] = indexCollections[subdomainKey] || [];
                indexCollections[subdomainKey].push(subdomain.index);
  
                subdomain.indicators.forEach(indicator => {
                    const indicatorKey = `Indicator-${domain.name}-${subdomain.name}-${indicator.name}`;
                    indexCollections[indicatorKey] = indexCollections[indicatorKey] || [];
                    indexCollections[indicatorKey].push(indicator.index);
                });
            });
        });
    });
    return indexCollections;
  }

  
  export function calculateAndStorePercentiles(structuredData) {
    // Prepare data: Collect all index values for efficient percentile calculation
    const indexCollections = collectIndexValuesForPercentileCalculation(structuredData);
    
    // Calculate percentiles for each collection of index values
    Object.keys(indexCollections).forEach(key => {            
        const ranks = calculatePercentileRanks(indexCollections[key]);
        
        // Store calculated percentiles back into the structuredData
        let keyParts = key.split('-');
        keyParts.shift(); // Remove the type part (Domain/Subdomain/Indicator)
        
        structuredData.forEach(lad => {
            lad.domains.forEach(domain => {
                if (key.startsWith('Domain') && domain.name === keyParts[0]) {
                    domain.percentile = parseFloat(ranks.shift().toFixed(2));
                } else if (key.startsWith('Subdomain') && domain.name === keyParts[0]) {
                    domain.subdomains.forEach(subdomain => {
                        if (subdomain.name === keyParts[1]) {
                            subdomain.percentile = parseFloat(ranks.shift().toFixed(2));
                        }
                    });
                } else if (key.startsWith('Indicator') && domain.name === keyParts[0]) {
                    domain.subdomains.forEach(subdomain => {
                        if (subdomain.name === keyParts[1]) {
                            subdomain.indicators.forEach(indicator => {
                                if (indicator.name === keyParts[2]) {
                                    indicator.percentile = parseFloat(ranks.shift().toFixed(2));
                                }
                            });
                        }
                    });
                }
            });
        });
    });
}
