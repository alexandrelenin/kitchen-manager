# 🛒 Proposta: Sistema de Scraping de Preços - Supermercados da Flórida

## 📋 Visão Geral

Esta proposta detalha a implementação de um sistema de scraping de preços para supermercados na Flórida, focando em verificar preços de mercadorias em mercados próximos ao usuário. O sistema será baseado em web scraping ético e compliance legal.

---

## 🎯 Objetivos

### **Objetivo Principal**
Implementar um sistema que permita aos usuários do Kitchen Manager comparar preços de produtos em supermercados próximos à sua localização na Flórida.

### **Objetivos Específicos**
- **Scraping de preços** em tempo real de múltiplos supermercados
- **Geolocalização** para encontrar mercados próximos
- **Comparação inteligente** de preços por produto
- **Compliance legal** com regulamentações de scraping
- **Performance otimizada** para resposta rápida

---

## 🏪 Supermercados Alvo na Flórida

### **Tier 1 - Prioridade Alta**
#### **1. Publix** 🟢
- **Cobertura**: Maior rede da Flórida
- **Website**: publix.com
- **Online Shopping**: ✅ Disponível
- **Pickup/Delivery**: ✅ Via Instacart
- **Complexidade**: Média

#### **2. Winn-Dixie** 🟡
- **Cobertura**: Rede regional significativa
- **Website**: winndixie.com
- **Online Shopping**: ✅ Disponível
- **Pickup/Delivery**: ✅ Próprio + Instacart
- **Complexidade**: Média
- **Nota**: Sendo adquirida pela Aldi (2024-2025)

#### **3. Whole Foods** 🟠
- **Cobertura**: Mercados premium
- **Website**: wholefoodsmarket.com
- **Online Shopping**: ✅ Via Amazon
- **Pickup/Delivery**: ✅ Amazon Fresh
- **Complexidade**: Alta

### **Tier 2 - Prioridade Média**
#### **4. Walmart Grocery** 🟢
- **Cobertura**: Nacional com presença FL
- **Website**: walmart.com/grocery
- **Online Shopping**: ✅ Disponível
- **Pickup/Delivery**: ✅ Próprio
- **Complexidade**: Alta

#### **5. Target Grocery** 🟡
- **Cobertura**: Selecionada na Flórida
- **Website**: target.com
- **Online Shopping**: ✅ Disponível
- **Pickup/Delivery**: ✅ Shipt
- **Complexidade**: Média

#### **6. ALDI** 🟢
- **Cobertura**: Crescente na Flórida
- **Website**: aldi.us
- **Online Shopping**: ⏳ Limitado
- **Pickup/Delivery**: ✅ Via Instacart
- **Complexidade**: Baixa

---

## 🔧 Abordagens Técnicas

### **Opção 1: Zyte Scraper API** ⭐ **RECOMENDADA**

#### **Vantagens**
- ✅ **Anti-ban protection** nativo
- ✅ **JavaScript rendering** para SPAs
- ✅ **Geotargeting** para localização
- ✅ **AI-powered parsing** adaptativo
- ✅ **Legal compliance** integrada
- ✅ **Escalabilidade** enterprise
- ✅ **Suporte técnico** especializado

#### **Desvantagens**
- ❌ **Custo variável** baseado em complexidade
- ❌ **Dependência externa** de terceiros
- ❌ **Curva de aprendizado** inicial

#### **Custos Estimados**
- **Básico**: $0.001-0.01 por request
- **JavaScript**: $0.01-0.05 por request
- **Geotargeting**: +20-50% adicional
- **Estimativa mensal**: $200-800 (10k requests)

#### **Implementação**
```python
# Exemplo de integração Zyte API
import requests

def scrape_publix_prices(zip_code, product_list):
    api_key = "YOUR_ZYTE_API_KEY"
    
    for product in product_list:
        response = requests.post(
            'https://api.zyte.com/v1/extract',
            auth=(api_key, ''),
            json={
                'url': f'https://www.publix.com/search?q={product}',
                'httpResponseBody': True,
                'geolocation': 'US',
                'customData': {'zip_code': zip_code}
            }
        )
        
        # Process response
        yield parse_pricing_data(response.json())
```

