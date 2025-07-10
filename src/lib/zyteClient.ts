// Zyte API Client - Optimized for $5 Free Credit
// MVP implementation for Florida grocery price scraping

import axios from 'axios';

export interface ZyteApiOptions {
  url: string;
  httpResponseBody?: boolean;
  geolocation?: string;
  customData?: Record<string, any>;
  browserHtml?: boolean;
  screenshot?: boolean;
}

export interface ZyteApiResponse {
  url: string;
  statusCode: number;
  httpResponseBody?: string;
  customData?: Record<string, any>;
  screenshot?: string;
  browserHtml?: string;
}

export interface BudgetStatus {
  used: number;
  remaining: number;
  requestCount: number;
  dailySpent: number;
  dailyBudget: number;
}

class RateLimiter {
  private tokens: number;
  private maxTokens: number;
  private refillRate: number;
  private lastRefill: number;

  constructor(maxTokens: number, refillRate: number) {
    this.maxTokens = maxTokens;
    this.tokens = maxTokens;
    this.refillRate = refillRate;
    this.lastRefill = Date.now();
  }

  async removeToken(): Promise<void> {
    const now = Date.now();
    const timePassed = now - this.lastRefill;
    const tokensToAdd = Math.floor(timePassed / (60000 / this.refillRate)); // refillRate per minute

    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;

    if (this.tokens <= 0) {
      const waitTime = (60000 / this.refillRate) - (timePassed % (60000 / this.refillRate));
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.tokens = 1;
    } else {
      this.tokens--;
    }
  }
}

export class OptimizedZyteClient {
  private apiKey: string;
  private apiUrl: string;
  private rateLimiter: RateLimiter;
  private requestCount: number = 0;
  private totalBudget: number = 5.0; // $5 total budget
  private remainingBudget: number = 5.0;
  private dailyBudget: number = 1.0; // $1 per day
  private dailySpent: number = 0;
  private lastResetDate: string = '';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.apiUrl = 'https://api.zyte.com/v1/extract';
    // 8 requests per minute to stay well under limits
    this.rateLimiter = new RateLimiter(8, 8);
    this.resetDailyBudgetIfNeeded();
  }

  private resetDailyBudgetIfNeeded(): void {
    const today = new Date().toDateString();
    if (this.lastResetDate !== today) {
      this.dailySpent = 0;
      this.lastResetDate = today;
    }
  }

  private estimateRequestCost(url: string, options: ZyteApiOptions): number {
    let baseCost = 0.0001; // Very conservative base cost

    // Adjust cost based on site complexity
    if (url.includes('publix.com')) {
      baseCost = 0.0001; // Publix is relatively simple
    } else if (url.includes('winndixie.com')) {
      baseCost = 0.0002; // Might be more complex
    } else if (url.includes('wholefoodsmarket.com')) {
      baseCost = 0.0005; // Likely more complex (Amazon)
    } else {
      baseCost = 0.0003; // Unknown site
    }

    // Adjust for additional features
    if (options.browserHtml) {
      baseCost *= 3; // Browser rendering is more expensive
    }
    if (options.screenshot) {
      baseCost *= 2; // Screenshots add cost
    }

    return baseCost;
  }

  private checkBudgetLimits(estimatedCost: number): void {
    this.resetDailyBudgetIfNeeded();

    // Check total budget
    if (this.remainingBudget < estimatedCost) {
      throw new Error(
        `Total budget exceeded. Estimated cost: $${estimatedCost.toFixed(6)}, ` +
        `Remaining total budget: $${this.remainingBudget.toFixed(6)}`
      );
    }

    // Check daily budget
    if (this.dailySpent + estimatedCost > this.dailyBudget) {
      throw new Error(
        `Daily budget of $${this.dailyBudget} would be exceeded. ` +
        `Current daily spent: $${this.dailySpent.toFixed(6)}, ` +
        `Request cost: $${estimatedCost.toFixed(6)}`
      );
    }
  }

  async extract(options: ZyteApiOptions): Promise<ZyteApiResponse> {
    const estimatedCost = this.estimateRequestCost(options.url, options);
    
    // Check budget constraints
    this.checkBudgetLimits(estimatedCost);

    // Apply rate limiting
    await this.rateLimiter.removeToken();

    try {
      const requestBody = {
        url: options.url,
        httpResponseBody: options.httpResponseBody || true,
        geolocation: options.geolocation || 'US',
        customData: options.customData,
        ...(options.browserHtml && { browserHtml: true }),
        ...(options.screenshot && { screenshot: true })
      };

      console.log(`🔍 Zyte API Request ${this.requestCount + 1}:`, {
        url: options.url,
        estimatedCost: `$${estimatedCost.toFixed(6)}`,
        remainingBudget: `$${this.remainingBudget.toFixed(6)}`
      });

      const response = await axios.post(this.apiUrl, requestBody, {
        auth: {
          username: this.apiKey,
          password: ''
        },
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      });

      // Update budget tracking
      this.requestCount++;
      this.remainingBudget -= estimatedCost;
      this.dailySpent += estimatedCost;

      console.log(`✅ Request successful. Budget status:`, {
        totalUsed: `$${(this.totalBudget - this.remainingBudget).toFixed(6)}`,
        totalRemaining: `$${this.remainingBudget.toFixed(6)}`,
        dailySpent: `$${this.dailySpent.toFixed(6)}`,
        requestCount: this.requestCount
      });

      return response.data;

    } catch (error) {
      console.error('❌ Zyte API Error:', {
        message: error.response?.data || error.message,
        status: error.response?.status,
        url: options.url
      });
      throw error;
    }
  }

  getBudgetStatus(): BudgetStatus {
    this.resetDailyBudgetIfNeeded();
    
    return {
      used: this.totalBudget - this.remainingBudget,
      remaining: this.remainingBudget,
      requestCount: this.requestCount,
      dailySpent: this.dailySpent,
      dailyBudget: this.dailyBudget
    };
  }

  // Quick method for simple page scraping
  async scrapeHtml(url: string, customData?: Record<string, any>): Promise<string> {
    const response = await this.extract({
      url,
      httpResponseBody: true,
      customData
    });

    return response.httpResponseBody || '';
  }

  // Method for JavaScript-heavy sites
  async scrapeBrowser(url: string, customData?: Record<string, any>): Promise<string> {
    const response = await this.extract({
      url,
      browserHtml: true,
      customData
    });

    return response.browserHtml || '';
  }

  // Get remaining budget safely
  canMakeRequest(estimatedCost: number = 0.0003): boolean {
    this.resetDailyBudgetIfNeeded();
    
    return (
      this.remainingBudget >= estimatedCost &&
      (this.dailySpent + estimatedCost) <= this.dailyBudget
    );
  }

  // Emergency stop - prevents further requests
  stopAllRequests(): void {
    this.remainingBudget = 0;
    console.log('🛑 Emergency stop activated - all further requests blocked');
  }
}

