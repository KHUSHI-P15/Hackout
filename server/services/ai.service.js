/**
 * Simplified AI Service for Mangrove Image Classification
 * Focuses solely on image-based mangrove detection
 */

const MangroveImageClassifier = require('../utils/ai/imageAnalyzer');
const AIValidation = require('../models/aiValidation.model');

class MangroveAIService {
	constructor() {
		this.imageClassifier = new MangroveImageClassifier();

		// Classification confidence thresholds
		this.thresholds = {
			HIGH_CONFIDENCE: 0.8, // Auto-approve mangrove detection
			MEDIUM_CONFIDENCE: 0.6, // Require human review
			LOW_CONFIDENCE: 0.4, // Request better image/more evidence
		};
	}

	/**
	 * Main method: Process images for mangrove detection
	 * @param {Object} reportData - Report containing images to analyze
	 * @returns {Object} Comprehensive analysis results
	 */
	async processImages(reportData) {
		try {
			console.log(`🤖 Starting mangrove detection for report: ${reportData._id}`);

			const analysisResults = {
				reportId: reportData._id,
				timestamp: new Date().toISOString(),
				imageAnalysis: null,
				overallAssessment: null,
				confidence: 0,
				recommendations: [],
				flags: [],
				processingTime: 0,
			};

			const startTime = Date.now();

			// 1. Process Images (main functionality)
			if (reportData.media && reportData.media.length > 0) {
				console.log(`📸 Analyzing ${reportData.media.length} images...`);
				analysisResults.imageAnalysis = await this.analyzeImages(
					reportData.media,
					reportData
				);
			} else {
				throw new Error('No images provided for analysis');
			}

			// 2. Generate Overall Assessment
			analysisResults.overallAssessment = this.generateOverallAssessment(
				analysisResults.imageAnalysis
			);

			// 3. Calculate confidence score
			analysisResults.confidence = this.calculateOverallConfidence(
				analysisResults.imageAnalysis
			);

			// 4. Generate recommendations
			analysisResults.recommendations = this.generateRecommendations(analysisResults);

			// 5. Identify flags for human attention
			analysisResults.flags = this.identifyFlags(analysisResults);

			analysisResults.processingTime = Date.now() - startTime;

			// 6. Save AI validation record
			await this.saveAIValidation(reportData._id, analysisResults);

			console.log(`✅ Mangrove detection completed in ${analysisResults.processingTime}ms`);
			console.log(
				`🌱 Mangrove detected: ${analysisResults.overallAssessment.mangroveDetected}`
			);
			console.log(`📊 Confidence: ${(analysisResults.confidence * 100).toFixed(1)}%`);

			return analysisResults;
		} catch (error) {
			console.error('❌ Mangrove detection failed:', error);
			throw new Error(`Mangrove detection failed: ${error.message}`);
		}
	}

	/**
	 * Analyze images for mangrove presence
	 */
	async analyzeImages(mediaArray, reportData) {
		const imageResults = [];
		const imageUrls = [];

		// Extract image URLs/paths
		for (const media of mediaArray.slice(0, 10)) {
			// Limit to 10 images
			if (media.type === 'image' || media.url || media.path) {
				imageUrls.push(media.url || media.path);
			}
		}

		if (imageUrls.length === 0) {
			throw new Error('No valid images found in media array');
		}

		// Classify images
		if (imageUrls.length === 1) {
			// Single image
			const result = await this.imageClassifier.classifyImage(imageUrls[0], {
				context: reportData.description || reportData.title,
			});
			imageResults.push(result);
		} else {
			// Batch processing for multiple images
			const batchResult = await this.imageClassifier.classifyBatch(imageUrls, {
				context: reportData.description || reportData.title,
			});
			imageResults.push(...batchResult.results);
		}

		return {
			totalImages: imageResults.length,
			successfulAnalyses: imageResults.filter((r) => r.success).length,
			failedAnalyses: imageResults.filter((r) => !r.success).length,
			mangroveDetected: imageResults.filter((r) => r.success && r.isMangrove).length,
			averageConfidence: this.calculateAverageConfidence(imageResults),
			highConfidenceResults: imageResults.filter(
				(r) => r.success && r.confidence >= this.thresholds.HIGH_CONFIDENCE
			).length,
			individualResults: imageResults,
			summary: this.generateImageSummary(imageResults),
		};
	}

