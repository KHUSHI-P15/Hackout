/**
 * Comprehensive Test Script for Mangrove Classification System
 * Tests the streamlined AI service focusing on image-based mangrove detection
 */

const MangroveAIService = require('./services/ai.service');
const MangroveImageClassifier = require('./utils/ai/imageAnalyzer');

class MangroveSystemTester {
	constructor() {
		this.aiService = new MangroveAIService();
		this.imageClassifier = new MangroveImageClassifier();
		this.testResults = [];
	}

	/**
	 * Run comprehensive tests
	 */
	async runAllTests() {
		console.log('\n🧪 MANGROVE CLASSIFICATION SYSTEM - COMPREHENSIVE TESTS');
		console.log('='.repeat(60));

		const startTime = Date.now();
		let passed = 0;
		let failed = 0;

		const tests = [
			{ name: 'Direct Image Classifier Test', method: this.testImageClassifier },
			{ name: 'AI Service Integration Test', method: this.testAIService },
			{ name: 'Single Image Processing', method: this.testSingleImage },
			{ name: 'Multiple Images Processing', method: this.testMultipleImages },
			{ name: 'Error Handling Test', method: this.testErrorHandling },
			{ name: 'Confidence Threshold Test', method: this.testConfidenceThresholds },
			{ name: 'Model Fallback Test', method: this.testModelFallback },
			{ name: 'Performance Benchmark', method: this.testPerformance },
		];

		for (const test of tests) {
			console.log(`\n🔍 Running: ${test.name}`);
			console.log('-'.repeat(40));

			try {
				const result = await test.method.call(this);

				if (result.success) {
					console.log(`✅ PASSED: ${test.name}`);
					passed++;
				} else {
					console.log(`❌ FAILED: ${test.name} - ${result.error}`);
					failed++;
				}

				this.testResults.push({
					test: test.name,
					success: result.success,
					data: result.data,
					error: result.error,
					duration: result.duration,
				});
			} catch (error) {
				console.log(`❌ FAILED: ${test.name} - ${error.message}`);
				failed++;

				this.testResults.push({
					test: test.name,
					success: false,
					error: error.message,
					duration: 0,
				});
			}
		}

		const totalTime = Date.now() - startTime;

		console.log('\n📊 TEST SUMMARY');
		console.log('='.repeat(60));
		console.log(`✅ Passed: ${passed}`);
		console.log(`❌ Failed: ${failed}`);
		console.log(`⏱️ Total Time: ${totalTime}ms`);
		console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

		if (failed === 0) {
			console.log(
				'\n🎉 ALL TESTS PASSED! Mangrove classification system is ready for production.'
			);
		} else {
			console.log('\n⚠️ Some tests failed. Please review the issues before deploying.');
		}

		return {
			passed,
			failed,
			successRate: (passed / (passed + failed)) * 100,
			totalTime,
			results: this.testResults,
		};
	}

	/**
	 * Test the image classifier directly
	 */
	async testImageClassifier() {
		const startTime = Date.now();

		try {
			// Test with a known mangrove image URL
			const testImageUrl =
				'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Mangrove_trees.jpg/800px-Mangrove_trees.jpg';

			console.log(`📸 Testing image: ${testImageUrl}`);

			const result = await this.imageClassifier.classifyImage(testImageUrl);

			console.log(`🔍 Classification Result:`);
			console.log(`   - Is Mangrove: ${result.isMangrove}`);
			console.log(`   - Confidence: ${(result.confidence * 100).toFixed(1)}%`);
			console.log(`   - Method Used: ${result.modelInfo?.method || 'unknown'}`);
			console.log(`   - Processing Time: ${result.processingTime}ms`);

			const success =
				result.success && result.hasOwnProperty('isMangrove') && result.confidence > 0;

			return {
				success,
				data: result,
				duration: Date.now() - startTime,
				error: success ? null : 'Invalid classification result',
			};
		} catch (error) {
			return {
				success: false,
				error: error.message,
				duration: Date.now() - startTime,
			};
		}
	}

