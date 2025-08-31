import React, { useState, useEffect, useCallback } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Badge } from 'primereact/badge';
import { Avatar } from 'primereact/avatar';
import { Chip } from 'primereact/chip';
import { Button } from 'primereact/button';
import PageLayout from '../components/layout/PageLayout';

export default function Leaderboard() {
	const [leaderboard, setLeaderboard] = useState([]);
	const [loading, setLoading] = useState(true);

	const fetchLeaderboardData = useCallback(async () => {
		try {
			setLoading(true);

			// Fetch unified leaderboard (public endpoint - no auth required)
			const apiUrl = `${import.meta.env.VITE_URL}community/leaderboard`;
			const response = await fetch(apiUrl);
			const result = await response.json();

			if (result.success) {
				setLeaderboard(result.data || []);
			} else {
				console.error('Failed to fetch leaderboard:', result);
			}
		} catch (error) {
			console.error('Leaderboard fetch error:', error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchLeaderboardData();
	}, [fetchLeaderboardData]);

	const rankBodyTemplate = (rowData, { rowIndex }) => {
		const rank = rowIndex + 1;
		let badgeStyle = {};

		if (rank === 1) {
			badgeStyle = { backgroundColor: '#FFD700', color: '#000' }; // Gold
		} else if (rank === 2) {
			badgeStyle = { backgroundColor: '#C0C0C0', color: '#000' }; // Silver
		} else if (rank === 3) {
			badgeStyle = { backgroundColor: '#CD7F32', color: '#fff' }; // Bronze
		} else {
			badgeStyle = { backgroundColor: '#6366f1', color: '#fff' }; // Default
		}

		return (
			<div className="flex items-center">
				{/* {rank <= 3 && (
					<span className="mr-2 text-2xl">
						{rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
					</span>
				)} */}
				<Badge value={rank} style={badgeStyle} className="font-bold text-lg" />
			</div>
		);
	};

	const nameBodyTemplate = (rowData) => {
		return (
			<div className="flex items-center">
				<Avatar
					label={rowData.name.charAt(0)}
					className={`mr-3 text-white ${
						rowData.role === 'citizen'
							? 'bg-blue-500'
							: rowData.role === 'ngo'
							? 'bg-green-500'
							: 'bg-purple-500'
					}`}
					size="large"
					shape="circle"
				/>
				<div>
					<div className="font-semibold text-gray-800 text-lg">{rowData.name}</div>
					<div className="text-sm text-gray-600">{rowData.email}</div>
				</div>
			</div>
		);
	};

	const roleBodyTemplate = (rowData) => {
		const roleConfig = {
			citizen: { label: 'Citizen', color: 'bg-blue-100 text-blue-800' },
			ngo: { label: 'NGO', color: 'bg-green-100 text-green-800' },
			government: { label: 'Government', color: 'bg-purple-100 text-purple-800' },
			researcher: { label: 'Researcher', color: 'bg-orange-100 text-orange-800' },
		};

		const config = roleConfig[rowData.role] || {
			label: 'User',
			color: 'bg-gray-100 text-gray-800',
		};

		return <Chip label={config.label} className={`${config.color} font-semibold`} />;
	};

	const pointsBodyTemplate = (rowData) => {
		return (
			<div className="text-center">
				<div className="text-2xl font-bold text-blue-600">{rowData.totalPoints || 0}</div>
				<div className="text-xs text-gray-500">points</div>
			</div>
		);
	};

	const verificationBodyTemplate = (rowData) => {
		return rowData.isVerified ? (
			<Chip label="Verified" className="bg-green-100 text-green-800" icon="pi pi-check" />
		) : (
			<Chip label="Unverified" className="bg-gray-100 text-gray-800" />
		);
	};

	const statsBodyTemplate = (rowData) => {
		return (
			<div className="text-center">
				<div className="text-sm">
					<span className="font-semibold">{rowData.reportsCount || 0}</span> reports
				</div>
				<div className="text-xs text-gray-500">{rowData.verifiedReports || 0} verified</div>
			</div>
		);
	};

	const levelBodyTemplate = (rowData) => {
		const points = rowData.totalPoints || 0;
		let level = 'Newcomer';
		let color = 'bg-gray-100 text-gray-800';

		if (points >= 2000) {
			level = 'Legend';
			color = 'bg-purple-100 text-purple-800';
		} else if (points >= 1000) {
			level = 'Expert';
			color = 'bg-red-100 text-red-800';
		} else if (points >= 500) {
			level = 'Advanced';
			color = 'bg-orange-100 text-orange-800';
		} else if (points >= 250) {
			level = 'Intermediate';
			color = 'bg-yellow-100 text-yellow-800';
		} else if (points >= 100) {
			level = 'Beginner';
			color = 'bg-green-100 text-green-800';
		}

		return <Chip label={level} className={`${color} font-semibold`} />;
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 pt-20 px-4">
				<div className="max-w-6xl mx-auto">
					<div className="flex justify-center items-center h-64">
						<div className="text-xl">Loading leaderboard...</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<PageLayout>
			<div className="min-h-screen bg-gray-50 pt-20 px-4">
				<div className="max-w-6xl mx-auto">
					{/* Header */}
					<div className="mb-8 text-center">
						<h1 className="text-4xl font-bold text-gray-800 mb-2">
							🏆 Global Leaderboard
						</h1>
						<p className="text-gray-600">
							Top 10 Conservation Champions Across All Roles
						</p>
						<p className="text-sm text-gray-500 mt-2">
							Earn 50 points for each report submission and another 50 points when
							verified!
						</p>
					</div>

			
					{/* Full Leaderboard Table */}
					<Card>
						<div className="mb-4 flex justify-between items-center">
							<h3 className="text-2xl font-bold text-gray-800">Complete Rankings</h3>
							<Button
								label="Refresh"
								icon="pi pi-refresh"
								onClick={fetchLeaderboardData}
								className="p-button-outlined"
							/>
						</div>
						<DataTable
							value={leaderboard}
							dataKey="_id"
							emptyMessage="No users found"
							className="p-datatable-sm"
							showGridlines
						>
							<Column
								header="Rank"
								body={rankBodyTemplate}
								style={{ width: '100px' }}
							/>
							<Column
								header="User"
								body={nameBodyTemplate}
								style={{ minWidth: '250px' }}
							/>
							<Column
								header="Role"
								body={roleBodyTemplate}
								style={{ width: '120px' }}
							/>
							<Column
								header="Points"
								body={pointsBodyTemplate}
								style={{ width: '120px' }}
								sortable
								field="totalPoints"
							/>
							<Column
								header="Level"
								body={levelBodyTemplate}
								style={{ width: '140px' }}
							/>
							<Column
								header="Activity"
								body={statsBodyTemplate}
								style={{ width: '120px' }}
							/>
							<Column
								header="Status"
								body={verificationBodyTemplate}
								style={{ width: '120px' }}
							/>
						</DataTable>
					</Card>
				</div>
			</div>
		</PageLayout>
	);
}