	/**
	 * Generate overall assessment based on image analysis
	 */
	generateOverallAssessment(imageAnalysis) {
		const assessment = {
			mangroveDetected: false,
			confidence: 0,
			evidenceStrength: 'weak',
			consensusLevel: 'low',
			recommendedAction: 'review_required',
		};

		if (!imageAnalysis || imageAnalysis.successfulAnalyses === 0) {
			assessment.recommendedAction = 'resubmit_with_better_images';
			return assessment;
		}

		const successfulResults = imageAnalysis.individualResults.filter((r) => r.success);
		const mangroveResults = successfulResults.filter((r) => r.isMangrove);

		// Determine if mangrove is detected
		const mangrovePercentage = mangroveResults.length / successfulResults.length;
		assessment.mangroveDetected = mangrovePercentage > 0.5; // Majority vote

		// Calculate overall confidence
		assessment.confidence = imageAnalysis.averageConfidence;

		// Determine evidence strength
		if (assessment.confidence >= this.thresholds.HIGH_CONFIDENCE && mangrovePercentage >= 0.8) {
			assessment.evidenceStrength = 'strong';
			assessment.consensusLevel = 'high';
			assessment.recommendedAction = 'approve';
		} else if (
			assessment.confidence >= this.thresholds.MEDIUM_CONFIDENCE &&
			mangrovePercentage >= 0.6
		) {
			assessment.evidenceStrength = 'moderate';
			assessment.consensusLevel = 'medium';
			assessment.recommendedAction = 'human_review';
		} else {
			assessment.evidenceStrength = 'weak';
			assessment.consensusLevel = 'low';
			assessment.recommendedAction = 'request_more_evidence';
		}

		return assessment;
	}

	/**
	 * Calculate overall confidence score
	 */
	calculateOverallConfidence(imageAnalysis) {
		if (!imageAnalysis || imageAnalysis.successfulAnalyses === 0) {
			return 0;
		}

		return imageAnalysis.averageConfidence;
	}

	/**
	 * Calculate average confidence from image results
	 */
	calculateAverageConfidence(results) {
		const successfulResults = results.filter((r) => r.success);
		if (successfulResults.length === 0) return 0;

		const totalConfidence = successfulResults.reduce((sum, r) => sum + r.confidence, 0);
		return totalConfidence / successfulResults.length;
	}

	/**
	 * Generate actionable recommendations
	 */
	generateRecommendations(analysisResults) {
		const recommendations = [];
		const confidence = analysisResults.confidence;
		const assessment = analysisResults.overallAssessment;

		// Confidence-based recommendations
		if (confidence >= this.thresholds.HIGH_CONFIDENCE) {
			if (assessment.mangroveDetected) {
				recommendations.push({
					type: 'approve_mangrove_report',
					priority: 'high',
					message: 'High confidence mangrove detection - approve report',
				});
			} else {
				recommendations.push({
					type: 'reject_non_mangrove',
					priority: 'medium',
					message: 'High confidence non-mangrove classification',
				});
			}
		} else if (confidence >= this.thresholds.MEDIUM_CONFIDENCE) {
			recommendations.push({
				type: 'human_expert_review',
				priority: 'medium',
				message: 'Moderate confidence - requires expert verification',
			});
		} else {
			recommendations.push({
				type: 'request_better_images',
				priority: 'high',
				message: 'Low confidence - request clearer/closer images',
			});
		}

		// Specific recommendations based on analysis
		if (analysisResults.imageAnalysis.failedAnalyses > 0) {
			recommendations.push({
				type: 'image_quality_issue',
				priority: 'medium',
				message: `${analysisResults.imageAnalysis.failedAnalyses} images failed analysis - check image quality`,
			});
		}

		if (analysisResults.imageAnalysis.totalImages === 1) {
			recommendations.push({
				type: 'request_multiple_angles',
				priority: 'low',
				message: 'Consider requesting multiple images from different angles',
			});
		}

		return recommendations;
	}

	/**
	 * Identify flags for human attention
	 */
	identifyFlags(analysisResults) {
		const flags = [];
		const confidence = analysisResults.confidence;
		const imageAnalysis = analysisResults.imageAnalysis;

		// Low confidence flag
		if (confidence < this.thresholds.LOW_CONFIDENCE) {
			flags.push('very_low_confidence');
		}

		// Inconsistent results flag
		if (imageAnalysis.totalImages > 1) {
			const mangroveResults = imageAnalysis.individualResults.filter(
				(r) => r.success && r.isMangrove
			);
			const inconsistency = Math.abs(
				mangroveResults.length / imageAnalysis.successfulAnalyses - 0.5
			);

			if (inconsistency < 0.3) {
				// Close to 50-50 split
				flags.push('inconsistent_classification');
			}
		}

		// Technical issues flag
		if (imageAnalysis.failedAnalyses > imageAnalysis.successfulAnalyses) {
			flags.push('technical_processing_issues');
		}

		// Model fallback flag
		const fallbackResults = imageAnalysis.individualResults.filter(
			(r) => r.modelInfo && r.modelInfo.method === 'basic_fallback'
		);
		if (fallbackResults.length > 0) {
			flags.push('fallback_classification_used');
		}

		return flags;
	}

	/**
	 * Generate summary for image analysis
	 */
	generateImageSummary(results) {
		const successful = results.filter((r) => r.success);
		const mangroveDetected = successful.filter((r) => r.isMangrove);

		return {
			totalProcessed: results.length,
			successful: successful.length,
			mangroveImages: mangroveDetected.length,
			nonMangroveImages: successful.length - mangroveDetected.length,
			averageConfidence: this.calculateAverageConfidence(results),
			detectionRate:
				successful.length > 0 ? (mangroveDetected.length / successful.length) * 100 : 0,
		};
	}

