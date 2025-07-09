// Serviço de Integração com Supermercados
// Baseado em pesquisa de APIs disponíveis no Brasil

export interface SupermarketProduct {
  id: string;
  name: string;
  brand?: string;
  category: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  unit: string;
  imageUrl?: string;
  availability: boolean;
  store: SupermarketStore;
  description?: string;
  barcode?: string;
  promotionEndDate?: Date;
}

export interface SupermarketStore {
  id: string;
  name: string;
  chain: SupermarketChain;
  address?: string;
  distance?: number;
  deliveryAvailable: boolean;
  deliveryFee?: number;
  minOrderValue?: number;
  estimatedDeliveryTime?: number; // em minutos
  rating?: number;
  logoUrl: string;
}

export interface SupermarketChain {
  id: string;
  name: string;
  displayName: string;
  color: string;
  logoUrl: string;
  apiEndpoint?: string;
  hasDelivery: boolean;
  supportedRegions: string[];
}

export interface PriceComparison {
  ingredient: string;
  searchedAt: Date;
  products: SupermarketProduct[];
  bestPrice: SupermarketProduct;
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  recommendations: PriceRecommendation[];
}

export interface PriceRecommendation {
  type: 'best_price' | 'best_value' | 'fastest_delivery' | 'bulk_discount';
  product: SupermarketProduct;
  reason: string;
  savings?: number;
}

export interface DeliveryOption {
  provider: 'ifood' | 'rappi' | 'uber_eats' | 'native';
  available: boolean;
  fee: number;
  estimatedTime: number;
  minOrderValue: number;
}

export interface ShoppingCart {
  id: string;
  userId: string;
  items: CartItem[];
  store: SupermarketStore;
  totalValue: number;
  deliveryFee: number;
  estimatedDeliveryTime: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  product: SupermarketProduct;
  quantity: number;
  notes?: string;
  substitutions?: SupermarketProduct[];
}

export interface PriceAlert {
  id: string;
  userId: string;
  ingredient: string;
  targetPrice: number;
  currentPrice: number;
  store?: SupermarketStore;
  isActive: boolean;
  createdAt: Date;
  triggeredAt?: Date;
}

export interface PriceHistory {
  ingredient: string;
  store: SupermarketStore;
  history: Array<{
    date: Date;
    price: number;
    promotion?: boolean;
  }>;
}

class SupermarketIntegrationService {
  private static instance: SupermarketIntegrationService;
  private readonly chains: SupermarketChain[];
  private readonly mockStores: SupermarketStore[];
  private readonly mockProducts: SupermarketProduct[];
  private readonly priceHistory: Map<string, PriceHistory>;

  static getInstance(): SupermarketIntegrationService {
    if (!SupermarketIntegrationService.instance) {
      SupermarketIntegrationService.instance = new SupermarketIntegrationService();
    }
    return SupermarketIntegrationService.instance;
  }

  constructor() {
    this.priceHistory = new Map();
    this.chains = this.initializeSupermarketChains();
    this.mockStores = this.initializeMockStores();
    this.mockProducts = this.initializeMockProducts();
    this.initializePriceHistory();
  }

