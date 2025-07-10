// Florida Price Scraping Service - Integração com Zyte API
// Demonstração de como seria a implementação real

export interface FloridaStore {
  id: string;
  name: string;
  chain: 'publix' | 'winn-dixie' | 'whole-foods' | 'walmart' | 'target' | 'aldi';
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
  zipCode: string;
  phone: string;
  hours: {
    [key: string]: { open: string; close: string };
  };
  services: {
    pickup: boolean;
    delivery: boolean;
    pharmacy: boolean;
    deli: boolean;
  };
}

export interface FloridaPriceData {
  product: string;
  store: FloridaStore;
  price: number;
  unit: string;
  pricePerUnit?: number;
  availability: boolean;
  lastUpdated: Date;
  promotions?: {
    type: 'sale' | 'bogo' | 'digital_coupon' | 'loyalty';
    description: string;
    originalPrice?: number;
    savings: number;
    validUntil?: Date;
  }[];
  nutritionInfo?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    sodium?: number;
  };
}

export interface FloridaPriceComparison {
  ingredient: string;
  searchedAt: Date;
  userLocation: GeoLocation;
  stores: FloridaPriceData[];
  bestPrice: FloridaPriceData;
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  recommendations: {
    bestValue: FloridaPriceData;
    closest: FloridaPriceData;
    bestPromotions: FloridaPriceData[];
  };
  estimatedSavings: number;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  zipCode: string;
  city: string;
  state: string;
}

class FloridaPriceScrapingService {
  private static instance: FloridaPriceScrapingService;
  private cache: Map<string, FloridaPriceData[]> = new Map();
  private storeDatabase: FloridaStore[] = [];
  private zyteIntegrationEnabled: boolean = false;
  private zyteClient: any = null; // Will be lazy-loaded

  static getInstance(): FloridaPriceScrapingService {
    if (!FloridaPriceScrapingService.instance) {
      FloridaPriceScrapingService.instance = new FloridaPriceScrapingService();
    }
    return FloridaPriceScrapingService.instance;
  }

  constructor() {
    this.initializeFloridaStores();
    this.initializeZyteIntegration();
  }

  private async initializeZyteIntegration(): Promise<void> {
    try {
      // Check if Zyte API key is available
      if (process.env.ZYTE_API_KEY) {
        const { createPublixScraper } = await import('./zytePublixScraper');
        this.zyteClient = createPublixScraper();
        this.zyteIntegrationEnabled = true;
        console.log('✅ Zyte integration enabled for real Florida price scraping');
      } else {
        console.log('ℹ️ Zyte integration disabled - using mock data (set ZYTE_API_KEY to enable)');
      }
    } catch (error) {
      console.warn('⚠️ Failed to initialize Zyte integration:', error.message);
      this.zyteIntegrationEnabled = false;
    }
  }

