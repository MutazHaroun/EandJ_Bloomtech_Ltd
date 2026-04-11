const xlsx = require('xlsx');

try {
  const workbook = xlsx.readFile('../my_products/New Microsoft Excel Worksheet.xlsx');
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);
  
  console.log('Columns found:', Object.keys(data[0] || {}));
  console.log('First 2 rows:', data.slice(0, 2));
} catch (e) {
  console.error(e);
}