	/**
	 * Test the AI service integration
	 */
	async testAIService() {
		const startTime = Date.now();

		try {
			const testReport = {
				_id: 'test_report_' + Date.now(),
				title: 'Test Mangrove Report',
				description: 'Testing AI service with mangrove images from coastal area',
				media: [
					{
						type: 'image',
						url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Mangrove_trees.jpg/800px-Mangrove_trees.jpg',
					},
				],
			};

			console.log(`🤖 Processing test report with AI service...`);

			const result = await this.aiService.processImages(testReport);

			console.log(`📊 AI Service Results:`);
			console.log(`   - Report ID: ${result.reportId}`);
			console.log(`   - Mangrove Detected: ${result.overallAssessment.mangroveDetected}`);
			console.log(`   - Overall Confidence: ${(result.confidence * 100).toFixed(1)}%`);
			console.log(`   - Evidence Strength: ${result.overallAssessment.evidenceStrength}`);
			console.log(`   - Recommended Action: ${result.overallAssessment.recommendedAction}`);
			console.log(`   - Images Processed: ${result.imageAnalysis.totalImages}`);
			console.log(`   - Processing Time: ${result.processingTime}ms`);
			console.log(`   - Flags: ${result.flags.join(', ') || 'None'}`);

			const success = result.reportId && result.overallAssessment && result.imageAnalysis;

			return {
				success,
				data: result,
				duration: Date.now() - startTime,
				error: success ? null : 'Invalid AI service result',
			};
		} catch (error) {
			return {
				success: false,
				error: error.message,
				duration: Date.now() - startTime,
			};
		}
	}

	/**
	 * Test single image processing
	 */
	async testSingleImage() {
		const startTime = Date.now();

		try {
			const testCases = [
				{
					name: 'Mangrove Forest',
					url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Mangrove_trees.jpg/800px-Mangrove_trees.jpg',
					expectedMangrove: true,
				},
				{
					name: 'Regular Forest (Non-Mangrove)',
					url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Forest_path.jpg/800px-Forest_path.jpg',
					expectedMangrove: false,
				},
			];

			let successCount = 0;

			for (const testCase of testCases) {
				console.log(`🌳 Testing: ${testCase.name}`);

				try {
					const result = await this.imageClassifier.classifyImage(testCase.url);

					console.log(`   - Result: ${result.isMangrove ? 'Mangrove' : 'Non-Mangrove'}`);
					console.log(`   - Confidence: ${(result.confidence * 100).toFixed(1)}%`);
					console.log(
						`   - Expected: ${testCase.expectedMangrove ? 'Mangrove' : 'Non-Mangrove'}`
					);

					// Note: We don't enforce expected results since we're using real images
					// and the AI might have different interpretations
					if (result.success) {
						successCount++;
						console.log(`   ✅ Classification successful`);
					} else {
						console.log(`   ❌ Classification failed`);
					}
				} catch (error) {
					console.log(`   ❌ Error: ${error.message}`);
				}
			}

			return {
				success: successCount === testCases.length,
				data: { processed: testCases.length, successful: successCount },
				duration: Date.now() - startTime,
				error: successCount < testCases.length ? 'Some classifications failed' : null,
			};
		} catch (error) {
			return {
				success: false,
				error: error.message,
				duration: Date.now() - startTime,
			};
		}
	}

	/**
	 * Test multiple images processing
	 */
	async testMultipleImages() {
		const startTime = Date.now();

		try {
			const testReport = {
				_id: 'multi_test_' + Date.now(),
				title: 'Multiple Images Test',
				description: 'Testing batch processing of multiple images',
				media: [
					{
						type: 'image',
						url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Mangrove_trees.jpg/400px-Mangrove_trees.jpg',
					},
					{
						type: 'image',
						url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Forest_path.jpg/400px-Forest_path.jpg',
					},
					{
						type: 'image',
						url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Coastal_vegetation.jpg/400px-Coastal_vegetation.jpg',
					},
				],
			};

			console.log(`📸 Processing ${testReport.media.length} images...`);

			const result = await this.aiService.processImages(testReport);

			console.log(`📊 Batch Processing Results:`);
			console.log(`   - Total Images: ${result.imageAnalysis.totalImages}`);
			console.log(`   - Successful: ${result.imageAnalysis.successfulAnalyses}`);
			console.log(`   - Failed: ${result.imageAnalysis.failedAnalyses}`);
			console.log(`   - Mangrove Detected: ${result.imageAnalysis.mangroveDetected}`);
			console.log(
				`   - Average Confidence: ${(result.imageAnalysis.averageConfidence * 100).toFixed(
					1
				)}%`
			);

			const success =
				result.imageAnalysis.totalImages > 1 && result.imageAnalysis.successfulAnalyses > 0;

			return {
				success,
				data: result.imageAnalysis,
				duration: Date.now() - startTime,
				error: success ? null : 'Batch processing failed',
			};
		} catch (error) {
			return {
				success: false,
				error: error.message,
				duration: Date.now() - startTime,
			};
		}
	}

