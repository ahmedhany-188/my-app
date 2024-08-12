import React, { useState, useMemo, useEffect } from 'react';
import { useTable, useFilters, useSortBy, usePagination, useGlobalFilter, useColumnOrder } from 'react-table';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TextField, Button, Checkbox, makeStyles, Typography
} from '@material-ui/core';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

// Custom styling
const useStyles = makeStyles((theme) => ({
  controlsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  searchInput: {
    width: '70%',
  },
  applyButton: {
    width: '25%',
  },
  tableHeader: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    textAlign: 'center',
    fontWeight: 'bold',
    whiteSpace: 'normal',
    lineHeight: 1.2,
    padding: theme.spacing(1),
  },
  headerCell: {
    padding: theme.spacing(2),
    textAlign: 'center',
    fontWeight: 'bold',
  },
  cell: {
    padding: theme.spacing(1),
    textAlign: 'center',
  },
  chartContainer: {
    marginTop: theme.spacing(4),
    height: '400px', // Set a fixed height for the chart container
  },
  editableInput: {
    width: '60px',
    textAlign: 'center',
  },
}));

const FMSCAViewer = ({ data, columns }) => {
  const classes = useStyles();
  const [order, setOrder] = useState(columns.map(col => col.accessor));
  const [chartData, setChartData] = useState(() => {
    // Load chart data from localStorage if available
    const savedData = localStorage.getItem('chartData');
    return savedData ? JSON.parse(savedData) : { labels: [], datasets: [{ label: 'Companies Out of Service', data: [], backgroundColor: 'rgba(75, 192, 192, 0.6)' }] };
  });
  const [orderedColumns, setOrderedColumns] = useState(columns);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    state: { pageIndex, pageSize, globalFilter },
    previousPage,
    nextPage,
    setPageSize,
    setGlobalFilter,
    allColumns,
    setColumnOrder,
    rows,
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, columnOrder: order },
    },
    useFilters,
    useGlobalFilter,  // For global search
    useSortBy,        // For sorting
    usePagination,
    useColumnOrder    // For customizing column order
  );

  const handleColumnOrderChange = (newOrder) => {
    setOrder(newOrder);
    setColumnOrder(newOrder);
  };

  // Generate bar chart data
  const barChartData = useMemo(() => {
    const filteredData = rows.map(row => row.original);
    const groupedByMonth = filteredData.reduce((acc, item) => {
      const month = new Date(item.out_of_service_date).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (acc[month]) {
        acc[month] += 1;
      } else {
        acc[month] = 1;
      }
      return acc;
    }, {});

    const labels = Object.keys(groupedByMonth);
    const data = Object.values(groupedByMonth);

    return {
      labels,
      datasets: [
        {
          label: 'Companies Out of Service',
          data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
      ],
    };
  }, [rows]);

  // Update and save chart data
  const handleDataChange = (index, value) => {
    const updatedData = { ...chartData };
    updatedData.datasets[0].data[index] = Number(value);
    setChartData(updatedData);
    localStorage.setItem('chartData', JSON.stringify(updatedData));
  };

  useEffect(() => {
    // Sync the chart data with local storage whenever it updates
    localStorage.setItem('chartData', JSON.stringify(chartData));
  }, [chartData]);

  return (
    <div>
      <div className={classes.controlsContainer}>
        <TextField
          className={classes.searchInput}
          value={globalFilter || ''}
          onChange={(e) => setGlobalFilter(e.target.value || undefined)}
          placeholder="Search..."
          variant="outlined"
        />
        <Button
          onClick={() => handleColumnOrderChange(allColumns.map(col => col.id))}
          variant="contained"
          color="primary"
          className={classes.applyButton}
        >
          Apply Column Order
        </Button>
      </div>

      <div style={{ marginTop: '20px', padding: '20px' }}>
        <h3 style={{
          marginRight: '10px',
          marginBottom: '10px',
          padding: '15px',
          backgroundColor: '#f0f0f0',
          borderRadius: '8px',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
        }}>Filter Columns:</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {allColumns.map(column => (
            <div
              key={column.id}
              style={{
                marginRight: '10px',
                marginBottom: '10px',
                padding: '15px',
                backgroundColor: '#f0f0f0',
                borderRadius: '8px',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)'
              }}>
              <Checkbox {...column.getToggleHiddenProps()} /> {column.Header}
            </div>
          ))}
        </div>
      </div>

      <TableContainer>
        <Table {...getTableProps()}>
          <TableHead>
            {headerGroups.map((headerGroup) => (
              <TableRow {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column, index) => (
                  <TableCell
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    style={{
                      height: '80px',
                      minWidth: '150px',
                      maxWidth: '150px',
                      whiteSpace: 'normal', // Allows text to wrap
                      wordWrap: 'break-word', // Breaks long words
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center', // Center the text within the cell
                      borderRight: index < headerGroup.headers.length - 1 ? '1px solid #ccc' : 'none', // Vertical line
                    }}
                  >
                    <Typography variant="body2">
                      {column.render('Header')}
                    </Typography>
                    <div>{column.canFilter ? column.render('Filter') : null}</div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody {...getTableBodyProps()}>
            {page.map((row, i) => {
              prepareRow(row);
              return (
                <TableRow {...row.getRowProps()}>
                  {row.cells.map((cell, index) => (
                    <TableCell
                      {...cell.getCellProps()}
                      style={{
                        height: '50px',
                        minWidth: '150px',
                        maxWidth: '150px',
                        whiteSpace: 'normal', // Allows text to wrap
                        wordWrap: 'break-word', // Breaks long words
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center', // Center the text within the cell
                        borderRight: index < row.cells.length - 1 ? '1px solid #ccc' : 'none', // Vertical line
                      }}
                    >
                      {cell.render('Cell')}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 20, 30]}
          component="div"
          count={data.length}
          rowsPerPage={pageSize}
          page={pageIndex}
          onPageChange={(event, newPage) => {
            if (newPage > pageIndex) {
              nextPage();
            } else {
              previousPage();
            }
          }}
          onRowsPerPageChange={(event) => setPageSize(Number(event.target.value))}
        />
      </TableContainer>

      <div className={classes.chartContainer}>
        <Bar
          data={barChartData}
          options={{
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                display: true,
                position: 'top',
              },
              tooltip: {
                callbacks: {
                  label: function (tooltipItem) {
                    return `${barChartData.labels[tooltipItem.dataIndex]}: ${tooltipItem.raw}`;
                  },
                },
              },
            },
          }}
        />
        <div style={{ marginTop: '20px' }}>
          <h3>Edit Chart Data</h3>
          {barChartData.labels.map((label, index) => (
            <div key={label} style={{ marginBottom: '10px' }}>
              <label>
                {label}: 
                <input
                  type="number"
                  className={classes.editableInput}
                  value={chartData.datasets[0].data[index]}
                  onChange={(e) => handleDataChange(index, e.target.value)}
                />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FMSCAViewer;
