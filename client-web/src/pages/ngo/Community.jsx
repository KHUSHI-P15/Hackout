import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { FileUpload } from 'primereact/fileupload';
import { Divider } from 'primereact/divider';
import PageLayout from '../../components/layout/PageLayout';

export default function CommunityPage() {
	const [posts, setPosts] = useState([]);
	const [newPost, setNewPost] = useState({
		title: '',
		content: '',
		media: [],
	});
	const [showModal, setShowModal] = useState(false);

	// Fetch posts on component mount
	useEffect(() => {
		const fetchPosts = async () => {
			try {
				const response = await fetch('http://localhost:5000/community/posts', {
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${localStorage.getItem('token')}`,
						'Content-Type': 'application/json',
					},
				});

				if (!response.ok) {
					throw new Error('Failed to fetch posts');
				}

				const data = await response.json();
				setPosts(data);
			} catch (error) {
				console.error('Error fetching posts:', error);
			}
		};
		fetchPosts();
	}, []);

	// Handle post submission
	const handlePost = async () => {
		if (!newPost.title || !newPost.content) {
			alert('Title and content are required');
			return;
		}

		try {
			const formData = new FormData();
			formData.append('title', newPost.title);
			formData.append('content', newPost.content);
			newPost.media.forEach((file) => {
				formData.append('media', file);
			});

			const response = await fetch('http://localhost:5000/community/posts', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${localStorage.getItem('token')}`,
					// Note: Do NOT set 'Content-Type' for FormData; fetch automatically sets it
				},
				body: formData,
			});

			if (!response.ok) {
				throw new Error('Failed to create post');
			}

			const data = await response.json();
			setPosts([data, ...posts]);
			setNewPost({ title: '', content: '', media: [] });
			setShowModal(false);
		} catch (error) {
			console.error('Error creating post:', error);
			alert('Failed to create post');
		}
	};

	return (
		<PageLayout>
			<div className="p-6">
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-4xl font-semibold mb-4 text-[#336699]">
						Community Announcements
					</h2>
					<Button
						label="Add Post"
						icon="pi pi-plus"
						onClick={() => setShowModal(true)}
						style={{ backgroundColor: '#336699', border: 'none' }}
					/>
				</div>

				{/* Post Modal */}
				<Dialog
					header="New Announcement"
					visible={showModal}
					style={{ width: '500px' }}
					modal
					onHide={() =>
						setNewPost({ title: '', content: '', media: [] }) || setShowModal(false)
					}
				>
					<div className="space-y-3">
						<InputText
							value={newPost.title}
							onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
							placeholder="Enter title"
							className="w-full"
						/>
						<InputTextarea
							value={newPost.content}
							onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
							placeholder="Write something..."
							rows={4}
							className="w-full"
						/>
						<FileUpload
							mode="basic"
							name="media"
							accept="image/*,video/*"
							auto={false}
							customUpload
							chooseLabel="Upload Media"
							className="w-full"
							onSelect={(e) =>
								setNewPost({
									...newPost,
									media: [...newPost.media, ...e.files],
								})
							}
						/>
						{newPost.media.length > 0 && (
							<div className="flex gap-2 mt-2 flex-wrap">
								{newPost.media.map((file, idx) => (
									<img
										key={idx}
										src={URL.createObjectURL(file)}
										alt="preview"
										className="w-24 h-24 object-cover rounded"
									/>
								))}
							</div>
						)}
						<div className="flex justify-end">
							<Button
								label="Post"
								icon="pi pi-send"
								onClick={handlePost}
								style={{ backgroundColor: '#336699', border: 'none' }}
							/>
						</div>
					</div>
				</Dialog>

				<Divider />

				{/* Posts list */}
				<div className="space-y-6">
					{posts.map((post) => (
						<Card
							key={post._id}
							className="shadow-md rounded-2xl border border-gray-100 hover:shadow-lg transition-all"
						>
							{/* Header */}
							<div className="flex items-center mb-3">
								<div
									className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white mr-3"
									style={{ backgroundColor: '#336699' }}
								>
									{post.createdBy?.name?.charAt(0) || 'U'}
								</div>
								<div>
									<div className="font-semibold text-[#336699]">
										{post.createdBy?.name || 'Unknown User'}
									</div>
									<div className="text-xs text-gray-500">
										{new Date(post.createdAt).toLocaleString()}
									</div>
								</div>
							</div>

							{/* Title & Content */}
							<h3 className="text-lg font-semibold mb-1">{post.title}</h3>
							<p className="text-gray-700 mb-3">{post.content}</p>

							{/* Media */}
							{post.media.length > 0 && (
								<div className="grid grid-cols-2 gap-2 mb-3">
									{post.media.map((m, idx) => (
										<img
											key={idx}
											src={`http://localhost:5000${m}`}
											alt="media"
											className="w-full h-40 object-cover rounded-lg"
										/>
									))}
								</div>
							)}
						</Card>
					))}
				</div>
			</div>
		</PageLayout>
	);
}
