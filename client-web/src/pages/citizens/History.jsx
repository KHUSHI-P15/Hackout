import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import PageLayout from '../../components/layout/PageLayout';
import { CircleCheckBig, CircleX } from 'lucide-react';
import { fetchGet } from '../../utils/fetch.utils'; // 👈 your existing utils

export default function CitizenReportsPage() {
	const [reports, setReports] = useState([]);
	const [selectedReport, setSelectedReport] = useState(null);

	// Fetch reports from backend
	useEffect(() => {
		const loadReports = async () => {
			const res = await fetchGet({ pathName: 'citizen/my' });
			if (res?.success) {
				setReports(res.data);
			} else {
				console.error('Failed to load reports:', res?.message);
			}
		};
		loadReports();
	}, []);

	const severityTag = (rowData) => {
		const color =
			rowData.severity === 'high'
				? 'danger'
				: rowData.severity === 'medium'
				? 'warn'
				: 'success';
		return <Tag value={rowData.severity} severity={color}></Tag>;
	};

	const statusTag = (rowData) => {
		const colors = {
			pending: 'warn',
			verified: 'info',
			resolved: 'success',
		};
		return <Tag value={rowData.status} severity={colors[rowData.status]}></Tag>;
	};

	const aiVerifiedTemplate = (rowData) =>
		rowData.aiVerified ? (
			<CircleCheckBig size={20} color="#28a745" strokeWidth={2.5} />
		) : (
			<CircleX size={20} color="#dc3545" strokeWidth={2.5} />
		);

	return (
		<PageLayout>
			<div className="p-6">
				<h2 className="text-4xl font-semibold mb-4 text-[#336699] mt-20">
					My Report History
				</h2>

				<DataTable
					value={reports}
					paginator
					rows={5}
					dataKey="_id"
					className="overflow-hidden shadow"
					responsiveLayout="scroll"
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
						header="Severity"
						body={severityTag}
						headerStyle={{ backgroundColor: '#336699', color: 'white' }}
					/>
					<Column
						header="Status"
						body={statusTag}
						headerStyle={{ backgroundColor: '#336699', color: 'white' }}
					/>
					<Column
						header="AI Verified"
						body={aiVerifiedTemplate}
						headerStyle={{ backgroundColor: '#336699', color: 'white' }}
						style={{ textAlign: 'center' }}
					/>
					<Column
						field="createdAt"
						header="Filed On"
						body={(rowData) => new Date(rowData.createdAt).toLocaleString()}
						headerStyle={{ backgroundColor: '#336699', color: 'white' }}
					/>
					<Column
						header="Action"
						body={(rowData) => (
							<Button
								icon="pi pi-external-link"
								className="p-button-rounded p-button-info"
								onClick={() => setSelectedReport(rowData)}
								tooltip="View Details"
							/>
						)}
						headerStyle={{
							backgroundColor: '#336699',
							color: 'white',
							textAlign: 'center',
						}}
						style={{ textAlign: 'center', width: '120px' }}
					/>
				</DataTable>

				{/* Modal */}
				<Dialog
					header={<span style={{ color: '#336699' }}>Report Details</span>}
					visible={!!selectedReport}
					style={{ width: '50vw' }}
					modal
					onHide={() => setSelectedReport(null)}
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
								<b>Location:</b> {selectedReport.location?.address}
							</p>
							<p>
								<b>Severity:</b> {selectedReport.severity}
							</p>
							<p>
								<b>Status:</b> {selectedReport.status}
							</p>
							<div className="flex items-center gap-2">
								<b>AI Verified:</b>
								{selectedReport.aiVerified ? (
									<CircleCheckBig size={20} color="#28a745" strokeWidth={2.5} />
								) : (
									<CircleX size={20} color="#dc3545" strokeWidth={2.5} />
								)}
							</div>

							{selectedReport.media?.length > 0 && (
								<div>
									<b>Attached Media:</b>
									<div className="flex gap-2 mt-2 flex-wrap">
										{selectedReport.media.map((m, idx) => (
											<img
												key={idx}
												src={m}
												alt="media"
												className="w-32 h-32 object-cover rounded shadow"
											/>
										))}
									</div>
								</div>
							)}

							<Divider />

							<div>
								<h4 className="text-lg font-semibold text-[#336699] mb-2">
									Government Replies
								</h4>
								{selectedReport.govReplies?.length === 0 ? (
									<p className="text-gray-500">No replies yet.</p>
								) : (
									selectedReport.govReplies.map((reply, idx) => (
										<div
											key={idx}
											className="p-3 border rounded mb-2 bg-gray-50"
										>
											<p>{reply.text}</p>
											{reply.attachments?.length > 0 && (
												<div className="mt-2">
													{reply.attachments.map((a, i) => (
														<a
															key={i}
															href={a}
															download
															className="text-blue-600 underline"
														>
															Download Attachment {i + 1}
														</a>
													))}
												</div>
											)}
											<div className="text-xs text-gray-500 mt-1">
												Replied on{' '}
												{new Date(reply.repliedAt).toLocaleString()}
											</div>
										</div>
									))
								)}
							</div>
						</div>
					)}
				</Dialog>
			</div>
		</PageLayout>
	);
}