### **Opção 2: Scraper Customizado**

#### **Vantagens**
- ✅ **Controle total** sobre o processo
- ✅ **Custo previsível** (infra + dev)
- ✅ **Customização** específica
- ✅ **Sem dependências** externas
- ✅ **Dados proprietários** completos

#### **Desvantagens**
- ❌ **Complexidade alta** de desenvolvimento
- ❌ **Manutenção constante** necessária
- ❌ **Anti-bot measures** para contornar
- ❌ **Aspectos legais** por conta própria
- ❌ **Tempo de desenvolvimento** longo

#### **Stack Tecnológico**
```typescript
// Arquitetura sugerida
Backend: Node.js + TypeScript
Scraping: Puppeteer + Stealth Plugin
Proxy: Rotating proxy pool
Database: PostgreSQL + Redis (cache)
Queue: Bull/Agenda para jobs
Monitoring: Prometheus + Grafana
```

#### **Implementação Base**
```typescript
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

class PublixScraper {
  private browser: Browser;
  
  async scrapeProductPrices(zipCode: string, products: string[]) {
    const page = await this.browser.newPage();
    
    // Set geolocation
    await page.setGeolocation({
      latitude: this.getLatFromZip(zipCode),
      longitude: this.getLngFromZip(zipCode)
    });
    
    const results = [];
    
    for (const product of products) {
      await page.goto(`https://www.publix.com/search?q=${product}`);
      
      // Wait for prices to load
      await page.waitForSelector('.price-display');
      
      const prices = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.product-card')).map(card => ({
          name: card.querySelector('.product-name')?.textContent,
          price: card.querySelector('.price-display')?.textContent,
          unit: card.querySelector('.unit-price')?.textContent,
          availability: card.querySelector('.availability')?.textContent
        }));
      });
      
      results.push({ product, prices });
    }
    
    return results;
  }
}
```

---

## 📍 Sistema de Geolocalização

### **Funcionalidades**
1. **Detecção automática** de localização do usuário
2. **Busca por ZIP code** ou endereço
3. **Cálculo de distância** para lojas próximas
4. **Filtros de raio** (5, 10, 15, 25 milhas)
5. **Mapeamento de lojas** por coordenadas

### **Implementação**
```typescript
interface StoreLocation {
  id: string;
  chain: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;
  zipCode: string;
  phone: string;
  hours: StoreHours;
}

class GeolocationService {
  async findNearbyStores(
    userLat: number, 
    userLng: number, 
    radiusMiles: number = 10
  ): Promise<StoreLocation[]> {
    
    const stores = await this.getAllFloridaStores();
    
    return stores
      .map(store => ({
        ...store,
        distance: this.calculateDistance(
          userLat, userLng, 
          store.latitude, store.longitude
        )
      }))
      .filter(store => store.distance <= radiusMiles)
      .sort((a, b) => a.distance - b.distance);
  }
  
  private calculateDistance(
    lat1: number, lng1: number, 
    lat2: number, lng2: number
  ): number {
    // Haversine formula implementation
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}
```

---

## 🔒 Compliance Legal

### **Aspectos Legais na Flórida**
1. **Terms of Service**: Análise individual por site
2. **Copyright**: Não republicar dados sem permissão
3. **Rate Limiting**: Respeitar robots.txt
4. **Data Usage**: Uso para comparação pessoal
5. **No Login**: Apenas dados públicos

### **Implementação de Compliance**
```typescript
class ComplianceManager {
  private robotsCache = new Map<string, RobotsTxt>();
  
  async checkScrapingPermission(url: string): Promise<boolean> {
    const domain = new URL(url).hostname;
    
    // Check robots.txt
    const robots = await this.getRobotsTxt(domain);
    if (!robots.isAllowed('*', url)) {
      return false;
    }
    
    // Check rate limits
    const lastRequest = await this.getLastRequestTime(domain);
    const minInterval = robots.crawlDelay || 1000;
    
    if (Date.now() - lastRequest < minInterval) {
      await this.wait(minInterval - (Date.now() - lastRequest));
    }
    
    return true;
  }
  