  private initializeFloridaStores(): void {
    // Mock data para demonstração - em produção viria de banco de dados
    this.storeDatabase = [
      // Publix stores
      {
        id: 'publix-miami-001',
        name: 'Publix Super Market at Brickell City Centre',
        chain: 'publix',
        address: '701 S Miami Ave, Miami, FL 33130',
        latitude: 25.7617,
        longitude: -80.1918,
        zipCode: '33130',
        phone: '(305) 808-9090',
        hours: {
          monday: { open: '7:00', close: '23:00' },
          tuesday: { open: '7:00', close: '23:00' },
          wednesday: { open: '7:00', close: '23:00' },
          thursday: { open: '7:00', close: '23:00' },
          friday: { open: '7:00', close: '23:00' },
          saturday: { open: '7:00', close: '23:00' },
          sunday: { open: '7:00', close: '22:00' }
        },
        services: {
          pickup: true,
          delivery: true,
          pharmacy: true,
          deli: true
        }
      },
      {
        id: 'publix-orlando-001',
        name: 'Publix Super Market at Lake Buena Vista',
        chain: 'publix',
        address: '12541 State Road 535, Orlando, FL 32836',
        latitude: 28.3772,
        longitude: -81.5707,
        zipCode: '32836',
        phone: '(407) 827-1200',
        hours: {
          monday: { open: '6:00', close: '23:00' },
          tuesday: { open: '6:00', close: '23:00' },
          wednesday: { open: '6:00', close: '23:00' },
          thursday: { open: '6:00', close: '23:00' },
          friday: { open: '6:00', close: '23:00' },
          saturday: { open: '6:00', close: '23:00' },
          sunday: { open: '7:00', close: '22:00' }
        },
        services: {
          pickup: true,
          delivery: true,
          pharmacy: true,
          deli: true
        }
      },
      // Winn-Dixie stores
      {
        id: 'winn-dixie-tampa-001',
        name: 'Winn-Dixie #1234',
        chain: 'winn-dixie',
        address: '4748 W Neptune St, Tampa, FL 33629',
        latitude: 27.9506,
        longitude: -82.5369,
        zipCode: '33629',
        phone: '(813) 282-1234',
        hours: {
          monday: { open: '6:00', close: '23:00' },
          tuesday: { open: '6:00', close: '23:00' },
          wednesday: { open: '6:00', close: '23:00' },
          thursday: { open: '6:00', close: '23:00' },
          friday: { open: '6:00', close: '23:00' },
          saturday: { open: '6:00', close: '23:00' },
          sunday: { open: '7:00', close: '22:00' }
        },
        services: {
          pickup: true,
          delivery: true,
          pharmacy: true,
          deli: true
        }
      },
      // Whole Foods stores
      {
        id: 'whole-foods-miami-001',
        name: 'Whole Foods Market - Brickell',
        chain: 'whole-foods',
        address: '1020 Brickell Ave, Miami, FL 33131',
        latitude: 25.7617,
        longitude: -80.1918,
        zipCode: '33131',
        phone: '(305) 456-7890',
        hours: {
          monday: { open: '7:00', close: '22:00' },
          tuesday: { open: '7:00', close: '22:00' },
          wednesday: { open: '7:00', close: '22:00' },
          thursday: { open: '7:00', close: '22:00' },
          friday: { open: '7:00', close: '22:00' },
          saturday: { open: '7:00', close: '22:00' },
          sunday: { open: '8:00', close: '21:00' }
        },
        services: {
          pickup: true,
          delivery: true,
          pharmacy: false,
          deli: true
        }
      }
    ];
  }

  // Integração com Zyte API ou fallback para mock data
  private async scrapeStorePrice(
    store: FloridaStore, 
    product: string
  ): Promise<FloridaPriceData | null> {
    
    // Try Zyte integration first if enabled and store is Publix
    if (this.zyteIntegrationEnabled && this.zyteClient && store.chain === 'publix') {
      try {
        console.log(`🔍 Using Zyte API for ${product} at ${store.name}`);
        
        const zyteResult = await this.zyteClient.scrapeProductPrice(product, store.zipCode);
        
        if (zyteResult) {
          return {
            product,
            store,
            price: zyteResult.price,
            unit: zyteResult.unit,
            pricePerUnit: zyteResult.pricePerUnit || zyteResult.price,
            availability: zyteResult.availability,
            lastUpdated: zyteResult.scrapedAt,
            promotions: zyteResult.promotions || [],
            nutritionInfo: zyteResult.nutritionInfo || {}
          };
        } else {
          console.log(`⚠️ Zyte API returned no data for ${product}, falling back to mock`);
        }
      } catch (error) {
        console.warn(`❌ Zyte API error for ${product}:`, error.message);
        console.log('🔄 Falling back to mock data');
      }
    }

    // Fallback to mock data (original implementation)
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    const priceData = this.generateMockPriceData(store, product);
    
    if (!priceData) return null;

    return {
      product,
      store,
      price: priceData.price,
      unit: priceData.unit,
      pricePerUnit: priceData.pricePerUnit,
      availability: priceData.availability,
      lastUpdated: new Date(),
      promotions: priceData.promotions,
      nutritionInfo: priceData.nutritionInfo
    };
  }