  private initializeSupermarketChains(): SupermarketChain[] {
    return [
      {
        id: 'pao-de-acucar',
        name: 'pao_de_acucar',
        displayName: 'Pão de Açúcar',
        color: '#00A859',
        logoUrl: 'https://logoeps.com/wp-content/uploads/2013/03/pao-de-acucar-vector-logo.png',
        hasDelivery: true,
        supportedRegions: ['SP', 'RJ', 'MG', 'PR', 'SC', 'RS', 'GO', 'DF', 'BA', 'PE']
      },
      {
        id: 'extra',
        name: 'extra',
        displayName: 'Extra',
        color: '#FF6B35',
        logoUrl: 'https://logoeps.com/wp-content/uploads/2013/03/extra-vector-logo.png',
        hasDelivery: true,
        supportedRegions: ['SP', 'RJ', 'MG', 'PR', 'SC', 'RS', 'GO', 'DF', 'BA', 'PE', 'CE']
      },
      {
        id: 'carrefour',
        name: 'carrefour',
        displayName: 'Carrefour',
        color: '#0066CC',
        logoUrl: 'https://logoeps.com/wp-content/uploads/2013/03/carrefour-vector-logo.png',
        hasDelivery: true,
        supportedRegions: ['SP', 'RJ', 'MG', 'PR', 'SC', 'RS', 'GO', 'DF', 'BA', 'PE', 'CE', 'MA']
      },
      {
        id: 'big',
        name: 'big',
        displayName: 'Big',
        color: '#FFD700',
        logoUrl: 'https://logoeps.com/wp-content/uploads/2013/03/big-vector-logo.png',
        hasDelivery: true,
        supportedRegions: ['SP', 'RJ', 'MG', 'PR', 'PE', 'CE', 'BA', 'GO']
      },
      {
        id: 'sendas',
        name: 'sendas',
        displayName: 'Sendas',
        color: '#E31837',
        logoUrl: 'https://logoeps.com/wp-content/uploads/2013/03/sendas-vector-logo.png',
        hasDelivery: true,
        supportedRegions: ['RJ', 'ES']
      },
      {
        id: 'atacadao',
        name: 'atacadao',
        displayName: 'Atacadão',
        color: '#FF0000',
        logoUrl: 'https://logoeps.com/wp-content/uploads/2013/03/atacadao-vector-logo.png',
        hasDelivery: false,
        supportedRegions: ['SP', 'RJ', 'MG', 'PR', 'SC', 'RS', 'GO', 'DF', 'BA', 'PE', 'CE', 'MA', 'PA']
      }
    ];
  }

  private initializeMockStores(): SupermarketStore[] {
    return [
      {
        id: 'pda-jardins',
        name: 'Pão de Açúcar Jardins',
        chain: this.chains[0],
        address: 'Rua Augusta, 2690 - Jardins, São Paulo - SP',
        distance: 1.2,
        deliveryAvailable: true,
        deliveryFee: 4.99,
        minOrderValue: 50.00,
        estimatedDeliveryTime: 45,
        rating: 4.5,
        logoUrl: this.chains[0].logoUrl
      },
      {
        id: 'extra-paulista',
        name: 'Extra Hiper Paulista',
        chain: this.chains[1],
        address: 'Av. Paulista, 2073 - Bela Vista, São Paulo - SP',
        distance: 2.1,
        deliveryAvailable: true,
        deliveryFee: 3.99,
        minOrderValue: 40.00,
        estimatedDeliveryTime: 60,
        rating: 4.2,
        logoUrl: this.chains[1].logoUrl
      },
      {
        id: 'carrefour-morumbi',
        name: 'Carrefour Morumbi',
        chain: this.chains[2],
        address: 'Av. Roque Petroni Jr., 1089 - Morumbi, São Paulo - SP',
        distance: 3.5,
        deliveryAvailable: true,
        deliveryFee: 5.99,
        minOrderValue: 60.00,
        estimatedDeliveryTime: 90,
        rating: 4.0,
        logoUrl: this.chains[2].logoUrl
      },
      {
        id: 'big-ibirapuera',
        name: 'Big Ibirapuera',
        chain: this.chains[3],
        address: 'Av. Ibirapuera, 3103 - Ibirapuera, São Paulo - SP',
        distance: 2.8,
        deliveryAvailable: true,
        deliveryFee: 4.49,
        minOrderValue: 45.00,
        estimatedDeliveryTime: 75,
        rating: 4.3,
        logoUrl: this.chains[3].logoUrl
      }
    ];
  }

