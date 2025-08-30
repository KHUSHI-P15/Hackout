import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { fetchPost } from '../../utils/fetch.utils';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder';
import PageLayout from '../../components/layout/PageLayout';

export default function AddReport() {
	const [form, setForm] = useState({
		title: '',
		description: '',
		category: '',
		address: '',
		lat: '',
		lng: '',
	});

	const [media, setMedia] = useState([]);
	const [mapVisible, setMapVisible] = useState(false);
	const [locMode, setLocMode] = useState(''); // '' | 'auto' | 'manual'
	const [loading, setLoading] = useState(false);
	const [locationLoading, setLocationLoading] = useState(false);
	const [errors, setErrors] = useState({});
	const [uploadedFiles, setUploadedFiles] = useState([]);
	const [serverStatus, setServerStatus] = useState('checking');

	// Check server status on component mount
	useEffect(() => {
		const checkServerStatus = async () => {
			try {
				const response = await fetch(import.meta.env.VITE_URL + 'citizens/add-report', {
					method: 'OPTIONS',
				});
				setServerStatus('online');
			} catch (error) {
				setServerStatus('offline');
				console.error('Server connectivity check failed:', error);
			}
		};

		checkServerStatus();
	}, []);

	const mapRef = useRef(null);
	const markerRef = useRef(null);
	const fileUploadRef = useRef(null);

	// Fix missing default marker icons
	useMemo(() => {
		const icon = L.icon({
			iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
			iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
			shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
			iconSize: [25, 41],
			iconAnchor: [12, 41],
			popupAnchor: [1, -34],
			shadowSize: [41, 41],
		});
		L.Marker.prototype.options.icon = icon;
	}, []);

	const categories = [
		{ label: '🌳 Cutting', value: 'cutting' },
		{ label: '🗑️ Dumping', value: 'dumping' },
		{ label: '🏠 Encroachment', value: 'encroachment' },
		{ label: '💨 Pollution', value: 'pollution' },
		{ label: '❓ Other', value: 'other' },
	];

	const handleChange = (key, value) => {
		setForm((prev) => ({ ...prev, [key]: value }));
		// Clear error when user starts typing
		if (errors[key]) {
			setErrors((prev) => ({ ...prev, [key]: '' }));
		}
	};

	const handleFileUpload = (e) => {
		const files = Array.from(e.files);
		const validFiles = [];
		const errorsArr = [];

		files.forEach((file) => {
			// Validate file size (5MB max)
			if (file.size > 5 * 1024 * 1024) {
				errorsArr.push(`File ${file.name} is too large. Maximum size is 5MB.`);
				return;
			}

			// Validate file type
			if (!file.type.startsWith('image/')) {
				errorsArr.push(`File ${file.name} is not an image.`);
				return;
			}

			// Check max file count
			if (uploadedFiles.length + validFiles.length >= 10) {
				errorsArr.push(
					`Maximum 10 images allowed. You can upload ${10 - uploadedFiles.length} more.`
				);
				return;
			}

			validFiles.push(file);
		});

		if (errorsArr.length > 0) {
			alert('⚠️ Upload errors:\n' + errorsArr.join('\n'));
		}

		// Update state: keep File objects for upload
		setUploadedFiles((prev) => [...prev, ...validFiles]);

		// Generate previews using FileReader
		validFiles.forEach((file) => {
			const reader = new FileReader();
			reader.onload = () => {
				setMedia((prev) => [...prev, reader.result]);
			};
			reader.readAsDataURL(file);
		});

		// Clear PrimeReact input
		if (fileUploadRef.current) fileUploadRef.current.clear();
	};

	const removeImage = (index) => {
		setMedia((prev) => prev.filter((_, i) => i !== index));
		setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
	};

	const placeMarker = (lat, lng, popup = '') => {
		if (!mapRef.current) return;
		if (markerRef.current) mapRef.current.removeLayer(markerRef.current);

		markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
		if (popup) markerRef.current.bindPopup(popup).openPopup();

		setForm((prev) => ({ ...prev, lat: lat.toString(), lng: lng.toString() }));

		// Clear location error when location is set
		if (errors.location) {
			setErrors((prev) => ({ ...prev, location: '' }));
		}
	};

	useEffect(() => {
		if (!mapVisible || mapRef.current) return;

		// Add a small delay to ensure DOM is ready
		const timer = setTimeout(() => {
			const mapContainer = document.getElementById('map');
			if (!mapContainer) return;

			const initialLat = parseFloat(form.lat) || 20.5937;
			const initialLng = parseFloat(form.lng) || 78.9629;
			const initialZoom = form.lat && form.lng ? 14 : 5;

			const map = L.map('map').setView([initialLat, initialLng], initialZoom);
			mapRef.current = map;

			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; OpenStreetMap contributors',
				maxZoom: 19,
			}).addTo(map);

			// Add existing marker if coordinates exist
			if (form.lat && form.lng) {
				placeMarker(parseFloat(form.lat), parseFloat(form.lng), 'Selected Location');
			}

			// Geocoder
			if (L.Control && L.Control.Geocoder) {
				const geocoder = L.Control.geocoder({
					defaultMarkGeocode: false,
					geocoder: L.Control.Geocoder.nominatim(),
					placeholder: 'Search for a place...',
					collapsed: false,
				})
					.on('markgeocode', function (e) {
						const { center, name } = e.geocode;
						map.setView(center, 16);
						placeMarker(center.lat, center.lng, name);
						handleChange('address', name || '');
					})
					.addTo(map);
			}

			// Click to pin
			const clickHandler = (e) => {
				const { lat, lng } = e.latlng;
				placeMarker(lat, lng, `Selected Location: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
			};
			map.on('click', clickHandler);

			// Cleanup
			return () => {
				if (mapRef.current) {
					map.off('click', clickHandler);
					map.remove();
					mapRef.current = null;
					markerRef.current = null;
				}
			};
		}, 100);

		return () => clearTimeout(timer);
	}, [mapVisible]);
	const handleLocationOption = (option) => {
		setLocMode(option);

		if (option === 'auto') {
			if (!navigator.geolocation) {
				alert('⚠️ Geolocation is not supported by your browser.');
				return;
			}

			setLocationLoading(true);
			setMapVisible(true); // Show map before fetching location

			const options = {
				enableHighAccuracy: true,
				maximumAge: 10000,
				timeout: 15000,
			};

			navigator.geolocation.getCurrentPosition(
				(position) => {
					setLocationLoading(false);
					const { latitude, longitude } = position.coords;

					// Wait for map to be initialized
					const waitForMap = () => {
						if (mapRef.current) {
							mapRef.current.setView([latitude, longitude], 16);
							placeMarker(latitude, longitude, 'Your Current Location');
						} else {
							setTimeout(waitForMap, 100);
						}
					};
					waitForMap();
				},
				(error) => {
					setLocationLoading(false);
					console.error('Geolocation error:', error);

					let errorMessage = '❌ Error getting location: ';
					switch (error.code) {
						case 1:
							errorMessage +=
								'Permission denied. Please allow location access in your browser.';
							break;
						case 2:
							errorMessage +=
								'Position unavailable. Please check your internet connection and try again.';
							break;
						case 3:
							errorMessage += 'Request timeout. Please try again.';
							break;
						default:
							errorMessage += 'Unknown error occurred. Please try manual selection.';
							break;
					}
					alert(errorMessage);
				},
				options
			);
		} else if (option === 'manual') {
			setMapVisible(true);
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!form.title?.trim()) {
			newErrors.title = 'Title is required';
		}

		if (!form.category) {
			newErrors.category = 'Category is required';
		}

		if (!form.lat || !form.lng) {
			newErrors.location = 'Location is required. Please select a location on the map.';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};
	const handleSubmit = async () => {
		if (!validateForm()) {
			alert('⚠️ Please fill all required fields and select a location');
			return;
		}

		setLoading(true);

		try {
			const token = localStorage.getItem('token'); // get token

			const locationData = {
				lat: parseFloat(form.lat),
				lng: parseFloat(form.lng),
				address: form.address,
			};

			// Create FormData
			const formData = new FormData();
			formData.append('title', form.title);
			formData.append('description', form.description);
			formData.append('category', form.category);
			formData.append('location', JSON.stringify(locationData));

			uploadedFiles.forEach((file) => formData.append('media', file));

			// Send request with Authorization header
			const res = await fetch(import.meta.env.VITE_URL + 'citizen/add-report', {
				method: 'POST',
				headers: {
					Authorization: 'Bearer ' + token, // pass token
				},
				body: formData, // FormData automatically sets multipart/form-data
			});

			const result = await res.json();

			if (result?.success) {
				alert('✅ Report submitted successfully!');
				// Reset form
				setForm({
					title: '',
					description: '',
					category: '',
					address: '',
					lat: '',
					lng: '',
				});
				setMedia([]);
				setUploadedFiles([]);
				setLocMode('');
				setMapVisible(false);
				setErrors({});

				if (markerRef.current && mapRef.current) {
					mapRef.current.removeLayer(markerRef.current);
					markerRef.current = null;
				}
				if (fileUploadRef.current) {
					fileUploadRef.current.clear();
				}

				if (mapRef.current) {
					mapRef.current.remove();
					mapRef.current = null;
				}
			} else {
				alert(result?.message || '❌ Failed to submit report');
			}
		} catch (error) {
			console.error('Submit error:', error);
			alert('❌ Failed to submit report. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<PageLayout>
			<div className="p-6">
				<h2 className="text-4xl font-semibold mb-2 text-[#336699]">Report an Incident</h2>
				<Card
					className="shadow-lg border-0 border-round-3xl overflow-hidden"
					style={{
						background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
						border: '1px solid #e2e8f0',
					}}
				>
					<div className="p-fluid">
						{/* Error Messages */}
						{Object.keys(errors).length > 0 && (
							<div className="mb-4">
								{Object.entries(errors).map(([key, message]) => (
									<Message
										key={key}
										severity="error"
										text={message}
										className="mb-2"
									/>
								))}
							</div>
						)}

						<div className="grid formgrid gap-4">
							{/* Title */}
							<div className="col-12">
								<label className="block font-semibold text-[#336699] mb-2 text-sm sm:text-base">
									Title <span className="text-red-500">*</span>
								</label>
								<InputText
									value={form.title}
									onChange={(e) => handleChange('title', e.target.value)}
									placeholder="Brief title for the report"
									className={`w-full p-3 text-sm sm:text-base ${
										errors.title ? 'p-invalid' : ''
									}`}
									style={{ borderRadius: '12px' }}
								/>
							</div>

							{/* Description */}
							<div className="col-12">
								<label className="block font-semibold text-[#336699] mb-2 text-sm sm:text-base">
									Description
								</label>
								<InputTextarea
									value={form.description}
									rows={4}
									onChange={(e) => handleChange('description', e.target.value)}
									placeholder="Detailed description of the incident..."
									className="w-full p-3 text-sm sm:text-base"
									style={{ borderRadius: '12px' }}
									autoResize
								/>
							</div>

							{/* Category and Address Row */}
							<div className="col-12 grid grid-nogutter gap-4">
								<div className="col-12 sm:col-6">
									<label className="block font-semibold text-[#336699] mb-2 text-sm sm:text-base">
										Category <span className="text-red-500">*</span>
									</label>
									<Dropdown
										value={form.category}
										options={categories}
										onChange={(e) => handleChange('category', e.value)}
										placeholder="Select category"
										className={`w-full ${errors.category ? 'p-invalid' : ''}`}
										style={{ borderRadius: '12px' }}
										panelStyle={{ borderRadius: '12px' }}
									/>
								</div>

								<div className="col-12 sm:col-6">
									<label className="block font-semibold text-[#336699] mb-2 text-sm sm:text-base">
										Address / Landmark
									</label>
									<InputText
										value={form.address}
										onChange={(e) => handleChange('address', e.target.value)}
										placeholder="Type address or select on map"
										className="w-full p-3 text-sm sm:text-base"
										style={{ borderRadius: '12px' }}
									/>
								</div>
							</div>

							{/* Location Selection */}
							<div className="col-12">
								<label className="block font-semibold text-[#336699] mb-2 text-sm sm:text-base">
									Location <span className="text-red-500">*</span>
								</label>
								<div className="grid grid-nogutter gap-3">
									<div className="col-12 sm:col-6">
										<select
											className={`w-full p-3 border-1 border-surface-300 border-round-xl text-sm sm:text-base ${
												errors.location ? 'border-red-400' : ''
											}`}
											value={locMode}
											onChange={(e) => handleLocationOption(e.target.value)}
											style={{
												background: 'white',
												outline: 'none',
												fontSize: 'inherit',
											}}
										>
											<option value="" disabled>
												Choose location method
											</option>
											<option value="auto">📍 Use My Current Location</option>
											<option value="manual">🗺️ Select on Map</option>
										</select>
									</div>
									{locationLoading && (
										<div className="col-12 sm:col-6 flex align-items-center gap-2">
											<ProgressSpinner size="small" />
											<span className="text-sm text-blue-600">
												Getting your location...
											</span>
										</div>
									)}
								</div>
							</div>

							{/* Map */}
							{mapVisible && (
								<div className="col-12">
									<div className="card p-0 border-round-2xl overflow-hidden shadow-2">
										<div
											id="map"
											className="w-full"
											style={{
												height: '400px',
												minHeight: '300px',
											}}
										/>
									</div>
								</div>
							)}

							{/* Location Display */}
							{form.lat && form.lng && (
								<div className="col-12">
									<div className="bg-green-50 border-1 border-green-200 border-round-xl p-3">
										<div className="flex align-items-center gap-2 text-green-800">
											<i className="pi pi-map-marker text-green-600"></i>
											<strong>Selected Location:</strong>
											<span className="text-sm">
												{Number(form.lat).toFixed(5)},{' '}
												{Number(form.lng).toFixed(5)}
											</span>
										</div>
									</div>
								</div>
							)}

							{/* File Upload */}
							<div className="col-12">
								<label className="block font-semibold text-[#336699] mb-2 text-sm sm:text-base">
									Upload Photos (Optional)
								</label>
								<div className="border-2 border-dashed border-gray-300 border-round-xl p-4 text-center hover:border-green-400 transition-colors">
									<FileUpload
										ref={fileUploadRef}
										mode="basic"
										accept="image/*"
										maxFileSize={2000000}
										multiple
										customUpload
										chooseLabel="📷 Select Images"
										className="p-button-outlined p-button-info"
										style={{ borderRadius: '8px' }}
										onSelect={handleFileUpload}
									/>
									<p className="text-xs text-gray-500 mt-2">
										Maximum 5MB per image. Maximum 10 images. Supported formats:
										JPG, PNG, WEBP
									</p>
								</div>

								{/* Image Preview Grid */}
								{media.length > 0 && (
									<div className="grid grid-nogutter mt-4 gap-3">
										{media.map((img, i) => (
											<div key={i} className="col-6 sm:col-4 lg:col-3">
												<div className="relative border-round-xl overflow-hidden shadow-2">
													<img
														src={img}
														alt={`preview-${i}`}
														className="w-full h-8rem object-cover"
													/>
													<Button
														icon="pi pi-times"
														className="p-button-rounded p-button-danger p-button-sm absolute top-0 right-0 m-1"
														style={{
															width: '2rem',
															height: '2rem',
														}}
														onClick={() => removeImage(i)}
														tooltip="Remove image"
													/>
												</div>
											</div>
										))}
									</div>
								)}
							</div>

							{/* Submit Button */}
							<div className="col-12 mt-4">
								<Button
									label={loading ? 'Submitting...' : 'Submit Report'}
									icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-send'}
									className="w-full p-button-lg font-semibold text-base sm:text-lg"
									onClick={handleSubmit}
									disabled={loading}
									style={{
										backgroundColor: '#336699',
										border: 'none',
										color: 'white',
										padding: '1rem 2rem',
										borderRadius: '12px',
									}}
								/>
							</div>
						</div>
					</div>
				</Card>
			</div>
		</PageLayout>
	);
}