// Factory function for easy instantiation
export function createZyteClient(apiKey?: string): OptimizedZyteClient {
  const key = apiKey || process.env.ZYTE_API_KEY;
  
  if (!key) {
    throw new Error(
      'Zyte API key is required. Set ZYTE_API_KEY environment variable or pass as parameter.'
    );
  }

  return new OptimizedZyteClient(key);
}

// Budget monitoring utilities
export class BudgetMonitor {
  static checkThresholds(budgetStatus: BudgetStatus): void {
    if (budgetStatus.remaining < 0.5) {
      console.log('🔴 CRITICAL: Less than $0.50 remaining!');
    } else if (budgetStatus.remaining < 1.0) {
      console.log('🟡 WARNING: Less than $1.00 remaining');
    }
    
    if (budgetStatus.dailySpent > budgetStatus.dailyBudget * 0.8) {
      console.log('📊 INFO: 80% of daily budget used');
    }

    if (budgetStatus.requestCount > 100) {
      console.log('📈 INFO: High request count - consider optimizing');
    }
  }

  static formatBudgetReport(budgetStatus: BudgetStatus): string {
    return [
      '💰 Budget Report:',
      `Total Used: $${budgetStatus.used.toFixed(6)}`,
      `Total Remaining: $${budgetStatus.remaining.toFixed(6)}`,
      `Daily Spent: $${budgetStatus.dailySpent.toFixed(6)} / $${budgetStatus.dailyBudget}`,
      `Total Requests: ${budgetStatus.requestCount}`,
      `Avg Cost/Request: $${(budgetStatus.used / budgetStatus.requestCount || 0).toFixed(8)}`
    ].join('\n');
  }
}