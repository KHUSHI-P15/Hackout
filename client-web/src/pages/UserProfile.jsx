import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { fetchPost } from '../utils/fetch.utils';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { Divider } from 'primereact/divider';
import { ProgressBar } from 'primereact/progressbar';
import { Avatar } from 'primereact/avatar';
import { Chip } from 'primereact/chip';

export default function UserProfile() {
	const { user, userId, role } = useAuth();
	const { showError } = useToast();
	const [profileData, setProfileData] = useState(null);
	const [stats, setStats] = useState({});
	const [loading, setLoading] = useState(true);
	const [achievements, setAchievements] = useState([]);

	const fetchProfileData = useCallback(async () => {
		try {
			setLoading(true);
			const response = await fetchPost({
				pathName: `${role}/profile`,
				body: JSON.stringify({ userId })
			});

			if (response.success) {
				setProfileData(response.data.user);
				setStats(response.data.stats);
				generateAchievements(response.data.stats);
			} else {
				showError('Error', 'Failed to fetch profile data');
			}
		} catch (error) {
			console.error('Profile fetch error:', error);
			showError('Error', 'Something went wrong while fetching profile');
		} finally {
			setLoading(false);
		}
	}, [userId, role, showError]);

	useEffect(() => {
		if (userId && role) {
			fetchProfileData();
		}
	}, [userId, role, fetchProfileData]);

	const generateAchievements = (userStats) => {
		const achievements = [];
		
		if (userStats.points >= 100) {
			achievements.push({ 
				name: 'Century Club', 
				description: 'Earned 100+ points', 
				icon: '🎯',
				color: 'bg-yellow-100 text-yellow-800'
			});
		}
		
		if (userStats.points >= 500) {
			achievements.push({ 
				name: 'Conservation Hero', 
				description: 'Earned 500+ points', 
				icon: '🌟',
				color: 'bg-blue-100 text-blue-800'
			});
		}

		if (role === 'citizen' && userStats.reportsSubmitted >= 10) {
			achievements.push({ 
				name: 'Active Reporter', 
				description: 'Submitted 10+ reports', 
				icon: '📋',
				color: 'bg-green-100 text-green-800'
			});
		}

		if (role === 'ngo' && userStats.reportsVerified >= 5) {
			achievements.push({ 
				name: 'Verification Expert', 
				description: 'Verified 5+ reports', 
				icon: '✅',
				color: 'bg-purple-100 text-purple-800'
			});
		}

		if (userStats.isVerified) {
			achievements.push({ 
				name: 'Verified Account', 
				description: 'Government verified', 
				icon: '🛡️',
				color: 'bg-indigo-100 text-indigo-800'
			});
		}

		setAchievements(achievements);
	};

	const getNextLevelPoints = (currentPoints) => {
		const levels = [0, 100, 250, 500, 1000, 2000];
		for (let level of levels) {
			if (currentPoints < level) return level;
		}
		return levels[levels.length - 1];
	};

	const getCurrentLevel = (points) => {
		if (points >= 2000) return 'Legend';
		if (points >= 1000) return 'Expert';
		if (points >= 500) return 'Advanced';
		if (points >= 250) return 'Intermediate';
		if (points >= 100) return 'Beginner';
		return 'Newcomer';
	};

	const getRoleSpecificStats = () => {
		if (role === 'citizen') {
			return (
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div className="text-center p-4 bg-blue-50 rounded-lg">
						<div className="text-2xl font-bold text-blue-600">{stats.reportsSubmitted || 0}</div>
						<div className="text-sm text-gray-600">Reports Submitted</div>
					</div>
					<div className="text-center p-4 bg-green-50 rounded-lg">
						<div className="text-2xl font-bold text-green-600">{stats.reportsVerified || 0}</div>
						<div className="text-sm text-gray-600">Reports Verified</div>
					</div>
					<div className="text-center p-4 bg-yellow-50 rounded-lg">
						<div className="text-2xl font-bold text-yellow-600">{stats.communityRank || 'N/A'}</div>
						<div className="text-sm text-gray-600">Community Rank</div>
					</div>
					<div className="text-center p-4 bg-purple-50 rounded-lg">
						<div className="text-2xl font-bold text-purple-600">{stats.activeDays || 0}</div>
						<div className="text-sm text-gray-600">Active Days</div>
					</div>
				</div>
			);
		} else if (role === 'ngo') {
			return (
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div className="text-center p-4 bg-blue-50 rounded-lg">
						<div className="text-2xl font-bold text-blue-600">{stats.reportsVerified || 0}</div>
						<div className="text-sm text-gray-600">Reports Verified</div>
					</div>
					<div className="text-center p-4 bg-green-50 rounded-lg">
						<div className="text-2xl font-bold text-green-600">{stats.projectsCompleted || 0}</div>
						<div className="text-sm text-gray-600">Projects Completed</div>
					</div>
					<div className="text-center p-4 bg-yellow-50 rounded-lg">
						<div className="text-2xl font-bold text-yellow-600">{stats.communityImpact || 0}</div>
						<div className="text-sm text-gray-600">Community Impact</div>
					</div>
					<div className="text-center p-4 bg-purple-50 rounded-lg">
						<div className="text-2xl font-bold text-purple-600">{stats.partnershipsFormed || 0}</div>
						<div className="text-sm text-gray-600">Partnerships</div>
					</div>
				</div>
			);
		}
		return null;
	};

	if (!userId || !role) {
		return (
			<div className="min-h-screen bg-gray-50 pt-20 px-4">
				<div className="max-w-6xl mx-auto">
					<div className="flex justify-center items-center h-64">
						<div className="text-center">
							<h2 className="text-2xl font-bold text-gray-800 mb-4">Please Log In</h2>
							<p className="text-gray-600 mb-4">You need to be logged in to view your profile.</p>
							<button 
								onClick={() => window.location.href = '/login'}
								className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
							>
								Go to Login
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 pt-20 px-4">
				<div className="max-w-6xl mx-auto">
					<div className="flex justify-center items-center h-64">
						<div className="text-xl">Loading profile...</div>
					</div>
				</div>
			</div>
		);
	}

	const nextLevelPoints = getNextLevelPoints(stats.points || 0);
	const currentLevel = getCurrentLevel(stats.points || 0);
	const progressPercentage = stats.points ? ((stats.points / nextLevelPoints) * 100) : 0;

	return (
		<div className="min-h-screen bg-gray-50 pt-20 px-4">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-gray-800 mb-2">My Profile</h1>
					<p className="text-gray-600">Manage your account and track your conservation impact</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Left Column - Profile Info */}
					<div className="lg:col-span-1">
						<Card className="mb-6">
							<div className="text-center">
								<Avatar 
									size="xlarge" 
									shape="circle" 
									className="mb-4 bg-blue-500 text-white"
									label={profileData?.name?.charAt(0) || user?.name?.charAt(0) || 'U'}
								/>
								<h2 className="text-2xl font-bold text-gray-800 mb-2">
									{profileData?.name || user?.name || 'User'}
								</h2>
								<p className="text-gray-600 mb-2">{profileData?.email || user?.email}</p>
								<Chip 
									label={role?.toUpperCase()} 
									className="mb-4"
									style={{ backgroundColor: '#10b981', color: 'white' }}
								/>
								
								{stats.isVerified && (
									<div className="flex justify-center items-center mb-4">
										<Badge value="Verified" severity="success" />
										<span className="ml-2 text-sm text-green-600">Government Verified</span>
									</div>
								)}
							</div>
						</Card>

						{/* Contact Info */}
						<Card title="Contact Information">
							<div className="space-y-3">
								<div>
									<label className="text-sm font-semibold text-gray-600">Email</label>
									<p className="text-gray-800">{profileData?.email || user?.email}</p>
								</div>
								<div>
									<label className="text-sm font-semibold text-gray-600">Phone</label>
									<p className="text-gray-800">{profileData?.phone || 'Not provided'}</p>
								</div>
								<div>
									<label className="text-sm font-semibold text-gray-600">Join Date</label>
									<p className="text-gray-800">
										{profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'N/A'}
									</p>
								</div>
							</div>
						</Card>
					</div>

					{/* Right Column - Stats and Activities */}
					<div className="lg:col-span-2">
						{/* Points and Level */}
						<Card className="mb-6">
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-xl font-bold text-gray-800">Points & Level</h3>
								<div className="text-right">
									<div className="text-3xl font-bold text-blue-600">{stats.points || 0}</div>
									<div className="text-sm text-gray-600">Total Points</div>
								</div>
							</div>
							
							<div className="mb-4">
								<div className="flex justify-between items-center mb-2">
									<span className="text-sm font-semibold text-gray-600">Current Level: {currentLevel}</span>
									<span className="text-sm text-gray-600">{stats.points || 0} / {nextLevelPoints} points</span>
								</div>
								<ProgressBar value={Math.min(progressPercentage, 100)} className="h-3" />
							</div>
						</Card>

						{/* Role-specific Stats */}
						<Card title="Statistics" className="mb-6">
							{getRoleSpecificStats()}
						</Card>

						{/* Achievements */}
						<Card title="Achievements" className="mb-6">
							{achievements.length > 0 ? (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{achievements.map((achievement, index) => (
										<div key={index} className={`p-4 rounded-lg ${achievement.color}`}>
											<div className="flex items-center">
												<span className="text-2xl mr-3">{achievement.icon}</span>
												<div>
													<h4 className="font-bold">{achievement.name}</h4>
													<p className="text-sm">{achievement.description}</p>
												</div>
											</div>
										</div>
									))}
								</div>
							) : (
								<p className="text-gray-600">No achievements yet. Keep contributing to earn achievements!</p>
							)}
						</Card>

						{/* Recent Activity */}
						<Card title="Recent Activity">
							<div className="space-y-3">
								{stats.recentActivity ? (
									stats.recentActivity.map((activity, index) => (
										<div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
											<div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
											<div>
												<p className="text-sm font-medium">{activity.description}</p>
												<p className="text-xs text-gray-500">{activity.date}</p>
											</div>
										</div>
									))
								) : (
									<p className="text-gray-600">No recent activity</p>
								)}
							</div>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
