// src/App.js
import React, { useEffect, useState } from 'react';
import FMSCAViewer from './FmscaViewer';
import { readExcel } from './readExcel';
import { TextField, CircularProgress } from '@material-ui/core';
import ClipLoader from 'react-spinners/ClipLoader';
// import { css } from '@emotion/react';
import Header from './Header';

// Define the DefaultColumnFilter here
const DefaultColumnFilter = ({
  column: { filterValue, preFilteredRows, setFilter },
}) => {
  const count = preFilteredRows.length;

  return (
    <TextField
      value={filterValue || ''}
      onChange={(e) => {
        setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
      }}
      placeholder={`Search ${count} records...`}
    />
  );
};

// Define the specified headers and the header mapping
// Define the header mapping
const specifiedHeaders = [
  'created_dt',
  'data_source_modified_dt',
  'entity_type',
  'operating_status',
  'legal_name',
  'dba_name',
  'physical_address',
  'phone',
  'usdot_number',
  'mc_mx_ff_number',
  'power_units',
  'out_of_service_date',
  // Add more mappings as needed
];


// Define the header mapping
const headerMapping = {
  'created_dt': 'Created_DT',
  'data_source_modified_dt': 'Modifed_DT',
  'entity_type': 'Entity',
  'operating_status': 'Operating status',
  'legal_name': 'Legal name',
  'dba_name': 'DBA name',
  'physical_address': 'Physical address',
  'phone': 'Phone',
  'usdot_number': 'DOT',
  'mc_mx_ff_number': 'MC/MX/FF',
  'power_units': 'Power units',
  'out_of_service_date': 'Out of service date',
  // Add more mappings as needed
};

// Define CSS for the spinner
// const override = css`
//   display: block;
//   margin: 0 auto;
//   border-color: red;
// `;  

// const appStyle = css`
//   background-color: grey;
//   min-height: 100vh;
//   display: flex;
//   flex-direction: column;
//   align-items: center;
// `;

function App() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const { filteredHeaders, formattedData } = await readExcel('/FMSCA_records_(2).xlsx', specifiedHeaders, headerMapping);

      const columnsData = filteredHeaders.map(header => ({
        Header: header,
        accessor: header,
        Filter: DefaultColumnFilter,
      }));

      setData(formattedData);
      setColumns(columnsData);
      setLoading(false);  // End loading
    };

    loadData();
  }, []);

  return (
    <div className="App">
       <Header />
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <ClipLoader color={"#123abc"} loading={loading} size={150} />
        </div>
      ) : (
        <FMSCAViewer data={data} columns={columns} />
      )}
    </div>
  );
}

export default App;