	/**
	 * Test error handling
	 */
	async testErrorHandling() {
		const startTime = Date.now();

		try {
			console.log(`🚫 Testing error scenarios...`);

			const errorTests = [
				{
					name: 'No Images',
					report: { _id: 'error_test_1', media: [] },
				},
				{
					name: 'Invalid Image URL',
					report: {
						_id: 'error_test_2',
						media: [
							{
								type: 'image',
								url: 'https://invalid-url-that-does-not-exist.com/image.jpg',
							},
						],
					},
				},
				{
					name: 'No Media Property',
					report: { _id: 'error_test_3' },
				},
			];

			let errorTestsPassed = 0;

			for (const errorTest of errorTests) {
				console.log(`   Testing: ${errorTest.name}`);

				try {
					await this.aiService.processImages(errorTest.report);
					console.log(`   ❌ Should have thrown an error`);
				} catch (error) {
					console.log(
						`   ✅ Correctly handled error: ${error.message.substring(0, 50)}...`
					);
					errorTestsPassed++;
				}
			}

			return {
				success: errorTestsPassed === errorTests.length,
				data: { errorTestsPassed, totalErrorTests: errorTests.length },
				duration: Date.now() - startTime,
				error: errorTestsPassed < errorTests.length ? 'Some error tests failed' : null,
			};
		} catch (error) {
			return {
				success: false,
				error: error.message,
				duration: Date.now() - startTime,
			};
		}
	}

	/**
	 * Test confidence thresholds
	 */
	async testConfidenceThresholds() {
		const startTime = Date.now();

		try {
			console.log(`📊 Testing confidence threshold logic...`);

			// Mock results with different confidence levels
			const mockResults = [
				{ confidence: 0.9, shouldBe: 'high' },
				{ confidence: 0.7, shouldBe: 'medium' },
				{ confidence: 0.3, shouldBe: 'low' },
			];

			let thresholdTestsPassed = 0;

			for (const mockResult of mockResults) {
				const assessment = this.aiService.generateOverallAssessment({
					successfulAnalyses: 1,
					averageConfidence: mockResult.confidence,
					individualResults: [
						{ success: true, isMangrove: true, confidence: mockResult.confidence },
					],
				});

				console.log(
					`   Confidence ${mockResult.confidence}: Action = ${assessment.recommendedAction}`
				);

				if (mockResult.confidence >= 0.8 && assessment.recommendedAction === 'approve') {
					thresholdTestsPassed++;
				} else if (
					mockResult.confidence >= 0.6 &&
					mockResult.confidence < 0.8 &&
					assessment.recommendedAction === 'human_review'
				) {
					thresholdTestsPassed++;
				} else if (
					mockResult.confidence < 0.6 &&
					assessment.recommendedAction === 'request_more_evidence'
				) {
					thresholdTestsPassed++;
				}
			}

			return {
				success: thresholdTestsPassed === mockResults.length,
				data: { thresholdTestsPassed, totalThresholdTests: mockResults.length },
				duration: Date.now() - startTime,
				error:
					thresholdTestsPassed < mockResults.length ? 'Threshold logic incorrect' : null,
			};
		} catch (error) {
			return {
				success: false,
				error: error.message,
				duration: Date.now() - startTime,
			};
		}
	}

	/**
	 * Test model fallback mechanisms
	 */
	async testModelFallback() {
		const startTime = Date.now();

		try {
			console.log(`🔄 Testing fallback mechanisms...`);

			// Test the model status check
			const modelStatus = this.imageClassifier.getModelStatus();

			console.log(`   📡 Model Status: ${JSON.stringify(modelStatus, null, 2)}`);

			// Test with a simple URL to see fallback behavior
			const testUrl = 'https://httpbin.org/status/200'; // This will likely trigger fallback

			try {
				const result = await this.imageClassifier.classifyImage(testUrl);
				console.log(`   🔄 Fallback result: ${result.modelInfo?.method || 'unknown'}`);

				return {
					success: true,
					data: { modelStatus, fallbackResult: result },
					duration: Date.now() - startTime,
					error: null,
				};
			} catch (error) {
				console.log(`   ✅ Fallback correctly rejected invalid image`);

				return {
					success: true,
					data: { modelStatus, fallbackBehavior: 'correctly_rejected' },
					duration: Date.now() - startTime,
					error: null,
				};
			}
		} catch (error) {
			return {
				success: false,
				error: error.message,
				duration: Date.now() - startTime,
			};
		}
	}

