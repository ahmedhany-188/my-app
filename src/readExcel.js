// src/utils/readExcel.js
import * as XLSX from 'xlsx';

export const readExcel = async (url, specifiedHeaders, headerMapping) => {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);
  const workbook = XLSX.read(data, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  // Extract headers and filter based on specifiedHeaders
  const headers = jsonData[0];
  const filteredHeaders = headers.filter(header => specifiedHeaders.includes(header))
                                 .map(header => headerMapping[header] || header);
  
  // Format data according to specifiedHeaders and headerMapping
  const formattedData = jsonData.slice(1).map((row, index) => {
    let rowData = { id: index + 1 };
    headers.forEach((header, i) => {
      if (specifiedHeaders.includes(header)) {
        const newHeader = headerMapping[header] || header;
        rowData[newHeader] = row[i];
      }
    });
    return rowData;
  });

  return { filteredHeaders, formattedData };
};