  private generateMockPriceData(store: FloridaStore, product: string): any {
    const productDatabase: Record<string, any> = {
      'milk': {
        'publix': { price: 4.79, unit: 'gallon', pricePerUnit: 4.79 },
        'winn-dixie': { price: 4.59, unit: 'gallon', pricePerUnit: 4.59 },
        'whole-foods': { price: 6.99, unit: 'gallon', pricePerUnit: 6.99 },
        'walmart': { price: 4.28, unit: 'gallon', pricePerUnit: 4.28 },
        'target': { price: 4.49, unit: 'gallon', pricePerUnit: 4.49 },
        'aldi': { price: 3.99, unit: 'gallon', pricePerUnit: 3.99 }
      },
      'bread': {
        'publix': { price: 2.89, unit: 'loaf', pricePerUnit: 2.89 },
        'winn-dixie': { price: 2.49, unit: 'loaf', pricePerUnit: 2.49 },
        'whole-foods': { price: 4.99, unit: 'loaf', pricePerUnit: 4.99 },
        'walmart': { price: 1.98, unit: 'loaf', pricePerUnit: 1.98 },
        'target': { price: 2.29, unit: 'loaf', pricePerUnit: 2.29 },
        'aldi': { price: 1.89, unit: 'loaf', pricePerUnit: 1.89 }
      },
      'eggs': {
        'publix': { price: 3.99, unit: 'dozen', pricePerUnit: 0.33 },
        'winn-dixie': { price: 3.79, unit: 'dozen', pricePerUnit: 0.32 },
        'whole-foods': { price: 5.99, unit: 'dozen', pricePerUnit: 0.50 },
        'walmart': { price: 3.48, unit: 'dozen', pricePerUnit: 0.29 },
        'target': { price: 3.69, unit: 'dozen', pricePerUnit: 0.31 },
        'aldi': { price: 2.99, unit: 'dozen', pricePerUnit: 0.25 }
      },
      'bananas': {
        'publix': { price: 1.69, unit: 'lb', pricePerUnit: 1.69 },
        'winn-dixie': { price: 1.49, unit: 'lb', pricePerUnit: 1.49 },
        'whole-foods': { price: 1.99, unit: 'lb', pricePerUnit: 1.99 },
        'walmart': { price: 1.28, unit: 'lb', pricePerUnit: 1.28 },
        'target': { price: 1.39, unit: 'lb', pricePerUnit: 1.39 },
        'aldi': { price: 1.19, unit: 'lb', pricePerUnit: 1.19 }
      },
      'chicken breast': {
        'publix': { price: 8.99, unit: 'lb', pricePerUnit: 8.99 },
        'winn-dixie': { price: 7.99, unit: 'lb', pricePerUnit: 7.99 },
        'whole-foods': { price: 12.99, unit: 'lb', pricePerUnit: 12.99 },
        'walmart': { price: 6.98, unit: 'lb', pricePerUnit: 6.98 },
        'target': { price: 7.49, unit: 'lb', pricePerUnit: 7.49 },
        'aldi': { price: 5.99, unit: 'lb', pricePerUnit: 5.99 }
      }
    };

    const searchTerm = product.toLowerCase();
    const storeData = productDatabase[searchTerm];
    
    if (!storeData || !storeData[store.chain]) {
      return null;
    }

    const baseData = storeData[store.chain];
    
    // Adicionar variação de preço baseada em localização
    const locationMultiplier = this.getLocationPriceMultiplier(store.zipCode);
    const adjustedPrice = baseData.price * locationMultiplier;
    
    // Simular promoções (20% chance)
    const hasPromotion = Math.random() < 0.2;
    const promotions = hasPromotion ? [{
      type: 'sale' as const,
      description: 'Weekly Special',
      originalPrice: adjustedPrice,
      savings: adjustedPrice * 0.15,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }] : [];

    const finalPrice = hasPromotion ? adjustedPrice * 0.85 : adjustedPrice;

    return {
      price: Math.round(finalPrice * 100) / 100,
      unit: baseData.unit,
      pricePerUnit: Math.round((finalPrice / this.getUnitMultiplier(baseData.unit)) * 100) / 100,
      availability: Math.random() > 0.05, // 95% availability
      promotions,
      nutritionInfo: this.getNutritionInfo(searchTerm)
    };
  }