  async respectRateLimits(domain: string): Promise<void> {
    const config = this.getRateLimitConfig(domain);
    await this.wait(config.delayMs);
  }
}
```

---

## 🏗️ Arquitetura do Sistema

### **Componentes Principais**

#### **1. Scraping Engine**
```typescript
// Core scraping service
class PriceScrapingService {
  private scrapers: Map<string, StoreScraper>;
  private queue: Queue;
  private cache: Redis;
  
  async scrapePrice(
    store: string, 
    product: string, 
    location: GeoLocation
  ): Promise<PriceData> {
    
    const cacheKey = `${store}:${product}:${location.zipCode}`;
    const cached = await this.cache.get(cacheKey);
    
    if (cached && !this.isExpired(cached)) {
      return cached;
    }
    
    const scraper = this.scrapers.get(store);
    const result = await scraper.scrapeProduct(product, location);
    
    await this.cache.setex(cacheKey, 3600, result); // 1 hour cache
    return result;
  }
}
```

#### **2. Data Processing**
```typescript
interface PriceData {
  product: string;
  store: string;
  price: number;
  unit: string;
  availability: boolean;
  lastUpdated: Date;
  location: StoreLocation;
  promotions?: Promotion[];
}

class PriceProcessor {
  async normalizePrice(rawPrice: string): Promise<number> {
    // Remove currency symbols, normalize units
    return parseFloat(rawPrice.replace(/[$,]/g, ''));
  }
  
  async detectPromotions(priceData: PriceData): Promise<Promotion[]> {
    // Analyze for sales, BOGO, etc.
    return [];
  }
}
```

#### **3. Comparison Engine**
```typescript
class PriceComparisonEngine {
  async compareProducts(
    products: string[],
    userLocation: GeoLocation,
    radius: number = 10
  ): Promise<ComparisonResult[]> {
    
    const nearbyStores = await this.geolocationService
      .findNearbyStores(userLocation.lat, userLocation.lng, radius);
    
    const results: ComparisonResult[] = [];
    
    for (const product of products) {
      const storePrices = await Promise.all(
        nearbyStores.map(store => 
          this.scrapePrice(store.chain, product, store)
        )
      );
      
      const comparison = this.analyzeComparison(product, storePrices);
      results.push(comparison);
    }
    
    return results;
  }
}
```

---

## 📊 Performance e Escalabilidade

### **Métricas de Performance**
- **Tempo de resposta**: < 3s por produto
- **Concorrência**: 50+ requests simultâneos
- **Cache hit rate**: 80%+
- **Uptime**: 99.9%
- **Rate limits**: Respeitados 100%

### **Otimizações**
1. **Cache inteligente** com TTL variável
2. **Request batching** para eficiência
3. **Proxy rotation** para escalabilidade
4. **CDN** para dados estáticos
5. **Database indexing** otimizado

### **Monitoramento**
```typescript
class MonitoringService {
  async trackScrapingMetrics(store: string, success: boolean, responseTime: number) {
    await this.prometheus.histogram
      .labels({ store, status: success ? 'success' : 'failure' })
      .observe(responseTime);
  }
  
