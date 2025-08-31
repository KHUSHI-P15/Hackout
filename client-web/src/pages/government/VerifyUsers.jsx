import React, { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { fetchPost } from '../../utils/fetch.utils';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Avatar } from 'primereact/avatar';
import { Chip } from 'primereact/chip';
import { TabView, TabPanel } from 'primereact/tabview';
import { Dialog } from 'primereact/dialog';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';

export default function VerifyUsers() {
	const { showSuccess, showError } = useToast();
	const [pendingUsers, setPendingUsers] = useState([]);
	const [verifiedUsers, setVerifiedUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState(0);
	const [verifying, setVerifying] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);
	const [userDetailsVisible, setUserDetailsVisible] = useState(false);

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			setLoading(true);
			
			// Fetch pending verifications
			const pendingResponse = await fetchPost({
				pathName: 'government/pending-verifications',
				body: JSON.stringify({})
			});

			// Fetch verified users
			const verifiedResponse = await fetchPost({
				pathName: 'government/verified-users',
				body: JSON.stringify({})
			});

			if (pendingResponse.success) {
				setPendingUsers(pendingResponse.data || []);
			}

			if (verifiedResponse.success) {
				setVerifiedUsers(verifiedResponse.data || []);
			}
		} catch (error) {
			console.error('Fetch data error:', error);
			showError('Error', 'Failed to fetch user data');
		} finally {
			setLoading(false);
		}
	};

	const handleVerifyUser = async (userId, userName, userRole) => {
		confirmDialog({
			message: `Are you sure you want to verify ${userName} (${userRole.toUpperCase()})?`,
			header: 'Confirm Verification',
			icon: 'pi pi-question-circle',
			acceptClassName: 'p-button-success',
			accept: async () => {
				try {
					setVerifying(true);
					const response = await fetchPost({
						pathName: 'government/verify-user',
						body: JSON.stringify({ userId })
					});

					if (response.success) {
						showSuccess('Success', `${userName} has been verified and awarded 50 points!`);
						fetchData(); // Refresh data
					} else {
						showError('Error', response.message || 'Failed to verify user');
					}
				} catch (error) {
					console.error('Verify user error:', error);
					showError('Error', 'Something went wrong while verifying user');
				} finally {
					setVerifying(false);
				}
			}
		});
	};

	const nameBodyTemplate = (rowData) => {
		return (
			<div className="flex items-center">
				<Avatar 
					label={rowData.name.charAt(0)} 
					className="mr-3 bg-blue-500 text-white"
					size="large"
					shape="circle"
				/>
				<div>
					<div className="font-semibold text-gray-800">{rowData.name}</div>
					<div className="text-sm text-gray-600">{rowData.email}</div>
				</div>
			</div>
		);
	};

	const roleBodyTemplate = (rowData) => {
		const roleColors = {
			citizen: 'bg-blue-100 text-blue-800',
			ngo: 'bg-green-100 text-green-800',
			government: 'bg-purple-100 text-purple-800'
		};

		return (
			<Chip 
				label={rowData.role.toUpperCase()} 
				className={roleColors[rowData.role] || 'bg-gray-100 text-gray-800'} 
			/>
		);
	};

	const joinDateBodyTemplate = (rowData) => {
		return new Date(rowData.createdAt).toLocaleDateString();
	};

	const verificationActionBodyTemplate = (rowData) => {
		return (
			<div className="flex gap-2">
				<Button
					label="Verify"
					icon="pi pi-check"
					className="p-button-success p-button-sm"
					onClick={() => handleVerifyUser(rowData._id, rowData.name, rowData.role)}
					disabled={verifying}
				/>
				<Button
					label="Details"
					icon="pi pi-eye"
					className="p-button-info p-button-sm"
					onClick={() => {
						setSelectedUser(rowData);
						setUserDetailsVisible(true);
					}}
				/>
			</div>
		);
	};

	const verifiedStatusBodyTemplate = (rowData) => {
		return (
			<Badge 
				value="Verified" 
				severity="success" 
				className="flex items-center"
			/>
		);
	};

	const getStats = () => {
		const totalPending = pendingUsers.length;
		const totalVerified = verifiedUsers.length;
		const pendingCitizens = pendingUsers.filter(u => u.role === 'citizen').length;
		const pendingNGOs = pendingUsers.filter(u => u.role === 'ngo').length;

		return { totalPending, totalVerified, pendingCitizens, pendingNGOs };
	};

	const stats = getStats();

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 pt-20 px-4">
				<div className="max-w-6xl mx-auto">
					<div className="flex justify-center items-center h-64">
						<div className="text-xl">Loading verification data...</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 pt-20 px-4">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-gray-800 mb-2">🛡️ User Verification</h1>
					<p className="text-gray-600">Verify citizens and NGOs to award them 50 points</p>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
					<Card className="text-center">
						<div className="text-3xl font-bold text-orange-600">{stats.totalPending}</div>
						<div className="text-sm text-gray-600 mt-1">Pending Verification</div>
					</Card>
					<Card className="text-center">
						<div className="text-3xl font-bold text-green-600">{stats.totalVerified}</div>
						<div className="text-sm text-gray-600 mt-1">Verified Users</div>
					</Card>
					<Card className="text-center">
						<div className="text-3xl font-bold text-blue-600">{stats.pendingCitizens}</div>
						<div className="text-sm text-gray-600 mt-1">Pending Citizens</div>
					</Card>
					<Card className="text-center">
						<div className="text-3xl font-bold text-purple-600">{stats.pendingNGOs}</div>
						<div className="text-sm text-gray-600 mt-1">Pending NGOs</div>
					</Card>
				</div>

				{/* Verification Tables */}
				<Card>
					<div className="mb-4">
						<Button 
							label="Refresh Data" 
							icon="pi pi-refresh" 
							onClick={fetchData}
							className="mb-4"
						/>
					</div>

					<TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
						<TabPanel header={`Pending Verification (${stats.totalPending})`}>
							<DataTable 
								value={pendingUsers} 
								paginator 
								rows={10} 
								dataKey="_id"
								emptyMessage="No pending verifications"
								className="p-datatable-sm"
							>
								<Column 
									header="User" 
									body={nameBodyTemplate} 
									style={{ minWidth: '200px' }}
								/>
								<Column 
									header="Role" 
									body={roleBodyTemplate} 
									style={{ width: '120px' }}
								/>
								<Column 
									header="Phone" 
									field="phone" 
									style={{ width: '140px' }}
								/>
								<Column 
									header="Join Date" 
									body={joinDateBodyTemplate} 
									style={{ width: '120px' }}
								/>
								<Column 
									header="Actions" 
									body={verificationActionBodyTemplate} 
									style={{ width: '160px' }}
								/>
							</DataTable>
						</TabPanel>

						<TabPanel header={`Verified Users (${stats.totalVerified})`}>
							<DataTable 
								value={verifiedUsers} 
								paginator 
								rows={10} 
								dataKey="_id"
								emptyMessage="No verified users"
								className="p-datatable-sm"
							>
								<Column 
									header="User" 
									body={nameBodyTemplate} 
									style={{ minWidth: '200px' }}
								/>
								<Column 
									header="Role" 
									body={roleBodyTemplate} 
									style={{ width: '120px' }}
								/>
								<Column 
									header="Phone" 
									field="phone" 
									style={{ width: '140px' }}
								/>
								<Column 
									header="Verified Date" 
									body={joinDateBodyTemplate} 
									style={{ width: '120px' }}
								/>
								<Column 
									header="Status" 
									body={verifiedStatusBodyTemplate} 
									style={{ width: '120px' }}
								/>
							</DataTable>
						</TabPanel>
					</TabView>
				</Card>

				{/* User Details Dialog */}
				<Dialog
					header="User Details"
					visible={userDetailsVisible}
					onHide={() => setUserDetailsVisible(false)}
					style={{ width: '500px' }}
				>
					{selectedUser && (
						<div className="space-y-4">
							<div className="text-center">
								<Avatar 
									label={selectedUser.name.charAt(0)} 
									className="mb-4 bg-blue-500 text-white"
									size="xlarge"
									shape="circle"
								/>
								<h3 className="text-xl font-bold">{selectedUser.name}</h3>
								<Chip 
									label={selectedUser.role.toUpperCase()} 
									className="mt-2"
								/>
							</div>
							
							<div className="space-y-3">
								<div>
									<label className="text-sm font-semibold text-gray-600">Email</label>
									<p className="text-gray-800">{selectedUser.email}</p>
								</div>
								<div>
									<label className="text-sm font-semibold text-gray-600">Phone</label>
									<p className="text-gray-800">{selectedUser.phone || 'Not provided'}</p>
								</div>
								<div>
									<label className="text-sm font-semibold text-gray-600">Join Date</label>
									<p className="text-gray-800">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
								</div>
								<div>
									<label className="text-sm font-semibold text-gray-600">Verification Status</label>
									<p className="text-gray-800">
										{selectedUser.isVerified ? (
											<Badge value="Verified" severity="success" />
										) : (
											<Badge value="Pending" severity="warning" />
										)}
									</p>
								</div>
							</div>

							{!selectedUser.isVerified && (
								<div className="text-center pt-4">
									<Button
										label="Verify User"
										icon="pi pi-check"
										className="p-button-success"
										onClick={() => {
											setUserDetailsVisible(false);
											handleVerifyUser(selectedUser._id, selectedUser.name, selectedUser.role);
										}}
									/>
								</div>
							)}
						</div>
					)}
				</Dialog>

				<ConfirmDialog />
			</div>
		</div>
	);
}
