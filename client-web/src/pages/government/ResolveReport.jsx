import React, { useState, useEffect, useRef } from 'react';
import PageLayout from '../../components/layout/PageLayout';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Calendar } from 'primereact/calendar';
import { FilterMatchMode } from 'primereact/api';
import { Dialog } from 'primereact/dialog';
import { fetchGet } from '../../utils/fetch.utils';

export default function ResolveReport() {
	const [reports, setReports] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filters, setFilters] = useState({
		global: { value: null, matchMode: FilterMatchMode.CONTAINS },
		title: { value: null, matchMode: FilterMatchMode.CONTAINS },
		location: { value: null, matchMode: FilterMatchMode.CONTAINS },
		severity: { value: null, matchMode: FilterMatchMode.EQUALS },
		escalationDate: { value: null, matchMode: FilterMatchMode.DATE_IS },
	});
	const [globalFilterValue, setGlobalFilterValue] = useState('');
	const [selectedReport, setSelectedReport] = useState(null);
	const [visible, setVisible] = useState(false);
	const [responseText, setResponseText] = useState('');
	const [responseFile, setResponseFile] = useState(null);
	const toast = useRef(null);
	const govUserId = '68b26297ff38bbe3daac6805';

	useEffect(() => {
		const loadReports = async () => {
			const response = await fetchGet({ pathName: 'government' });
			if (response.success === false) {
				toast.current.show({
					severity: 'error',
					summary: 'Error',
					detail: response.message || 'Failed to fetch reports',
				});
				setLoading(false);
				return;
			}
			setReports(response);
			setLoading(false);
		};
		loadReports();
	}, []);

	// Severity badge
	const severityBadge = (severity) => {
		switch (severity?.toLowerCase()) {
			case 'high':
				return <span className="px-2 py-1 bg-red-600 text-white rounded">{severity}</span>;
			case 'medium':
				return (
					<span className="px-2 py-1 bg-orange-500 text-white rounded">{severity}</span>
				);
			case 'low':
				return (
					<span className="px-2 py-1 bg-green-600 text-white rounded">{severity}</span>
				);
			default:
				return <span className="px-2 py-1 bg-gray-400 text-white rounded">{severity}</span>;
		}
	};

	// Date filter template
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

	// Global filter change
	const onGlobalFilterChange = (e) => {
		const value = e.target.value;
		let _filters = { ...filters };
		_filters['global'].value = value;
		setFilters(_filters);
		setGlobalFilterValue(value);
	};

	const clearFilters = () => {
		setFilters({
			global: { value: null, matchMode: FilterMatchMode.CONTAINS },
			title: { value: null, matchMode: FilterMatchMode.CONTAINS },
			location: { value: null, matchMode: FilterMatchMode.CONTAINS },
			severity: { value: null, matchMode: FilterMatchMode.EQUALS },
			escalationDate: { value: null, matchMode: FilterMatchMode.DATE_IS },
		});
		setGlobalFilterValue('');
	};

	// Action button for dialog
	const actionBodyTemplate = (rowData) => (
		<Button
			icon="pi pi-external-link"
			className="p-button-rounded"
			style={{ backgroundColor: '#336699', border: 'none' }}
			onClick={() => {
				setSelectedReport(rowData);
				setResponseText('');
				setResponseFile(null);
				setVisible(true);
			}}
		/>
	);

	// Handle resolve submit
	const handleResolveSubmit = async () => {
		if (!responseText || responseText.trim() === '') {
			toast.current.show({
				severity: 'error',
				summary: 'Error',
				detail: 'Response text cannot be empty',
			});
			return;
		}

		try {
			const formData = new FormData();
			formData.append('responseText', responseText);
			if (responseFile) formData.append('responseFile', responseFile);
			formData.append('resolvedBy', govUserId);
			formData.append('status', 'resolved');

			const token = localStorage.getItem('token');
			const apiURL = import.meta.env.VITE_URL;

			const response = await fetch(`${apiURL}government/${selectedReport._id}/resolve`, {
				method: 'POST',
				headers: { ...(token && { Authorization: 'Bearer ' + token }) },
				body: formData,
			});
			const result = await response.json();

			if (result.success === false) {
				toast.current.show({
					severity: 'error',
					summary: 'Error',
					detail: result.message || 'Failed to resolve report',
				});
				return;
			}

			toast.current.show({
				severity: 'success',
				summary: 'Success',
				detail: `Report "${selectedReport.title}" resolved successfully`,
			});
			setReports((prev) => prev.filter((r) => r._id !== selectedReport._id));
			setVisible(false);
			setResponseText('');
			setResponseFile(null);
		} catch (error) {
			console.error('Error resolving report:', error);
			toast.current.show({
				severity: 'error',
				summary: 'Error',
				detail: 'Failed to resolve report: ' + error.message,
			});
		}
	};

	return (
		<PageLayout>
			<Toast ref={toast} />
			<div className="p-6 card">
				<div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center mb-5">
					<h2 className="text-3xl font-bold text-[#336699]">Resolve Reports</h2>
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
							className="text-primary border border-primary"
							onClick={clearFilters}
							tooltip="Clear Filters"
							tooltipOptions={{ position: 'bottom' }}
						/>
					</div>
				</div>

				<DataTable
					value={reports}
					loading={loading}
					dataKey="_id"
					filters={filters}
					filterDisplay="menu"
					globalFilterFields={[
						'title',
						'location.address',
						'severity',
						'createdBy.name',
						'escalationDate',
					]}
					paginator
					rows={10}
					rowsPerPageOptions={[5, 10, 25, 50]}
					className="p-datatable-sm min-w-[700px] 	" // added table border
				>
					<Column
						field="title"
						header="Title"
						sortable
						filter
						headerClassName="bg-[#336699] text-white px-3 py-2 border border-gray-300"
						bodyClassName="px-3 py-2 border border-gray-300"
					/>
					<Column
						field="location.address"
						header="Location"
						sortable
						filter
						headerClassName="bg-[#336699] text-white px-3 py-2 border border-gray-300"
						bodyClassName="px-3 py-2 border border-gray-300"
					/>
					<Column
						field="createdBy.name"
						header="Submitted By"
						sortable
						filter
						body={(row) => row.createdBy?.name || 'Unknown'}
						headerClassName="bg-[#336699] text-white px-3 py-2 border border-gray-300"
						bodyClassName="px-3 py-2 border border-gray-300"
					/>
					<Column
						field="severity"
						header="Severity"
						sortable
						filter
						body={(row) => severityBadge(row.severity)}
						headerClassName="bg-[#336699] text-white px-3 py-2 border border-gray-300"
						bodyClassName="px-3 py-2 border border-gray-300"
					/>
					<Column
						field="escalationDate"
						header="Escalation Date"
						sortable
						filter
						filterElement={dateFilterTemplate}
						body={(row) => row.escalationDate}
						headerClassName="bg-[#336699] text-white px-3 py-2 border border-gray-300"
						bodyClassName="px-3 py-2 border border-gray-300"
					/>
					<Column
						body={actionBodyTemplate}
						header="Action"
						style={{ textAlign: 'center', width: '8rem' }}
						headerClassName="bg-[#336699] text-white px-3 py-2 border border-gray-300"
						bodyClassName="px-3 py-2 border border-gray-300 text-center"
					/>
				</DataTable>

				{/* Resolve Dialog */}
				<Dialog
					header={<span style={{ color: '#336699' }}>Resolve Report</span>}
					visible={visible}
					style={{ width: '50vw' }}
					onHide={() => setVisible(false)}
				>
					{selectedReport && (
						<div className="space-y-3">
							<p>
								<b>Title:</b> {selectedReport.title}
							</p>
							<p>
								<b>Description:</b> {selectedReport.description}
							</p>
							<p>
								<b>Location:</b> {selectedReport.location?.address}
							</p>
							<p>
								<b>Submitted By:</b> {selectedReport.createdBy?.name || 'Unknown'}
							</p>
							<p>
								<b>Severity:</b> {selectedReport.severity}
							</p>
							<p>
								<b>Escalation Date:</b> {selectedReport.escalationDate}
							</p>
							<div>
								<b>Response:</b>
								<textarea
									className="w-full border p-2 rounded mt-2"
									placeholder="Enter your response"
									value={responseText}
									onChange={(e) => setResponseText(e.target.value)}
								/>
							</div>
							<div>
								<b>Upload File:</b>
								<input
									type="file"
									onChange={(e) => setResponseFile(e.target.files[0])}
								/>
							</div>
							<div className="flex justify-end">
								<Button
									label="Submit Response & Resolve"
									icon="pi pi-check"
									style={{
										backgroundColor: '#336699',
										border: 'none',
										color: 'white',
									}}
									onClick={handleResolveSubmit}
								/>
							</div>
						</div>
					)}
				</Dialog>
			</div>
			<style>
				{`
			.p-datatable .p-sortable-column .p-sortable-column-icon {
    		color: white !important;
			}

			.p-datatable .p-column-filter-menu-button,
			.p-datatable .p-column-filter-clear-button {
    		color: white !important;
			}`}
			</style>
		</PageLayout>
	);
}
