import React, { useEffect, useState, useRef } from 'react';
import PageLayout from '../../components/layout/PageLayout';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Calendar } from 'primereact/calendar'; 
import { FilterMatchMode } from 'primereact/api';

const DataInsights = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    title: { value: null, matchMode: FilterMatchMode.CONTAINS },
    location: { value: null, matchMode: FilterMatchMode.CONTAINS },
    escalationDate: { value: null, matchMode: FilterMatchMode.DATE_IS }, 
  });
  const toast = useRef(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = () => {
    setReports([
      {
        _id: 1,
        serialNo: 1,
        title: 'Mangrove Degradation at Riverbank',
        location: 'Gadhada',
        escalationDate: '2025-09-05',
        severity: 'High',
      },
      {
        _id: 2,
        serialNo: 2,
        title: 'Pollution Alert near Coastal Area',
        location: 'Bhavnagar',
        escalationDate: '2025-09-08',
        severity: 'Medium',
      },
      {
        _id: 3,
        serialNo: 3,
        title: 'Illegal Dumping near Mangrove Area',
        location: 'Junagadh',
        escalationDate: '2025-09-10',
        severity: 'Low',
      },
    ]);
    setLoading(false);
  };

  // 🔍 Global search handler
  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters['global'].value = value;
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  // ❌ Clear all filters
  const clearFilters = () => {
    setFilters({
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      title: { value: null, matchMode: FilterMatchMode.CONTAINS },
      location: { value: null, matchMode: FilterMatchMode.CONTAINS },
      severity: { value: null, matchMode: FilterMatchMode.EQUALS },
      escalationDate: { value: null, matchMode: FilterMatchMode.DATE_IS },
      serialNo: { value: null, matchMode: FilterMatchMode.BETWEEN },
    });
    setGlobalFilterValue('');
  };

  // 🎨 Severity Badge
  const severityBadge = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return <span className="px-2 py-1 bg-red-600 text-white rounded">{severity}</span>;
      case 'medium':
        return <span className="px-2 py-1 bg-orange-500 text-white rounded">{severity}</span>;
      case 'low':
        return <span className="px-2 py-1 bg-green-600 text-white rounded">{severity}</span>;
      default:
        return <span className="px-2 py-1 bg-gray-400 text-white rounded">{severity}</span>;
    }
  };

  // 📅 Calendar Filter Template
  const dateFilterTemplate = (options) => {
    return (
      <Calendar
        value={options.value ? new Date(options.value) : null}
        onChange={(e) => options.filterCallback(e.value, options.index)}
        dateFormat="yy-mm-dd"
        placeholder="Select Date"
        className="w-full"
      />
    );
  };

  return (
    <PageLayout>
      <Toast ref={toast} />
      <div className="card p-5">
        {/* 🔍 Search Bar */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center mb-5">
          <h2 className="text-3xl font-bold text-primary">Data Insights</h2>
          <div className="flex gap-2 items-center w-full sm:w-auto">
            <InputText
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
              placeholder="Search reports..."
              className="w-full sm:w-72"
            />
            <Button
              icon="pi pi-filter-slash"
              rounded
              outlined
              aria-label="Filter"
              className="text-primary border border-primary"
              onClick={clearFilters}
              tooltip="Clear Filters"
              tooltipOptions={{ position: 'bottom' }}
            />
          </div>
        </div>

        {/* 📋 Data Table */}
        <DataTable
          value={reports}
          dataKey="_id"
          loading={loading}
          filters={filters}
          filterDisplay="menu"
          globalFilterFields={['serialNo', 'title', 'location', 'escalationDate', 'severity']}
          emptyMessage="No reports found."
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          className="p-datatable-sm min-w-[700px] custom-table"
        >
          <Column
            field="serialNo"
            header="Sr No."
            sortable
            bodyClassName="text-text text-md border border-gray-300 px-3 py-2"
            headerClassName="bg-[#336699] text-white text-lg font-semibold border border-gray-300 px-3 py-2"
          />
          <Column
            field="title"
            header="Report Title"
            sortable
            filter
            body={(row) => row.title}
            bodyClassName="text-text text-md border border-gray-300 px-3 py-2"
            headerClassName="bg-[#336699] text-white text-lg font-semibold border border-gray-300 px-3 py-2"
          />
          <Column
            field="location"
            header="Location"
            sortable
            filter
            body={(row) => row.location}
            bodyClassName="text-text text-md border border-gray-300 px-3 py-2"
            headerClassName="bg-[#336699] text-white text-lg font-semibold border border-gray-300 px-3 py-2"
          />
          <Column
            field="escalationDate"
            header="Escalation Date"
            sortable
            filter
            filterElement={dateFilterTemplate} 
            body={(row) => row.escalationDate}
			showFilterMenu={false}  
  			filterMatchMode="equals"
            bodyClassName="text-text text-md border border-gray-300 px-3 py-2"
            headerClassName="bg-[#336699] text-white text-lg font-semibold border border-gray-300 px-3 py-2"
          />
          <Column
            field="severity"
            header="Severity"
            sortable
            body={(row) => severityBadge(row.severity)}
            bodyClassName="text-text text-md border border-gray-300 px-3 py-2"
            headerClassName="bg-[#336699] text-white text-lg font-semibold border border-gray-300 px-3 py-2"
          />
        </DataTable>
      </div>

      {/* 🔥 Custom Table Styling for White Icons */}
      <style>{`
        .custom-table .p-sortable-column .p-sortable-column-icon,
        .custom-table .p-column-filter-menu-button,
        .custom-table .p-column-filter-clear-button {
          color: white !important;
        }
      `}</style>
    </PageLayout>
  );
};

export default DataInsights;
