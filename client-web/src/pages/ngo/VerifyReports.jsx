import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { CircleCheckBig, CircleX } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import { fetchGet, fetchPost } from '../../utils/fetch.utils'; // Import fetch utilities

export default function NGOReportsPage() {
	const [reports, setReports] = useState([]);
	const [selectedReport, setSelectedReport] = useState(null);
	const [visible, setVisible] = useState(false);
	const [severity, setSeverity] = useState(null);
	const toast = useRef(null);

	// Fetch reports on component mount
	useEffect(() => {
		const loadReports = async () => {
			const response = await fetchGet({ pathName: 'ngo' });
			if (response.success === false) {
				toast.current.show({
					severity: 'error',
					summary: 'Error',
					detail: response.message || 'Failed to fetch reports',
				});
				return;
			}
			setReports(response);
		};
		loadReports();
	}, []);

	const actionBodyTemplate = (rowData) => (
		<Button
			icon="pi pi-external-link"
			className="p-button-rounded"
			style={{ backgroundColor: '#336699', border: 'none' }}
			onClick={() => {
				setSelectedReport(rowData);
				setSeverity(rowData.severity || null);
				setVisible(true);
			}}
		/>
	);

	const aiVerifiedTemplate = (rowData) =>
		rowData.aiVerified ? (
			<CircleCheckBig size={20} color="#28a745" strokeWidth={2.5} />
		) : (
			<CircleX size={20} color="#dc3545" strokeWidth={2.5} />
		);

	const sendToGovt = async () => {
		const response = await fetchPost({
			pathName: 'ngo/send-to-government',
			body: JSON.stringify({
				reportId: selectedReport._id,
				severity,
			}),
		});

		if (response.success === false) {
			toast.current.show({
				severity: 'error',
				summary: 'Error',
				detail: response.message || 'Failed to send report to government',
			});
			return;
		}

		toast.current.show({
			severity: 'success',
			summary: 'Success',
			detail:
				response.message ||
				`Report "${selectedReport.title}" sent to Govt with severity "${severity}"`,
		});

		// Remove the verified report from the local state
		setReports((prevReports) =>
			prevReports.filter((report) => report._id !== selectedReport._id)
		);
		setVisible(false);
	};

	return (
		<PageLayout>
			<div className="p-6">
				<Toast ref={toast} />
				<h2 className="text-4xl font-semibold mb-4 text-[#336699]">Citizen Reports</h2>

				<DataTable
					value={reports}
					paginator
					rows={5}
					responsiveLayout="scroll"
					className="overflow-hidden shadow"
				>
					<Column
						field="title"
						header="Title"
						sortable
						headerStyle={{ backgroundColor: '#336699', color: 'white' }}
					/>
					<Column
						field="category"
						header="Category"
						sortable
						headerStyle={{ backgroundColor: '#336699', color: 'white' }}
					/>
					<Column
						field="status"
						header="Status"
						sortable
						headerStyle={{ backgroundColor: '#336699', color: 'white' }}
					/>
					<Column
						field="aiVerified"
						header="AI Verified"
						body={aiVerifiedTemplate}
						headerStyle={{ backgroundColor: '#336699', color: 'white' }}
						style={{ textAlign: 'center' }}
					/>
					<Column
						field="severity"
						header="Severity"
						headerStyle={{ backgroundColor: '#336699', color: 'white' }}
					/>
					<Column
						body={actionBodyTemplate}
						header="Action"
						style={{ textAlign: 'center', width: '8rem' }}
						headerStyle={{ backgroundColor: '#336699', color: 'white' }}
					/>
				</DataTable>

				<Dialog
					header={<span style={{ color: '#336699' }}>Report Details</span>}
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
								<b>Category:</b> {selectedReport.category}
							</p>
							<p>
								<b>Status:</b> {selectedReport.status}
							</p>
							<p>
								<b>Location:</b> {selectedReport.location?.address}
							</p>
							<div>
								<b>Select Severity:</b>
								<Dropdown
									value={severity}
									options={[
										{ label: 'Low', value: 'low' },
										{ label: 'Medium', value: 'medium' },
										{ label: 'High', value: 'high' },
									]}
									onChange={(e) => setSeverity(e.value)}
									placeholder="Choose severity"
									className="w-full mt-2"
								/>
							</div>
							<div className="flex justify-end mt-4">
								<Button
									label="Send to Govt"
									icon="pi pi-send"
									style={{
										backgroundColor: '#336699',
										border: 'none',
										color: 'white',
									}}
									onClick={sendToGovt}
								/>
							</div>
						</div>
					)}
				</Dialog>
			</div>
		</PageLayout>
	);
}
