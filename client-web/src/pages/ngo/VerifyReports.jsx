import React, { useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { CircleCheckBig, CircleX } from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';

export default function NGOReportsPage() {
	const [reports] = useState([
		{
			_id: '1',
			title: 'Illegal Tree Cutting',
			description: 'Several trees were cut down illegally near the park.',
			category: 'cutting',
			status: 'pending',
			aiVerified: true,
			severity: 'low',
			location: { address: 'Park Road, Green City' },
			media: ['https://via.placeholder.com/150'],
		},
		{
			_id: '2',
			title: 'River Pollution',
			description: 'Toxic waste being dumped into the river.',
			category: 'pollution',
			status: 'verified',
			aiVerified: false,
			severity: 'medium',
			location: { address: 'Riverfront, Blue Town' },
			media: ['https://via.placeholder.com/140'],
		},
	]);

	const [selectedReport, setSelectedReport] = useState(null);
	const [visible, setVisible] = useState(false);
	const [severity, setSeverity] = useState(null);
	const toast = useRef(null);

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

	const sendToGovt = () => {
		toast.current.show({
			severity: 'success',
			summary: 'Success',
			detail: `Report "${selectedReport.title}" sent to Govt with severity "${severity}"`,
		});
		setVisible(false);
	};

	return (
		<PageLayout>
			<div className="p-6">
				<Toast ref={toast} />
				<h2 className="text-4xl font-semibold mb-4 text-[#336699]" >
					Citizen Reports
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

				{/* Modal */}
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