  async alertOnFailures(store: string, failureRate: number) {
    if (failureRate > 0.1) { // 10% failure rate
      await this.slack.sendAlert(`High failure rate for ${store}: ${failureRate}`);
    }
  }
}
```

---

## 💰 Análise de Custos

### **Opção 1: Zyte Scraper API**
| Componente | Custo Mensal | Descrição |
|------------|--------------|-----------|
| Zyte API | $200-800 | 10k-50k requests |
| Hosting | $50-100 | Backend services |
| Database | $30-50 | PostgreSQL managed |
| Monitoring | $20-30 | Logs e metrics |
| **Total** | **$300-980** | **Solução completa** |

### **Opção 2: Scraper Customizado**
| Componente | Custo Mensal | Descrição |
|------------|--------------|-----------|
| Desenvolvimento | $5000-8000 | 1-2 meses dev |
| Hosting | $100-200 | Alta performance |
| Proxies | $200-500 | Residential proxies |
| Database | $50-100 | PostgreSQL + Redis |
| Monitoring | $50-100 | Comprehensive |
| Manutenção | $1000-2000 | Ongoing updates |
| **Total** | **$1400-2900** | **Mensal + dev inicial** |

---

## 🚀 Roadmap de Implementação

### **Fase 1: MVP (4-6 semanas)**
- ✅ **Zyte API integration** básica
- ✅ **Publix + Winn-Dixie** scraping
- ✅ **Geolocalização** por ZIP code
- ✅ **UI básica** de comparação
- ✅ **Cache** simples implementado

### **Fase 2: Expansão (6-8 semanas)**
- ✅ **Whole Foods + Walmart** adicionados
- ✅ **Geolocalização** por GPS
- ✅ **Filtros avançados** (raio, preço)
- ✅ **Alertas** de preços
- ✅ **API pública** para terceiros

### **Fase 3: Otimização (4-6 semanas)**
- ✅ **Target + ALDI** adicionados
- ✅ **ML** para detecção de promoções
- ✅ **Análise de tendências** de preços
- ✅ **Mobile app** nativo
- ✅ **Notificações push** de ofertas

### **Fase 4: Escala (6-8 semanas)**
- ✅ **Outras redes** regionais
- ✅ **Predição de preços** com IA
- ✅ **Programa de afiliados**
- ✅ **Dashboard** para lojistas
- ✅ **Expansão** para outros estados

---

## 🎯 Recomendação Final

### **Estratégia Recomendada: Zyte Scraper API**

#### **Justificativa**
1. **Time to market**: 4x mais rápido que desenvolvimento próprio
2. **Compliance**: Legal compliance nativa
3. **Escalabilidade**: Pronta para produção
4. **Custo inicial**: Menor investment inicial
5. **Risk mitigation**: Suporte técnico especializado

#### **Implementação Sugerida**
```typescript
// Integração com Kitchen Manager existente
class FloridaPriceScrapingService {
  constructor(
    private zyteApi: ZyteScraperAPI,
    private geoService: GeolocationService,
    private cacheService: CacheService
  ) {}
  
  async getFloridaPrices(
    ingredients: string[],
    userLocation: GeoLocation
  ): Promise<FloridaPriceComparison[]> {
    
    const nearbyStores = await this.geoService
      .findNearbyStores(userLocation, 15); // 15 miles
    
    const results = await Promise.all(
      ingredients.map(ingredient => 
        this.compareIngredientPrices(ingredient, nearbyStores)
      )
    );
    
    return results.map(result => ({
      ...result,
      recommendations: this.generateRecommendations(result)
    }));
  }
}
```

### **Próximos Passos**
1. **Setup Zyte account** e configuração inicial
2. **Desenvolvimento** do módulo Florida pricing
3. **Integração** com Kitchen Manager existente
4. **Testes** com usuários beta na Flórida
5. **Launch** e monitoramento

---

## 📋 Considerações Finais

### **Vantagens da Solução**
- **Dados em tempo real** de preços locais
- **Compliance legal** garantida
- **Escalabilidade** para crescimento
- **UX superior** para usuários da Flórida
- **Competitive advantage** no mercado

### **Riscos e Mitigações**
- **Mudanças nos sites**: Zyte adapta automaticamente
- **Blocking**: Anti-ban protection nativa
- **Custos**: Modelo pay-per-use controlável
- **Legal**: Compliance framework integrado

### **ROI Esperado**
- **Usuários FL**: +40% engagement
- **Retention**: +25% para usuários locais
- **Monetização**: Partnerships com supermercados
- **Diferenciação**: Unique value proposition

---

**Status**: 📋 **PROPOSTA** - Aguardando aprovação  
**Data**: 09/07/2025  
**Versão**: 1.0  
**Próxima fase**: Implementação MVP com Zyte API

> 🤖 **Generated with [Claude Code](https://claude.ai/code)**  
> **Co-Authored-By: Claude <noreply@anthropic.com>**