	/**
	 * Save AI validation to database
	 */
	async saveAIValidation(reportId, results) {
		try {
			const validation = new AIValidation({
				report: reportId,
				aiResult: results.overallAssessment.mangroveDetected
					? 'mangrove_detected'
					: 'no_mangrove_detected',
				confidence: Math.round(results.confidence * 100),
				verified: false,
				isActive: true,
				metadata: {
					processingTime: results.processingTime,
					flags: results.flags,
					recommendations: results.recommendations,
					imageCount: results.imageAnalysis?.totalImages || 0,
					detectionMethod: 'image_classification',
				},
			});

			await validation.save();
			return validation;
		} catch (error) {
			console.error('Failed to save AI validation:', error);
			throw error;
		}
	}

	/**
	 * Get AI validation for a report
	 */
	async getAIValidation(reportId) {
		try {
			const validation = await AIValidation.findOne({
				report: reportId,
				isActive: true,
			}).populate('report');

			return validation;
		} catch (error) {
			console.error('Failed to get AI validation:', error);
			throw error;
		}
	}

	/**
	 * Update with human feedback for continuous learning
	 */
	async updateWithHumanFeedback(reportId, humanVerification, userId) {
		try {
			const validation = await AIValidation.findOne({
				report: reportId,
				isActive: true,
			});

			if (!validation) {
				throw new Error('AI validation not found');
			}

			const aiWasCorrect =
				(validation.aiResult === 'mangrove_detected' && humanVerification.isMangrove) ||
				(validation.aiResult === 'no_mangrove_detected' && !humanVerification.isMangrove);

			validation.verified = true;
			validation.humanFeedback = {
				verifiedBy: userId,
				verificationDate: new Date(),
				humanAssessment: humanVerification,
				aiAccuracy: aiWasCorrect ? 'correct' : 'incorrect',
				confidenceRating: humanVerification.confidenceRating || null,
			};

			await validation.save();
			return validation;
		} catch (error) {
			console.error('Failed to update with human feedback:', error);
			throw error;
		}
	}

	/**
	 * Get performance statistics
	 */
	async getPerformanceStats() {
		try {
			const totalValidations = await AIValidation.countDocuments({ isActive: true });
			const verifiedValidations = await AIValidation.countDocuments({
				isActive: true,
				verified: true,
			});

			const avgConfidence = await AIValidation.aggregate([
				{ $match: { isActive: true } },
				{ $group: { _id: null, avgConfidence: { $avg: '$confidence' } } },
			]);

			const accuracyStats = await AIValidation.aggregate([
				{
					$match: {
						isActive: true,
						verified: true,
						'humanFeedback.aiAccuracy': { $exists: true },
					},
				},
				{
					$group: {
						_id: '$humanFeedback.aiAccuracy',
						count: { $sum: 1 },
					},
				},
			]);

			const correctPredictions =
				accuracyStats.find((stat) => stat._id === 'correct')?.count || 0;
			const totalVerified = accuracyStats.reduce((sum, stat) => sum + stat.count, 0);

			return {
				totalReportsAnalyzed: totalValidations,
				verificationRate:
					totalValidations > 0 ? (verifiedValidations / totalValidations) * 100 : 0,
				averageConfidence: avgConfidence[0]?.avgConfidence || 0,
				accuracy: totalVerified > 0 ? (correctPredictions / totalVerified) * 100 : 0,
				modelStatus: this.imageClassifier.getModelStatus(),
				timestamp: new Date().toISOString(),
			};
		} catch (error) {
			console.error('Failed to get performance stats:', error);
			throw error;
		}
	}

	/**
	 * Test the AI service with a sample image
	 */
	async testService() {
		console.log('🧪 Testing Mangrove AI Service...');

		const testReport = {
			_id: 'test_report_' + Date.now(),
			title: 'Test Mangrove Classification',
			description: 'Testing with sample mangrove image',
			media: [
				{
					type: 'image',
					url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Mangrove_trees.jpg/800px-Mangrove_trees.jpg',
				},
			],
		};

		try {
			const result = await this.processImages(testReport);

			console.log('✅ Test Results:');
			console.log(`   🌱 Mangrove Detected: ${result.overallAssessment.mangroveDetected}`);
			console.log(`   📊 Confidence: ${(result.confidence * 100).toFixed(1)}%`);
			console.log(`   🎯 Evidence Strength: ${result.overallAssessment.evidenceStrength}`);
			console.log(`   💡 Recommended Action: ${result.overallAssessment.recommendedAction}`);
			console.log(`   ⏱️ Processing Time: ${result.processingTime}ms`);

			return result;
		} catch (error) {
			console.error('❌ Test failed:', error.message);
			throw error;
		}
	}
}

module.exports = MangroveAIService;
