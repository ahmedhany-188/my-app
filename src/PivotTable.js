// src/components/PivotTable.js
import React, { useState, useEffect, useMemo } from 'react';
import PivotTableUI from 'react-pivottable/PivotTableUI';
import 'react-pivottable/pivottable.css';
import { readExcel } from './readExcel';
import { css } from '@emotion/react';
import ClipLoader from 'react-spinners/ClipLoader';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const pivotTableStyle = css`
  margin: 20px;
`;

const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const PivotTableComponent = ({ filePath, specifiedHeaders, headerMapping }) => {
  const [data, setData] = useState([]);
  const [pivotState, setPivotState] = useState({});
  const [loading, setLoading] = useState(true);

  // Function to transform data for grouping by year/month/week
  const transformDataForGrouping = (data) => {
    return data.map(item => ({
      ...item,
      year: new Date(item.datetimeField).getFullYear(),
      month: new Date(item.datetimeField).getMonth() + 1,
      week: getWeekNumber(new Date(item.datetimeField)), // Function to calculate the week number
    }));
  };

  // Function to calculate week number
  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const { formattedData } = await readExcel(filePath, specifiedHeaders, headerMapping);
      const transformedData = transformDataForGrouping(formattedData);
      setData(transformedData);
      setLoading(false);
    };

    loadData();
  }, [filePath, specifiedHeaders, headerMapping]);

  // Generate chart data based on the pivot table state
  const chartData = useMemo(() => {
    const pivotData = pivotState.data || [];
    const rowKeys = pivotState.rowKeys || [];
    const colKeys = pivotState.colKeys || [];
    const vals = pivotState.vals || [];

    const labels = rowKeys.map(key => key.join(' - '));
    const datasets = colKeys.map((col, idx) => ({
      label: col.join(' - '),
      data: pivotData.map(row => row[idx]),
      backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`,
    }));

    return {
      labels,
      datasets,
    };
  }, [pivotState]);

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
          <div style={{ marginTop: '40px' }}>
            <Bar data={chartData} />
          </div>
        </>
      )}
    </div>
  );
};

export default PivotTableComponent;