  private getLocationPriceMultiplier(zipCode: string): number {
    // Simular variação de preços por região
    const premiumZips = ['33131', '33130', '33109']; // Miami Beach, Brickell
    const affordableZips = ['33569', '33615', '33618']; // Suburbs

    if (premiumZips.includes(zipCode)) {
      return 1.15; // 15% mais caro
    } else if (affordableZips.includes(zipCode)) {
      return 0.92; // 8% mais barato
    }
    return 1.0; // Preço padrão
  }

  private getUnitMultiplier(unit: string): number {
    const multipliers: Record<string, number> = {
      'gallon': 1,
      'loaf': 1,
      'dozen': 12,
      'lb': 1,
      'oz': 16,
      'pack': 1
    };
    return multipliers[unit] || 1;
  }

  private getNutritionInfo(product: string): any {
    const nutrition: Record<string, any> = {
      'milk': { calories: 150, protein: 8, carbs: 12, fat: 8, sodium: 125 },
      'bread': { calories: 80, protein: 4, carbs: 15, fat: 1, sodium: 160 },
      'eggs': { calories: 70, protein: 6, carbs: 0, fat: 5, sodium: 70 },
      'bananas': { calories: 105, protein: 1, carbs: 27, fat: 0, sodium: 1 },
      'chicken breast': { calories: 165, protein: 31, carbs: 0, fat: 3.6, sodium: 74 }
    };
    return nutrition[product] || {};
  }

  private calculateDistance(
    lat1: number, lng1: number, 
    lat2: number, lng2: number
  ): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  async findNearbyStores(
    userLocation: GeoLocation,
    radiusMiles: number = 15
  ): Promise<FloridaStore[]> {
    return this.storeDatabase
      .map(store => ({
        ...store,
        distance: this.calculateDistance(
          userLocation.latitude, userLocation.longitude,
          store.latitude, store.longitude
        )
      }))
      .filter(store => store.distance! <= radiusMiles)
      .sort((a, b) => a.distance! - b.distance!);
  }

  async compareFloridaPrices(
    ingredients: string[],
    userLocation: GeoLocation,
    radiusMiles: number = 15
  ): Promise<FloridaPriceComparison[]> {
    const nearbyStores = await this.findNearbyStores(userLocation, radiusMiles);
    
    if (nearbyStores.length === 0) {
      throw new Error('No stores found within the specified radius');
    }

    const results: FloridaPriceComparison[] = [];

    for (const ingredient of ingredients) {
      const cacheKey = `${ingredient}-${userLocation.zipCode}`;
      
      // Check cache first (5 minute TTL)
      const cached = this.cache.get(cacheKey);
      if (cached && this.isCacheValid(cached)) {
        continue;
      }

      const storePrices: FloridaPriceData[] = [];
      
      // Scrape prices from all nearby stores
      for (const store of nearbyStores) {
        try {
          const priceData = await this.scrapeStorePrice(store, ingredient);
          if (priceData) {
            storePrices.push(priceData);
          }
        } catch (error) {
          console.error(`Error scraping ${store.name} for ${ingredient}:`, error);
        }
      }

      if (storePrices.length === 0) {
        continue;
      }

      // Sort by price
      const sortedPrices = storePrices.sort((a, b) => a.price - b.price);
      const bestPrice = sortedPrices[0];
      const prices = sortedPrices.map(p => p.price);
      const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

      // Generate recommendations
      const recommendations = {
        bestValue: sortedPrices[0],
        closest: storePrices.sort((a, b) => (a.store.distance || 0) - (b.store.distance || 0))[0],
        bestPromotions: storePrices.filter(p => p.promotions && p.promotions.length > 0)
          .sort((a, b) => (b.promotions?.[0]?.savings || 0) - (a.promotions?.[0]?.savings || 0))
          .slice(0, 3)
      };

      const estimatedSavings = Math.max(...prices) - Math.min(...prices);

      const comparison: FloridaPriceComparison = {
        ingredient,
        searchedAt: new Date(),
        userLocation,
        stores: sortedPrices,
        bestPrice,
        averagePrice: Math.round(averagePrice * 100) / 100,
        priceRange: {
          min: Math.min(...prices),
          max: Math.max(...prices)
        },
        recommendations,
        estimatedSavings: Math.round(estimatedSavings * 100) / 100
      };

      results.push(comparison);
      
      // Cache the result
      this.cache.set(cacheKey, storePrices);
    }

    return results;
  }

