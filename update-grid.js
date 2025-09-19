// Script to update Grid components in AssessmentAddPage.tsx
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'assements', 'components', 'AssessmentAddPage.tsx');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Remove the duplicate Grid import
content = content.replace('import Grid from \'@mui/material/Unstable_Grid2/Grid2\';', '');

// Replace all Grid item instances with Grid
content = content.replace(/<Grid item/g, '<Grid');

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

console.log('Successfully updated Grid components in AssessmentAddPage.tsx');