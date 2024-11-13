// # Update 'measure' key
// node bulk-update-json.cjs topics.json updated_topics.json measure "Population Count"

// # Update 'source' key
// node bulk-update-json.cjs topics.json updated_topics.json source "Census 2021"

// # Update any other key
// node bulk-update-json.cjs topics.json updated_topics.json category "Demographics"

const fs = require('fs');
const path = require('path');

// Check if required arguments are provided
if (process.argv.length < 5) {
  console.error('Usage: node script.js <input_file> <output_file> <key_to_update> <new_value>');
  console.error('Example: node script.js topics.json updated_topics.json measure "New Measure"');
  process.exit(1);
}

// Get command-line arguments
const inputFile = process.argv[2];
const outputFile = process.argv[3];
const keyToUpdate = process.argv[4];
const newValue = process.argv[5];

try {
  // Read the JSON file
  const jsonData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

  // Bulk update the specified key for all items
  const updatedData = jsonData.map(item => ({
    ...item,
    [keyToUpdate]: newValue
  }));

  // Write the updated data back to the file
  fs.writeFileSync(outputFile, JSON.stringify(updatedData, null, 2));
  
  console.log(`Successfully updated '${keyToUpdate}' for all items.`);
  console.log(`Input file: ${inputFile}`);
  console.log(`Output file: ${outputFile}`);
} catch (error) {
  console.error('An error occurred:', error.message);
  process.exit(1);
}