  private initializeMockProducts(): SupermarketProduct[] {
    const products: SupermarketProduct[] = [];
    
    // Produtos básicos com variações de preço por loja
    const baseProducts = [
      // Laticínios
      {
        name: 'Leite Integral',
        brand: 'Parmalat',
        category: 'Laticínios',
        unit: '1L',
        description: 'Leite integral UHT',
        barcode: '7891234567890'
      },
      {
        name: 'Manteiga',
        brand: 'Aviação',
        category: 'Laticínios',
        unit: '200g',
        description: 'Manteiga com sal',
        barcode: '7891234567901'
      },
      {
        name: 'Queijo Mussarela',
        brand: 'Tirolez',
        category: 'Laticínios',
        unit: '150g',
        description: 'Queijo mussarela fatiado',
        barcode: '7891234567902'
      },
      {
        name: 'Iogurte Natural',
        brand: 'Danone',
        category: 'Laticínios',
        unit: '170g',
        description: 'Iogurte natural integral',
        barcode: '7891234567903'
      },
      {
        name: 'Requeijão',
        brand: 'Catupiry',
        category: 'Laticínios',
        unit: '250g',
        description: 'Requeijão cremoso',
        barcode: '7891234567904'
      },

      // Grãos e Cereais
      {
        name: 'Arroz Branco',
        brand: 'Tio João',
        category: 'Grãos',
        unit: '1kg',
        description: 'Arroz branco tipo 1',
        barcode: '7891234567891'
      },
      {
        name: 'Feijão Preto',
        brand: 'Camil',
        category: 'Grãos',
        unit: '1kg',
        description: 'Feijão preto tipo 1',
        barcode: '7891234567892'
      },
      {
        name: 'Feijão Carioca',
        brand: 'Camil',
        category: 'Grãos',
        unit: '1kg',
        description: 'Feijão carioca tipo 1',
        barcode: '7891234567905'
      },
      {
        name: 'Macarrão Espaguete',
        brand: 'Barilla',
        category: 'Grãos',
        unit: '500g',
        description: 'Macarrão espaguete semolina',
        barcode: '7891234567906'
      },
      {
        name: 'Aveia em Flocos',
        brand: 'Quaker',
        category: 'Grãos',
        unit: '200g',
        description: 'Aveia em flocos finos',
        barcode: '7891234567907'
      },

      // Óleos e Gorduras
      {
        name: 'Óleo de Soja',
        brand: 'Liza',
        category: 'Óleos',
        unit: '900ml',
        description: 'Óleo de soja refinado',
        barcode: '7891234567893'
      },
      {
        name: 'Azeite Extra Virgem',
        brand: 'Gallo',
        category: 'Óleos',
        unit: '500ml',
        description: 'Azeite de oliva extra virgem',
        barcode: '7891234567908'
      },

      // Açúcares e Adoçantes
      {
        name: 'Açúcar Cristal',
        brand: 'União',
        category: 'Açúcares',
        unit: '1kg',
        description: 'Açúcar cristal especial',
        barcode: '7891234567894'
      },
      {
        name: 'Açúcar Refinado',
        brand: 'União',
        category: 'Açúcares',
        unit: '1kg',
        description: 'Açúcar refinado especial',
        barcode: '7891234567909'
      },
      {
        name: 'Mel',
        brand: 'Karo',
        category: 'Açúcares',
        unit: '280g',
        description: 'Mel de abelhas puro',
        barcode: '7891234567910'
      },

      // Farinhas
      {
        name: 'Farinha de Trigo',
        brand: 'Dona Benta',
        category: 'Farinhas',
        unit: '1kg',
        description: 'Farinha de trigo especial',
        barcode: '7891234567895'
      },
      {
        name: 'Farinha de Mandioca',
        brand: 'Yoki',
        category: 'Farinhas',
        unit: '500g',
        description: 'Farinha de mandioca amarela',
        barcode: '7891234567911'
      },

      // Ovos
      {
        name: 'Ovos',
        brand: 'Granja Mantiqueira',
        category: 'Ovos',
        unit: '12 unidades',
        description: 'Ovos brancos grandes',
        barcode: '7891234567896'
      },

      // Carnes
      {
        name: 'Carne Moída',
        brand: 'Friboi',
        category: 'Carnes',
        unit: '1kg',
        description: 'Carne bovina moída primeira',
        barcode: '7891234567897'
      },
      {
        name: 'Frango Inteiro',
        brand: 'Sadia',
        category: 'Carnes',
        unit: '1kg',
        description: 'Frango inteiro congelado',
        barcode: '7891234567898'
      },
      {
        name: 'Peito de Frango',
        brand: 'Sadia',
        category: 'Carnes',
        unit: '1kg',
        description: 'Peito de frango sem osso',
        barcode: '7891234567912'
      },
      {
        name: 'Linguiça Calabresa',
        brand: 'Perdigão',
        category: 'Carnes',
        unit: '500g',
        description: 'Linguiça calabresa defumada',
        barcode: '7891234567913'
      },
      {
        name: 'Presunto Fatiado',
        brand: 'Sadia',
        category: 'Carnes',
        unit: '200g',
        description: 'Presunto cozido fatiado',
        barcode: '7891234567914'
      },

      // Hortifruti
      {
        name: 'Tomate',
        brand: 'Hortifruti',
        category: 'Hortifruti',
        unit: '1kg',
        description: 'Tomate salada',
        barcode: '7891234567899'
      },
      {
        name: 'Cebola',
        brand: 'Hortifruti',
        category: 'Hortifruti',
        unit: '1kg',
        description: 'Cebola amarela',
        barcode: '7891234567915'
      },
      {
        name: 'Alho',
        brand: 'Hortifruti',
        category: 'Hortifruti',
        unit: '100g',
        description: 'Alho roxo',
        barcode: '7891234567916'
      },
      {
        name: 'Batata',
        brand: 'Hortifruti',
        category: 'Hortifruti',
        unit: '1kg',
        description: 'Batata inglesa',
        barcode: '7891234567917'
      },
      {
        name: 'Cenoura',
        brand: 'Hortifruti',
        category: 'Hortifruti',
        unit: '1kg',
        description: 'Cenoura nacional',
        barcode: '7891234567918'
      },
      {
        name: 'Banana',
        brand: 'Hortifruti',
        category: 'Hortifruti',
        unit: '1kg',
        description: 'Banana prata',
        barcode: '7891234567919'
      },
      {
        name: 'Maçã',
        brand: 'Hortifruti',
        category: 'Hortifruti',
        unit: '1kg',
        description: 'Maçã gala',
        barcode: '7891234567920'
      },
      {
        name: 'Limão',
        brand: 'Hortifruti',
        category: 'Hortifruti',
        unit: '1kg',
        description: 'Limão tahiti',
        barcode: '7891234567921'
      },

      // Temperos e Condimentos
      {
        name: 'Sal Refinado',
        brand: 'Cisne',
        category: 'Temperos',
        unit: '1kg',
        description: 'Sal refinado iodado',
        barcode: '7891234567922'
      },
      {
        name: 'Pimenta do Reino',
        brand: 'Kitano',
        category: 'Temperos',
        unit: '30g',
        description: 'Pimenta do reino moída',
        barcode: '7891234567923'
      },
      {
        name: 'Orégano',
        brand: 'Kitano',
        category: 'Temperos',
        unit: '10g',
        description: 'Orégano desidratado',
        barcode: '7891234567924'
      },
      {
        name: 'Vinagre',
        brand: 'Castelo',
        category: 'Temperos',
        unit: '750ml',
        description: 'Vinagre de álcool',
        barcode: '7891234567925'
      },

      // Bebidas
      {
        name: 'Água Mineral',
        brand: 'Crystal',
        category: 'Bebidas',
        unit: '1,5L',
        description: 'Água mineral sem gás',
        barcode: '7891234567926'
      },
      {
        name: 'Refrigerante Cola',
        brand: 'Coca-Cola',
        category: 'Bebidas',
        unit: '2L',
        description: 'Refrigerante cola',
        barcode: '7891234567927'
      },
      {
        name: 'Suco de Laranja',
        brand: 'Del Valle',
        category: 'Bebidas',
        unit: '1L',
        description: 'Suco de laranja integral',
        barcode: '7891234567928'
      },
      {
        name: 'Café em Pó',
        brand: 'Pilão',
        category: 'Bebidas',
        unit: '500g',
        description: 'Café torrado e moído',
        barcode: '7891234567929'
      },

      // Congelados
      {
        name: 'Pão de Açúcar',
        brand: 'Wickbold',
        category: 'Padaria',
        unit: '500g',
        description: 'Pão de forma integral',
        barcode: '7891234567930'
      },
      {
        name: 'Pizza Congelada',
        brand: 'Sadia',
        category: 'Congelados',
        unit: '460g',
        description: 'Pizza margherita congelada',
        barcode: '7891234567931'
      }
    ];

    // Gerar produtos para cada loja com variações de preço
    this.mockStores.forEach((store, storeIndex) => {
      baseProducts.forEach((baseProduct, productIndex) => {
        // Variação de preço baseada na loja (Pão de Açúcar mais caro, Big mais barato)
        const basePrices = [
          // Laticínios
          4.99,  // Leite Integral
          8.99,  // Manteiga
          6.49,  // Queijo Mussarela
          3.99,  // Iogurte Natural
          7.49,  // Requeijão
          
          // Grãos e Cereais
          5.49,  // Arroz Branco
          6.99,  // Feijão Preto
          6.49,  // Feijão Carioca
          4.99,  // Macarrão Espaguete
          5.99,  // Aveia em Flocos
          
          // Óleos e Gorduras
          4.49,  // Óleo de Soja
          12.99, // Azeite Extra Virgem
          
          // Açúcares e Adoçantes
          3.99,  // Açúcar Cristal
          4.29,  // Açúcar Refinado
          9.99,  // Mel
          
          // Farinhas
          4.29,  // Farinha de Trigo
          3.99,  // Farinha de Mandioca
          
          // Ovos
          8.99,  // Ovos
          
          // Carnes
          18.99, // Carne Moída
          12.99, // Frango Inteiro
          16.99, // Peito de Frango
          9.99,  // Linguiça Calabresa
          8.49,  // Presunto Fatiado
          
          // Hortifruti
          7.99,  // Tomate
          4.99,  // Cebola
          12.99, // Alho
          3.99,  // Batata
          4.49,  // Cenoura
          5.99,  // Banana
          7.99,  // Maçã
          6.99,  // Limão
          
          // Temperos e Condimentos
          2.99,  // Sal Refinado
          4.99,  // Pimenta do Reino
          3.49,  // Orégano
          2.99,  // Vinagre
          
          // Bebidas
          2.49,  // Água Mineral
          6.99,  // Refrigerante Cola
          8.99,  // Suco de Laranja
          12.99, // Café em Pó
          
          // Congelados/Padaria
          4.99,  // Pão de Açúcar
          15.99  // Pizza Congelada
        ];
        const storeMultipliers = [1.2, 1.0, 0.95, 0.9]; // PDA, Extra, Carrefour, Big
        
        const basePrice = basePrices[productIndex];
        const price = basePrice * storeMultipliers[storeIndex];
        
        // Chance de promoção (20%)
        const hasPromotion = Math.random() < 0.2;
        const finalPrice = hasPromotion ? price * 0.85 : price;
        
        products.push({
          id: `${store.id}-${productIndex}`,
          name: baseProduct.name,
          brand: baseProduct.brand,
          category: baseProduct.category,
          price: Math.round(finalPrice * 100) / 100,
          originalPrice: hasPromotion ? Math.round(price * 100) / 100 : undefined,
          discount: hasPromotion ? Math.round((price - finalPrice) * 100) / 100 : undefined,
          unit: baseProduct.unit,
          imageUrl: `https://via.placeholder.com/150x150/64748b/ffffff?text=${encodeURIComponent(baseProduct.name)}`,
          availability: Math.random() > 0.1, // 90% disponibilidade
          store: store,
          description: baseProduct.description,
          barcode: baseProduct.barcode,
          promotionEndDate: hasPromotion ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : undefined
        });
      });
    });

    return products;
  }

