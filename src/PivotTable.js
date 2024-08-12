// src/components/PivotTableWithChart.js
import React, { useState, useEffect, useMemo } from 'react';
import PivotTableUI from 'react-pivottable';
import { Bar } from 'react-chartjs-2';
import 'react-pivottable/pivottable.css';
import { readExcel } from './readExcel';
import { css } from '@emotion/react';
import ClipLoader from 'react-spinners/ClipLoader';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const pivotTableStyle = css`
  margin: 20px;
`;

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

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
};

const PivotTableWithChartComponent = ({ filePath }) => {
  const [data, setData] = useState([]);
  const [pivotState, setPivotState] = useState({});
  const [loading, setLoading] = useState(true);

  const transformDataForGrouping = (data) => {
    return data.map(item => ({
      ...item,
      year: new Date(item[headerMapping['created_dt']]).getFullYear(),
      month: new Date(item[headerMapping['created_dt']]).getMonth() + 1,
      week: getWeekNumber(new Date(item[headerMapping['created_dt']])),
    }));
  };

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const { formattedData } = await readExcel(filePath, Object.keys(headerMapping), headerMapping);
      const transformedData = transformDataForGrouping(formattedData);
      setData(transformedData);
      setLoading(false);
    };

    loadData();
  }, [filePath]);

  const chartData = useMemo(() => {
    if (data.length === 0) return { labels: [], datasets: [] };

    const monthsCount = {};
    const years = [...new Set(data.map(item => item.year))].sort();

    data.forEach(item => {
      const key = `${item.year}-${item.month}`;
      monthsCount[key] = (monthsCount[key] || 0) + 1;
    });

    const labels = years.flatMap(year => 
      Array.from({ length: 12 }, (_, month) => `${year}-${month + 1}`)
    );

    const counts = labels.map(label => monthsCount[label] || 0);

    return {
      labels,
      datasets: [{
        label: 'Count per Month',
        data: counts,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      }],
    };
  }, [data]);

  return (
    <div css={pivotTableStyle}>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <ClipLoader color={"#123abc"} loading={loading} css={override} size={150} />
        </div>
      ) : (
        <>
          <PivotTableUI
            data={data}
            onChange={s => setPivotState(s)}
            {...pivotState}
          />
          <div style={{ marginTop: '20px' }}>
            <Bar
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `${context.label}: ${context.raw}`;
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    title: {
                      display: true,
                      text: 'Month'
                    }
                  },
                  y: {
                    title: {
                      display: true,
                      text: 'Count'
                    },
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default PivotTableWithChartComponent;
