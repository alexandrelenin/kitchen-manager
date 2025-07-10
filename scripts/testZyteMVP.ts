#!/usr/bin/env node
// Test script for Zyte MVP with $5 budget constraints
// Run: npx ts-node scripts/testZyteMVP.ts

import { ZytePublixScraper, createPublixScraper } from '../src/lib/zytePublixScraper';
import { BudgetMonitor } from '../src/lib/zyteClient';

interface TestResult {
  product: string;
  zipCode: string;
  success: boolean;
  price?: number;
  source?: string;
  error?: string;
  duration: number;
}

interface TestSummary {
  totalTests: number;
  successCount: number;
  failureCount: number;
  totalCost: number;
  remainingBudget: number;
  averageResponseTime: number;
  testResults: TestResult[];
}

class ZyteMVPTester {
  private scraper: ZytePublixScraper;
  private testResults: TestResult[] = [];

  constructor() {
    // Check for API key
    if (!process.env.ZYTE_API_KEY) {
      console.error('❌ ZYTE_API_KEY environment variable is required');
      console.log('Set it with: export ZYTE_API_KEY="your_api_key_here"');
      process.exit(1);
    }

    this.scraper = createPublixScraper();
  }

  async runComprehensiveTest(): Promise<TestSummary> {
    console.log('🧪 Starting Zyte MVP Comprehensive Test\n');
    console.log('=' .repeat(60));

    // Test products commonly searched for grocery shopping
    const testProducts = [
      'milk',
      'bread', 
      'eggs',
      'bananas',
      'chicken breast',
      'butter',
      'cheese',
      'yogurt',
      'rice',
      'pasta'
    ];

    // Test multiple Florida zip codes for geographic coverage
    const testZipCodes = [
      '33130', // Miami Brickell (Premium area)
      '32836', // Orlando Lake Buena Vista (Tourist area)
      '33629'  // Tampa Westshore (Standard area)
    ];

    console.log(`📍 Testing ${testZipCodes.length} locations:`);
    testZipCodes.forEach(zip => console.log(`  - ${zip}`));
    console.log(`🛒 Testing ${testProducts.length} products per location`);
    console.log(`🔢 Total tests planned: ${testProducts.length * testZipCodes.length}`);
    console.log('');

    let testCount = 0;
    const startTime = Date.now();

    for (const zipCode of testZipCodes) {
      console.log(`\n📍 Testing zip code: ${zipCode}`);
      console.log('-'.repeat(40));
      
      for (const product of testProducts) {
        testCount++;
        console.log(`\n🔍 Test ${testCount}: ${product} in ${zipCode}`);
        
        const testStart = Date.now();
        let testResult: TestResult;

        try {
          // Check budget before each test
          if (!this.scraper.getBudgetStatus().remaining || this.scraper.getBudgetStatus().remaining < 0.0001) {
            console.log('💰 Budget exhausted - stopping tests');
            testResult = {
              product,
              zipCode,
              success: false,
              error: 'Budget exhausted',
              duration: Date.now() - testStart
            };
            this.testResults.push(testResult);
            break;
          }

          const result = await this.scraper.scrapeProductPrice(product, zipCode);
          const duration = Date.now() - testStart;

          if (result) {
            testResult = {
              product,
              zipCode,
              success: true,
              price: result.price,
              source: result.source,
              duration
            };
            
            console.log(`✅ Success: $${result.price} (${result.unit}) - Source: ${result.source}`);
            if (result.promotions && result.promotions.length > 0) {
              console.log(`🎉 Promotion: ${result.promotions[0].description}`);
            }
          } else {
            testResult = {
              product,
              zipCode,
              success: false,
              error: 'No data returned',
              duration
            };
            console.log(`❌ Failed: No data returned`);
          }

        } catch (error) {
          const duration = Date.now() - testStart;
          testResult = {
            product,
            zipCode,
            success: false,
            error: error.message,
            duration
          };
          console.log(`💥 Error: ${error.message}`);
          
          // Stop if budget exceeded
          if (error.message.includes('budget') || error.message.includes('Budget')) {
            console.log('🛑 Budget limit reached - stopping all tests');
            this.testResults.push(testResult);
            break;
          }
        }

        this.testResults.push(testResult);
        
        // Print budget status every few tests
        if (testCount % 3 === 0) {
          const budget = this.scraper.getBudgetStatus();
          console.log(`💰 Budget: $${budget.used.toFixed(6)} used, $${budget.remaining.toFixed(6)} remaining`);
        }

        // Small delay between tests to be respectful
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Check if we should continue with next zip code
      const budget = this.scraper.getBudgetStatus();
      if (budget.remaining < 0.001) {
        console.log('\n🛑 Budget nearly exhausted - stopping all tests');
        break;
      }
    }

    const totalDuration = Date.now() - startTime;
    console.log('\n' + '='.repeat(60));
    console.log(`✅ Testing completed in ${(totalDuration / 1000).toFixed(1)}s`);

    return this.generateSummary();
  }

  private generateSummary(): TestSummary {
    const budget = this.scraper.getBudgetStatus();
    const successCount = this.testResults.filter(r => r.success).length;
    const failureCount = this.testResults.filter(r => !r.success).length;
    const totalDuration = this.testResults.reduce((sum, r) => sum + r.duration, 0);

    return {
      totalTests: this.testResults.length,
      successCount,
      failureCount,
      totalCost: budget.used,
      remainingBudget: budget.remaining,
      averageResponseTime: totalDuration / this.testResults.length,
      testResults: this.testResults
    };
  }

  printDetailedReport(summary: TestSummary): void {
    console.log('\n📊 DETAILED TEST REPORT');
    console.log('=' .repeat(60));
    
    // Overall Statistics
    console.log('\n📈 OVERALL STATISTICS:');
    console.log(`Total Tests: ${summary.totalTests}`);
    console.log(`Successes: ${summary.successCount} (${(summary.successCount / summary.totalTests * 100).toFixed(1)}%)`);
    console.log(`Failures: ${summary.failureCount} (${(summary.failureCount / summary.totalTests * 100).toFixed(1)}%)`);
    console.log(`Average Response Time: ${(summary.averageResponseTime / 1000).toFixed(2)}s`);

    // Budget Analysis
    console.log('\n💰 BUDGET ANALYSIS:');
    console.log(`Total Cost: $${summary.totalCost.toFixed(6)}`);
    console.log(`Remaining Budget: $${summary.remainingBudget.toFixed(6)}`);
    console.log(`Cost per Test: $${(summary.totalCost / summary.totalTests).toFixed(8)}`);
    console.log(`Projected Tests with Full $5: ${Math.floor(5 / (summary.totalCost / summary.totalTests))}`);

    // Performance by Location
    console.log('\n📍 PERFORMANCE BY LOCATION:');
    const locationStats = this.analyzeByLocation(summary.testResults);
    Object.entries(locationStats).forEach(([zip, stats]) => {
      console.log(`${zip}: ${stats.success}/${stats.total} success (${(stats.success / stats.total * 100).toFixed(1)}%)`);
    });

    // Performance by Product
    console.log('\n🛒 PERFORMANCE BY PRODUCT:');
    const productStats = this.analyzeByProduct(summary.testResults);
    Object.entries(productStats).forEach(([product, stats]) => {
      console.log(`${product}: ${stats.success}/${stats.total} success (${(stats.success / stats.total * 100).toFixed(1)}%)`);
    });

    // Data Source Analysis
    console.log('\n📡 DATA SOURCE ANALYSIS:');
    const sourceStats = this.analyzeBySource(summary.testResults);
    Object.entries(sourceStats).forEach(([source, count]) => {
      console.log(`${source}: ${count} responses`);
    });

    // Failures Analysis
    if (summary.failureCount > 0) {
      console.log('\n❌ FAILURE ANALYSIS:');
      const failureReasons = this.analyzeFailures(summary.testResults);
      Object.entries(failureReasons).forEach(([reason, count]) => {
        console.log(`${reason}: ${count} occurrences`);
      });
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    this.generateRecommendations(summary);
  }

  private analyzeByLocation(results: TestResult[]): Record<string, { success: number; total: number }> {
    const stats: Record<string, { success: number; total: number }> = {};
    
    results.forEach(result => {
      if (!stats[result.zipCode]) {
        stats[result.zipCode] = { success: 0, total: 0 };
      }
      stats[result.zipCode].total++;
      if (result.success) {
        stats[result.zipCode].success++;
      }
    });

    return stats;
  }

  private analyzeByProduct(results: TestResult[]): Record<string, { success: number; total: number }> {
    const stats: Record<string, { success: number; total: number }> = {};
    
    results.forEach(result => {
      if (!stats[result.product]) {
        stats[result.product] = { success: 0, total: 0 };
      }
      stats[result.product].total++;
      if (result.success) {
        stats[result.product].success++;
      }
    });

    return stats;
  }

  private analyzeBySource(results: TestResult[]): Record<string, number> {
    const stats: Record<string, number> = {};
    
    results.forEach(result => {
      if (result.success && result.source) {
        stats[result.source] = (stats[result.source] || 0) + 1;
      }
    });

    return stats;
  }

  private analyzeFailures(results: TestResult[]): Record<string, number> {
    const stats: Record<string, number> = {};
    
    results.filter(r => !r.success).forEach(result => {
      const reason = result.error || 'Unknown error';
      stats[reason] = (stats[reason] || 0) + 1;
    });

    return stats;
  }

  private generateRecommendations(summary: TestSummary): void {
    const successRate = summary.successCount / summary.totalTests;
    const costPerTest = summary.totalCost / summary.totalTests;

    if (successRate > 0.8) {
      console.log('✅ High success rate - system is working well');
    } else if (successRate > 0.6) {
      console.log('⚠️ Moderate success rate - consider optimizing error handling');
    } else {
      console.log('❌ Low success rate - investigate issues with scraping logic');
    }

    if (costPerTest < 0.0005) {
      console.log('💰 Very cost-efficient - excellent for production use');
    } else if (costPerTest < 0.001) {
      console.log('💰 Cost-efficient - viable for production with budget planning');
    } else {
      console.log('💰 High cost per test - consider optimizations or alternative approaches');
    }

    console.log(`📊 With current performance, $5 budget supports ~${Math.floor(5 / costPerTest)} requests`);
    console.log(`🎯 For production, recommended daily budget: $${(costPerTest * 100).toFixed(4)} for 100 requests/day`);
  }

  async runQuickTest(): Promise<void> {
    console.log('⚡ Quick Test Mode - Testing 3 products in Miami\n');
    
    const testProducts = ['milk', 'bread', 'eggs'];
    const zipCode = '33130';

    for (const product of testProducts) {
      console.log(`Testing: ${product}`);
      const result = await this.scraper.scrapeProductPrice(product, zipCode);
      
      if (result) {
        console.log(`✅ ${product}: $${result.price} (${result.source})`);
      } else {
        console.log(`❌ ${product}: Failed`);
      }
    }

    this.scraper.printBudgetReport();
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const isQuickTest = args.includes('--quick');

  try {
    const tester = new ZyteMVPTester();
    
    if (isQuickTest) {
      await tester.runQuickTest();
    } else {
      const summary = await tester.runComprehensiveTest();
      tester.printDetailedReport(summary);
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { ZyteMVPTester };