  private initializePriceHistory(): void {
    // Gerar histórico de preços dos últimos 30 dias
    const ingredients = [
      'Leite Integral', 'Manteiga', 'Queijo Mussarela', 'Arroz Branco', 'Feijão Preto', 
      'Feijão Carioca', 'Macarrão Espaguete', 'Óleo de Soja', 'Azeite Extra Virgem', 
      'Açúcar Cristal', 'Farinha de Trigo', 'Ovos', 'Carne Moída', 'Frango Inteiro',
      'Peito de Frango', 'Tomate', 'Cebola', 'Alho', 'Batata', 'Cenoura'
    ];
    
    ingredients.forEach(ingredient => {
      this.mockStores.forEach(store => {
        const key = `${ingredient}-${store.id}`;
        const history: PriceHistory = {
          ingredient,
          store,
          history: []
        };

        // Gerar preços dos últimos 30 dias
        const basePrice = this.mockProducts.find(p => p.name === ingredient && p.store.id === store.id)?.price || 5.00;
        
        for (let i = 30; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          
          // Variação de preço de ±15%
          const variation = (Math.random() - 0.5) * 0.3;
          const price = basePrice * (1 + variation);
          
          history.history.push({
            date,
            price: Math.round(price * 100) / 100,
            promotion: Math.random() < 0.1 // 10% chance de promoção
          });
        }

        this.priceHistory.set(key, history);
      });
    });
  }

