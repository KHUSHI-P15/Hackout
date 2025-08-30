import React, { useEffect, useState } from 'react';
import PageLayout from '../../components/layout/PageLayout';

const ResolveReport = () => {
	const [reports, setReports] = useState([]);
	const [viewReport, setViewReport] = useState(null);
	const [resolveReport, setResolveReport] = useState(null);
	const [responseText, setResponseText] = useState('');
	const [responseFile, setResponseFile] = useState(null);

	useEffect(() => {
		setReports([
			{
				_id: 1,
				title: 'Mangrove Degradation at Riverbank',
				location: 'Gadhada',
				createdBy: { name: 'Green Earth NGO' },
				severity: 'High',
				description: 'Large area of mangrove trees cut down illegally.',
				media: ['https://via.placeholder.com/100'],
				resolved: false,
				escalationDate: '2025-09-05',
			},
			{
				_id: 2,
				title: 'Pollution Alert near Coastal Area',
				location: 'Bhavnagar',
				createdBy: { name: 'EcoWatch' },
				severity: 'Medium',
				description: 'Industrial waste found in nearby water body.',
				media: [],
				resolved: false,
				escalationDate: '2025-09-08',
			},
			{
				_id: 3,
				title: 'Illegal Dumping near Mangrove Area',
				location: 'Junagadh',
				createdBy: { name: 'NatureCare NGO' },
				severity: 'Low',
				description: 'Household waste dumped near mangrove trees.',
				media: [],
				resolved: false,
				escalationDate: '2025-09-10',
			},
		]);
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

	const handleResolveSubmit = (reportId) => {
		setReports((prev) => prev.filter((r) => r._id !== reportId));
		setResolveReport(null);
		setResponseText('');
		setResponseFile(null);
	};

	return (
		<PageLayout>
			<div className="min-h-screen bg-gray-50 p-6">
				<h1 className="text-3xl font-bold mb-6">Resolve Reports</h1>

				<div className="grid gap-6">
					{reports.map((report) => (
						<div
							key={report._id}
							className={`bg-white shadow rounded-lg p-6 border-l-4 ${
								report.severity === 'High'
									? 'border-red-600'
									: report.severity === 'Medium'
									? 'border-orange-500'
									: 'border-green-600'
							}`}
						>
							<div className="flex justify-between items-center mb-2">
								{/* Left: Title and Escalation Date */}
								<div>
									<h2 className="text-xl font-semibold">{report.title}</h2>
									<p className="text-sm text-gray-500">
										Escalation: {report.escalationDate}
									</p>
								</div>

								{/* Right: Severity Badge */}
								<span
									className={`px-2 py-1 rounded ${severityColor(
										report.severity
									)}`}
								>
									{report.severity}
								</span>
							</div>

							{/* Buttons below */}
							<div className="flex gap-2 mt-4">
								<button
									className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
									onClick={() => setViewReport(report)}
								>
									View Details
								</button>
								<button
									className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
									onClick={() => setResolveReport(report)}
								>
									Resolve
								</button>
							</div>
						</div>
					))}
				</div>

				{/* View Details Modal */}
				{viewReport && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
						<div className="bg-white rounded-lg p-6 w-11/12 md:w-2/3 max-h-[90vh] overflow-y-auto">
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-2xl font-bold">{viewReport.title}</h2>
								<button
									className="text-gray-500 hover:text-gray-700"
									onClick={() => setViewReport(null)}
								>
									Close
								</button>
							</div>
							<div className="grid gap-4">
								<div className="flex justify-between">
									<p className="font-semibold">Submitted by:</p>
									<p>{viewReport.createdBy?.name}</p>
								</div>
								<div className="flex justify-between">
									<p className="font-semibold">Location:</p>
									<p>{viewReport.location}</p>
								</div>
								<div className="flex justify-between">
									<p className="font-semibold">Severity:</p>
									<p>{viewReport.severity}</p>
								</div>
								<div className="flex justify-between">
									<p className="font-semibold">Escalation Date:</p>
									<p>{viewReport.escalationDate}</p>
								</div>
								<div>
									<p className="font-semibold">Description:</p>
									<p>{viewReport.description}</p>
								</div>
								{viewReport.media.length > 0 && (
									<div>
										<p className="font-semibold">Attachments:</p>
										<div className="flex gap-2 mt-1">
											{viewReport.media.map((file, idx) => (
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
							</div>
						</div>
					</div>
				)}

				{/* Resolve Modal */}
				{resolveReport && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
						<div className="bg-white rounded-lg p-6 w-11/12 md:w-2/3 max-h-[90vh] overflow-y-auto">
							<div className="flex justify-between items-center mb-4">
								<h2 className="text-2xl font-bold">{resolveReport.title}</h2>
								<button
									className="text-gray-500 hover:text-gray-700"
									onClick={() => setResolveReport(null)}
								>
									Close
								</button>
							</div>
							<div className="grid gap-4">
								<div className="flex justify-between">
									<p className="font-semibold">Submitted by:</p>
									<p>{resolveReport.createdBy?.name}</p>
								</div>
								<div className="flex justify-between">
									<p className="font-semibold">Location:</p>
									<p>{resolveReport.location}</p>
								</div>
								<div className="flex justify-between">
									<p className="font-semibold">Severity:</p>
									<p>{resolveReport.severity}</p>
								</div>
								<div className="flex justify-between">
									<p className="font-semibold">Escalation Date:</p>
									<p>{resolveReport.escalationDate}</p>
								</div>
								<div>
									<p className="font-semibold">Description:</p>
									<p>{resolveReport.description}</p>
								</div>
								{resolveReport.media.length > 0 && (
									<div>
										<p className="font-semibold">Attachments:</p>
										<div className="flex gap-2 mt-1">
											{resolveReport.media.map((file, idx) => (
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

								{/* Response Section */}
								<div className="mt-4">
									<textarea
										className="w-full border p-2 rounded mb-2"
										placeholder="Enter your response"
										value={responseText}
										onChange={(e) => setResponseText(e.target.value)}
									/>
									<input
										type="file"
										onChange={(e) => setResponseFile(e.target.files[0])}
										className="mb-2"
									/>
									<button
										className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
										onClick={() => handleResolveSubmit(resolveReport._id)}
									>
										Submit Response & Resolve
									</button>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</PageLayout>
	);
};

export default ResolveReport;