  private isCacheValid(cached: FloridaPriceData[]): boolean {
    if (cached.length === 0) return false;
    
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return cached[0].lastUpdated > fiveMinutesAgo;
  }

  async getStoreDetails(storeId: string): Promise<FloridaStore | null> {
    return this.storeDatabase.find(store => store.id === storeId) || null;
  }

  async searchStoresByChain(chain: FloridaStore['chain']): Promise<FloridaStore[]> {
    return this.storeDatabase.filter(store => store.chain === chain);
  }

  // Detectar localização do usuário via IP (em produção)
  async detectUserLocation(): Promise<GeoLocation> {
    // Em produção, isso usaria um serviço de geolocalização por IP
    // Para demo, retornamos Miami
    return {
      latitude: 25.7617,
      longitude: -80.1918,
      zipCode: '33131',
      city: 'Miami',
      state: 'FL'
    };
  }

  // Obter preço histórico (para implementação futura)
  async getPriceHistory(
    product: string, 
    storeId: string, 
    days: number = 30
  ): Promise<{ date: Date; price: number }[]> {
    // Mock de histórico de preços
    const history: { date: Date; price: number }[] = [];
    const basePrice = 5.99;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const variation = (Math.random() - 0.5) * 0.4; // ±20% variation
      const price = basePrice * (1 + variation);
      
      history.push({
        date,
        price: Math.round(price * 100) / 100
      });
    }
    
    return history;
  }

  // Zyte API management methods
  
  getZyteStatus(): { 
    enabled: boolean; 
    budgetStatus?: any; 
    error?: string 
  } {
    if (!this.zyteIntegrationEnabled) {
      return { enabled: false, error: 'Zyte API key not configured' };
    }

    try {
      const budgetStatus = this.zyteClient?.getBudgetStatus();
      return { 
        enabled: true, 
        budgetStatus 
      };
    } catch (error) {
      return { 
        enabled: false, 
        error: error.message 
      };
    }
  }

  async enableZyteIntegration(apiKey?: string): Promise<boolean> {
    try {
      if (apiKey) {
        process.env.ZYTE_API_KEY = apiKey;
      }
      
      await this.initializeZyteIntegration();
      return this.zyteIntegrationEnabled;
    } catch (error) {
      console.error('Failed to enable Zyte integration:', error);
      return false;
    }
  }

  disableZyteIntegration(): void {
    this.zyteIntegrationEnabled = false;
    this.zyteClient = null;
    console.log('🔄 Zyte integration disabled - using mock data only');
  }

  printZyteBudgetReport(): void {
    if (this.zyteIntegrationEnabled && this.zyteClient) {
      this.zyteClient.printBudgetReport();
    } else {
      console.log('ℹ️ Zyte integration not available');
    }
  }

  // Enhanced comparison with Zyte preference for Publix
  async compareFloridaPricesWithZyte(
    ingredients: string[],
    userLocation: GeoLocation,
    radiusMiles: number = 15,
    preferRealData: boolean = true
  ): Promise<FloridaPriceComparison[]> {
    
    console.log(`🔍 Comparing prices for ${ingredients.length} ingredients in Florida`);
    
    if (this.zyteIntegrationEnabled && preferRealData) {
      console.log('✅ Using Zyte API for real price data when available');
    } else {
      console.log('📊 Using mock data only');
    }

    return this.compareFloridaPrices(ingredients, userLocation, radiusMiles);
  }
}

export const floridaPriceService = FloridaPriceScrapingService.getInstance();