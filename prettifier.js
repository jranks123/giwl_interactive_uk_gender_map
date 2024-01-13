const fs = require('fs');

function prettifyJSONFile(filePath) {
  // Read the JSON data from the file
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return;
    }

    try {
      // Parse the JSON data
      const jsonObject = JSON.parse(data);

      // Convert it back to a formatted JSON string with 2-space indentation
      const formattedJSON = JSON.stringify(jsonObject, null, 2);

      // Write the prettified JSON back to the file
      fs.writeFile(filePath, formattedJSON, 'utf8', (err) => {
        if (err) {
          console.error('Error writing file:', err);
          return;
        }
        console.log('JSON prettified and written to the file successfully.');
      });
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  });
}

// Example usage:
const filePath = process.argv[2]; // Get the file path from command line arguments
if (!filePath) {
  console.error('Please provide a file path as an argument.');
} else {
  prettifyJSONFile(filePath);
}
