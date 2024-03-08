// Function to load CSV file
export function loadCSVFile(url, callback, param) {
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


// function for parsing the descriptions csv
export function parseDescriptionsCsv(descriptionsCsvData) {
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
return descriptionsMap;
}

// function for parsing the main data csv
export function parseCsvToStructuredDataWithDescriptions(csvData, descriptionsMap) {
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