import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import PageLayout from '../../components/layout/PageLayout';
import { fetchGet } from '../../utils/fetch.utils';

export default function ResolveReport() {
	const [reports, setReports] = useState([]);
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
				return;
			}
			setReports(response);
		};
		loadReports();
	}, []);

	const severityColor = (severity) => {
		switch (severity.toLowerCase()) {
			case 'high':
				return 'bg-red-600 text-white';
			case 'medium':
				return 'bg-orange-500 text-white';
			case 'low':
				return 'bg-green-600 text-white';
			default:
				return 'bg-gray-400 text-white';
		}
	};

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

			console.log('FormData contents:');
			for (let [key, value] of formData.entries()) {
				console.log(`${key}:`, value);
			}

			// Direct fetch call without utility to avoid any caching issues
			const token = localStorage.getItem('token');
			const apiURL = import.meta.env.VITE_URL;
			
			const response = await fetch(`${apiURL}government/${selectedReport._id}/resolve`, {
				method: 'POST',
				headers: {
					...(token && { Authorization: 'Bearer ' + token }),
					// Deliberately NOT setting Content-Type to let browser handle FormData
				},
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

	const severityTemplate = (rowData) => (
		<span className={`px-2 py-1 rounded ${severityColor(rowData.severity)}`}>
			{rowData.severity}
		</span>
	);

	return (
		<PageLayout>
			<div className="p-6">
				<Toast ref={toast} />
				<h2 className="text-4xl font-semibold mb-4 text-[#336699]">
					Resolve Verified Reports
				</h2>

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
						field="location.address"
						header="Location"
						sortable
						headerStyle={{ backgroundColor: '#336699', color: 'white' }}
					/>
					<Column
						field="createdBy.name"
						header="Submitted By"
						sortable
						headerStyle={{ backgroundColor: '#336699', color: 'white' }}
						body={(rowData) => rowData.createdBy?.name || 'Unknown'}
					/>
					<Column
						field="severity"
						header="Severity"
						sortable
						headerStyle={{ backgroundColor: '#336699', color: 'white' }}
						body={severityTemplate}
					/>
					<Column
						field="escalationDate"
						header="Escalation Date"
						sortable
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
							{Array.isArray(selectedReport.media) && selectedReport.media.length > 0 && (
								<div>
									<b>Attachments:</b>
									<div className="flex gap-2">
										{selectedReport.media.map((file, idx) => (
											<a
												key={idx}
												href={file}
												target="_blank"
												rel="noopener noreferrer"
												className="text-blue-500 underline text-sm"
											>
												Attachment {idx + 1}
											</a>
										))}
									</div>
								</div>
							)}
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
		</PageLayout>
	);
}
