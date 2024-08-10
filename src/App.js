// src/App.js
import React, { useEffect, useState } from 'react';
import FMSCAViewer from './FmscaViewer';
import Header from './Header';
import PivotTableComponent from './PivotTable';
import { readExcel } from './readExcel';
import { TextField } from '@material-ui/core';
import ClipLoader from 'react-spinners/ClipLoader';
import { css } from '@emotion/react';
import { AppBar, Tabs, Tab, Box, Typography} from '@material-ui/core';

const DefaultColumnFilter = ({
  column: { filterValue, preFilteredRows, setFilter },
}) => {
  const count = preFilteredRows.length;

  return (
    <TextField
      value={filterValue || ''}
      onChange={(e) => {
        setFilter(e.target.value || undefined);
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
  'p_street',
  'p_city',
  'p_state',
  'p_zip_code',
  'phone',
  'mailing_address',
  'm_street',
  'm_city',
  'm_state',
  'm_zip_code',
  'usdot_number',
  'mc_mx_ff_number',
  'power_units',
  'mcs_150_form_date',
  'out_of_service_date',
  'state_carrier_id_number',
  'duns_number',
  'drivers',
  'mcs_150_mileage_year',
  'id',
  'credit_score',
  'record_status',
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
  'p_street': 'PStreet',
  'p_city': 'PCity',
  'p_state': 'PState',
  'p_zip_code': 'PZip Code',
  'phone': 'Phone',
  'mailing_address':'Maling address',
  'm_street': 'MStreet',
  'm_city': 'MCity',
  'm_state': 'MState',
  'm_zip_code': 'MZip Code',
  'usdot_number': 'DOT',
  'mc_mx_ff_number': 'MC/MX/FF',
  'power_units': 'Power units',
  'mcs_150_form_date':'mcs_150_form_date',
  'out_of_service_date': 'Out of service date',
  'state_carrier_id_number':'state_carrier_id_number',
  'duns_number':'duns_number',
  'drivers':'drivers',
  'mcs_150_mileage_year':'mcs_150_mileage_year',
  'id':'id',
  'credit_score':'credit_score',
  'record_status':'record_status',
  // Add more mappings as needed
};

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const appStyle = css`
  background-color: #F0F0F0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function App() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabIndex, setTabIndex] = useState(0);

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
      setLoading(false);
    };

    loadData();
  }, []);

  const handleTabChange = (event, newValue) => {
    if (!loading) {
      setTabIndex(newValue);
    }
  };

  return (
    <div css={appStyle}>
      <Header />
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <ClipLoader color={"#123abc"} loading={loading} css={override} size={150} />
        </div>
      ) : (
        <>
          <AppBar position="static">
            <Tabs value={tabIndex} onChange={handleTabChange} aria-label="simple tabs example">
              <Tab label="Table View" {...a11yProps(0)} />
              <Tab label="Pivot Table View" {...a11yProps(1)}/>
            </Tabs>
          </AppBar>
          <TabPanel value={tabIndex} index={0}>
            <FMSCAViewer data={data} columns={columns} />
          </TabPanel>
          <TabPanel value={tabIndex} index={1}>
            <PivotTableComponent filePath="/FMSCA_records_(2).xlsx" specifiedHeaders={specifiedHeaders} headerMapping={headerMapping} />
          </TabPanel>
        </>
      )}
    </div>
  );
}

export default App;