  // Buscar produtos por ingrediente
  async searchProducts(ingredient: string): Promise<PriceComparison> {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 800));

    const searchTerm = ingredient.toLowerCase().trim();
    
    // Primeiro, tentar busca exata
    let matchingProducts = this.mockProducts.filter(product => 
      product.name.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm) ||
      product.brand?.toLowerCase().includes(searchTerm)
    );

    // Se não encontrou nada, tentar busca com sinônimos comuns
    if (matchingProducts.length === 0) {
      const synonyms: Record<string, string[]> = {
        'manteiga': ['manteiga', 'butter'],
        'leite': ['leite', 'milk'],
        'queijo': ['queijo', 'mussarela', 'prato', 'cheese'],
        'arroz': ['arroz', 'rice'],
        'feijao': ['feijão', 'feijao', 'bean'],
        'oleo': ['óleo', 'oleo', 'oil'],
        'azeite': ['azeite', 'oliva', 'olive'],
        'acucar': ['açúcar', 'acucar', 'sugar'],
        'farinha': ['farinha', 'flour'],
        'ovo': ['ovo', 'ovos', 'egg'],
        'carne': ['carne', 'beef', 'boi'],
        'frango': ['frango', 'chicken', 'galinha'],
        'tomate': ['tomate', 'tomato'],
        'cebola': ['cebola', 'onion'],
        'alho': ['alho', 'garlic'],
        'batata': ['batata', 'potato'],
        'cenoura': ['cenoura', 'carrot'],
        'banana': ['banana'],
        'maca': ['maçã', 'maca', 'apple'],
        'limao': ['limão', 'limao', 'lemon'],
        'sal': ['sal', 'salt'],
        'pimenta': ['pimenta', 'pepper'],
        'oregano': ['orégano', 'oregano'],
        'vinagre': ['vinagre', 'vinegar'],
        'agua': ['água', 'agua', 'water'],
        'refrigerante': ['refrigerante', 'coca', 'pepsi', 'soda'],
        'suco': ['suco', 'juice'],
        'cafe': ['café', 'cafe', 'coffee'],
        'pao': ['pão', 'pao', 'bread'],
        'pizza': ['pizza']
      };

      // Buscar usando sinônimos
      for (const [, terms] of Object.entries(synonyms)) {
        if (terms.some(term => searchTerm.includes(term) || term.includes(searchTerm))) {
          matchingProducts = this.mockProducts.filter(product => 
            terms.some(term => 
              product.name.toLowerCase().includes(term) ||
              product.description?.toLowerCase().includes(term)
            )
          );
          if (matchingProducts.length > 0) break;
        }
      }
    }

    // Se ainda não encontrou, fazer busca mais ampla por palavras individuais
    if (matchingProducts.length === 0) {
      const words = searchTerm.split(' ').filter(word => word.length > 2);
      if (words.length > 0) {
        matchingProducts = this.mockProducts.filter(product => 
          words.some(word =>
            product.name.toLowerCase().includes(word) ||
            product.description?.toLowerCase().includes(word) ||
            product.category.toLowerCase().includes(word)
          )
        );
      }
    }

    if (matchingProducts.length === 0) {
      throw new Error(`Produto '${ingredient}' não encontrado. Tente termos como: leite, manteiga, arroz, feijão, carne, frango, tomate, etc.`);
    }

    // Ordenar por preço
    const sortedProducts = matchingProducts.sort((a, b) => a.price - b.price);
    const bestPrice = sortedProducts[0];
    const prices = sortedProducts.map(p => p.price);
    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

    // Gerar recomendações
    const recommendations = this.generateRecommendations(sortedProducts);

    return {
      ingredient,
      searchedAt: new Date(),
      products: sortedProducts,
      bestPrice,
      averagePrice: Math.round(averagePrice * 100) / 100,
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices)
      },
      recommendations
    };
  }

  private generateRecommendations(products: SupermarketProduct[]): PriceRecommendation[] {
    const recommendations: PriceRecommendation[] = [];
    const sortedByPrice = [...products].sort((a, b) => a.price - b.price);
    const sortedByDelivery = [...products].sort((a, b) => 
      (a.store.estimatedDeliveryTime || 999) - (b.store.estimatedDeliveryTime || 999)
    );

    // Melhor preço
    if (sortedByPrice.length > 0) {
      recommendations.push({
        type: 'best_price',
        product: sortedByPrice[0],
        reason: 'Menor preço encontrado',
        savings: sortedByPrice.length > 1 ? sortedByPrice[1].price - sortedByPrice[0].price : 0
      });
    }

    // Entrega mais rápida
    const fastestDelivery = sortedByDelivery.find(p => p.store.deliveryAvailable);
    if (fastestDelivery) {
      recommendations.push({
        type: 'fastest_delivery',
        product: fastestDelivery,
        reason: `Entrega em ${fastestDelivery.store.estimatedDeliveryTime} minutos`
      });
    }

    // Melhor custo-benefício (considerando frete)
    const bestValue = products.reduce((best, current) => {
      const currentTotal = current.price + (current.store.deliveryFee || 0);
      const bestTotal = best.price + (best.store.deliveryFee || 0);
      return currentTotal < bestTotal ? current : best;
    });

    recommendations.push({
      type: 'best_value',
      product: bestValue,
      reason: 'Melhor custo-benefício incluindo frete'
    });

    return recommendations;
  }

  // Obter lojas próximas
  async getNearbyStores(_userLocation: { lat: number; lng: number }, radius: number = 10): Promise<SupermarketStore[]> {
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500));

    // Filtrar lojas por distância (simulada)
    return this.mockStores.filter(store => (store.distance || 0) <= radius);
  }

  // Obter informações de delivery
  async getDeliveryOptions(storeId: string): Promise<DeliveryOption[]> {
    const store = this.mockStores.find(s => s.id === storeId);
    if (!store) {
      throw new Error('Loja não encontrada');
    }

    const options: DeliveryOption[] = [];

    // Delivery nativo da loja
    if (store.deliveryAvailable) {
      options.push({
        provider: 'native',
        available: true,
        fee: store.deliveryFee || 0,
        estimatedTime: store.estimatedDeliveryTime || 60,
        minOrderValue: store.minOrderValue || 0
      });
    }

    // Simular integração com apps de delivery
    const deliveryApps = ['ifood', 'rappi', 'uber_eats'] as const;
    deliveryApps.forEach(app => {
      if (Math.random() > 0.3) { // 70% chance de estar disponível
        options.push({
          provider: app,
          available: true,
          fee: Math.round((Math.random() * 5 + 2) * 100) / 100, // R$ 2-7
          estimatedTime: Math.floor(Math.random() * 30) + 30, // 30-60 min
          minOrderValue: Math.floor(Math.random() * 20) + 25 // R$ 25-45
        });
      }
    });

    return options;
  }

  // Obter histórico de preços
  async getPriceHistory(ingredient: string, storeId: string): Promise<PriceHistory | null> {
    const key = `${ingredient}-${storeId}`;
    return this.priceHistory.get(key) || null;
  }

  // Criar carrinho de compras
  async createShoppingCart(storeId: string, items: Omit<CartItem, 'substitutions'>[]): Promise<ShoppingCart> {
    const store = this.mockStores.find(s => s.id === storeId);
    if (!store) {
      throw new Error('Loja não encontrada');
    }

    const cartItems: CartItem[] = items.map(item => ({
      ...item,
      substitutions: [] // Pode ser implementado futuramente
    }));

    const totalValue = cartItems.reduce((total, item) => 
      total + (item.product.price * item.quantity), 0
    );

    return {
      id: `cart-${Date.now()}`,
      userId: 'user-1', // Seria obtido do contexto de usuário
      items: cartItems,
      store,
      totalValue: Math.round(totalValue * 100) / 100,
      deliveryFee: store.deliveryFee || 0,
      estimatedDeliveryTime: store.estimatedDeliveryTime || 60,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // Criar alerta de preço
  async createPriceAlert(ingredient: string, targetPrice: number, storeId?: string): Promise<PriceAlert> {
    const currentProduct = this.mockProducts.find(p => 
      p.name.toLowerCase().includes(ingredient.toLowerCase()) && 
      (!storeId || p.store.id === storeId)
    );

    return {
      id: `alert-${Date.now()}`,
      userId: 'user-1',
      ingredient,
      targetPrice,
      currentPrice: currentProduct?.price || 0,
      store: storeId ? this.mockStores.find(s => s.id === storeId) : undefined,
      isActive: true,
      createdAt: new Date()
    };
  }

  // Obter cadeias de supermercado
  getSupermarketChains(): SupermarketChain[] {
    return this.chains;
  }

  // Obter promoções ativas
  async getActivePromotions(storeId?: string): Promise<SupermarketProduct[]> {
    let promotions = this.mockProducts.filter(p => p.discount && p.discount > 0);
    
    if (storeId) {
      promotions = promotions.filter(p => p.store.id === storeId);
    }

    return promotions.sort((a, b) => (b.discount || 0) - (a.discount || 0));
  }

  // Comparar preços de uma lista de compras
  async compareShoppingList(ingredients: string[]): Promise<{
    ingredient: string;
    comparison: PriceComparison;
  }[]> {
    const comparisons = await Promise.all(
      ingredients.map(async ingredient => ({
        ingredient,
        comparison: await this.searchProducts(ingredient)
      }))
    );

    return comparisons;
  }
}

export const supermarketService = SupermarketIntegrationService.getInstance();