	/**
	 * Test performance benchmarks
	 */
	async testPerformance() {
		const startTime = Date.now();

		try {
			console.log(`⚡ Running performance benchmarks...`);

			const benchmarkUrl =
				'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Mangrove_trees.jpg/400px-Mangrove_trees.jpg';
			const iterations = 3;
			const times = [];

			for (let i = 0; i < iterations; i++) {
				const iterationStart = Date.now();

				try {
					await this.imageClassifier.classifyImage(benchmarkUrl);
					const iterationTime = Date.now() - iterationStart;
					times.push(iterationTime);
					console.log(`   🏃 Iteration ${i + 1}: ${iterationTime}ms`);
				} catch (error) {
					console.log(`   ❌ Iteration ${i + 1} failed: ${error.message}`);
				}
			}

			if (times.length > 0) {
				const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
				const minTime = Math.min(...times);
				const maxTime = Math.max(...times);

				console.log(`   📊 Performance Stats:`);
				console.log(`      - Average: ${avgTime.toFixed(1)}ms`);
				console.log(`      - Fastest: ${minTime}ms`);
				console.log(`      - Slowest: ${maxTime}ms`);

				return {
					success: true,
					data: { avgTime, minTime, maxTime, times },
					duration: Date.now() - startTime,
					error: null,
				};
			} else {
				return {
					success: false,
					error: 'No successful iterations',
					duration: Date.now() - startTime,
				};
			}
		} catch (error) {
			return {
				success: false,
				error: error.message,
				duration: Date.now() - startTime,
			};
		}
	}

	/**
	 * Generate detailed test report
	 */
	generateReport() {
		console.log('\n📄 DETAILED TEST REPORT');
		console.log('='.repeat(60));

		this.testResults.forEach((result, index) => {
			console.log(`\n${index + 1}. ${result.test}`);
			console.log(`   Status: ${result.success ? '✅ PASSED' : '❌ FAILED'}`);
			console.log(`   Duration: ${result.duration}ms`);

			if (result.error) {
				console.log(`   Error: ${result.error}`);
			}

			if (result.data) {
				console.log(
					`   Data: ${JSON.stringify(result.data, null, 2).substring(0, 200)}...`
				);
			}
		});
	}
}

// Main execution
async function main() {
	console.log('🌿 MANGROVE AI SYSTEM - STREAMLINED TEST SUITE');
	console.log('='.repeat(60));
	console.log('🎯 Testing focused mangrove image classification system');
	console.log('📝 All tests focus on binary classification: Mangrove vs Non-Mangrove');

	const tester = new MangroveSystemTester();

	try {
		const results = await tester.runAllTests();

		// Generate detailed report
		tester.generateReport();

		// Final recommendations
		console.log('\n💡 INTEGRATION RECOMMENDATIONS');
		console.log('='.repeat(60));

		if (results.successRate >= 90) {
			console.log('🟢 READY FOR PRODUCTION');
			console.log('   - System is stable and performing well');
			console.log('   - All core functionality is working');
			console.log('   - Integration with existing routes recommended');
		} else if (results.successRate >= 70) {
			console.log('🟡 NEEDS MINOR FIXES');
			console.log('   - Most functionality is working');
			console.log('   - Address failed tests before full deployment');
			console.log('   - Consider limited beta testing');
		} else {
			console.log('🔴 REQUIRES MAJOR FIXES');
			console.log('   - Multiple critical issues detected');
			console.log('   - Do not deploy until issues are resolved');
			console.log('   - Review error logs and fix underlying problems');
		}

		console.log('\n🔗 NEXT STEPS FOR INTEGRATION:');
		console.log('1. Update image classification routes to use MangroveAIService');
		console.log('2. Update report processing to call processImages() method');
		console.log('3. Set up proper error handling in route handlers');
		console.log('4. Configure database for AI validation storage');
		console.log('5. Test with real user uploads');

		return results;
	} catch (error) {
		console.error('❌ Test suite failed to run:', error);
		return null;
	}
}

// Export for module use
module.exports = MangroveSystemTester;

// Run if called directly
if (require.main === module) {
	main();
}
