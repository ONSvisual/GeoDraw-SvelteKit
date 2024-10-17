const fs = require('fs');

// Read the JSON file
const jsonData = JSON.parse(fs.readFileSync('topics.json', 'utf8'));

// Add a new field to each item
const updatedData = jsonData.map(item => ({
  ...item,
  source: 'Office for National Statistics - Census 2021' // Replace 'newField' with your desired field name and 'defaultValue' with the default value
}));

// Write the updated data back to the file
fs.writeFileSync('updated_topics.json', JSON.stringify(updatedData, null, 2));

console.log('New field added to all items in the JSON array.');
