# 🔑 Configuração de APIs Externas

## Como Configurar APIs de Receitas Reais

### 1. 🥄 Spoonacular API (Principal)

**Passo 1**: Registro
- Acesse: https://spoonacular.com/food-api
- Clique em "Get Started" → "Sign Up"
- Preencha dados e confirme email

**Passo 2**: Obter API Key
- Faça login em: https://spoonacular.com/food-api/console
- Vá para "My Console"
- Copie sua API Key

**Passo 3**: Configurar no projeto
```bash
# No arquivo .env
VITE_SPOONACULAR_API_KEY=sua_chave_aqui
```

### 2. 🍽️ Edamam Recipe API (Secundária)

**Passo 1**: Registro
- Acesse: https://developer.edamam.com/
- Clique em "Get Started"
- Selecione "Recipe Search API"
- Crie conta e confirme email

**Passo 2**: Obter credenciais
- Vá para seu dashboard
- Anote:
  - Application ID
  - Application Key

**Passo 3**: Configurar no projeto
```bash
# No arquivo .env
VITE_EDAMAM_APP_ID=seu_app_id_aqui
VITE_EDAMAM_APP_KEY=sua_chave_aqui
```

### 3. ⚙️ Configuração Final

1. **Copie o arquivo de exemplo**:
   ```bash
   cp .env.example .env
   ```

2. **Edite o arquivo .env** com suas chaves reais

3. **Reinicie o servidor**:
   ```bash
   npm run dev
   ```

### 4. 🧪 Teste das APIs

1. Vá para a seção "Banco de Receitas" no app
2. Teste a busca por receitas
3. Verifique se aparecem receitas reais (não mock)

### 5. 📊 Limites das APIs

#### Spoonacular (Gratuito)
- **150 requests/dia**
- **1 request/segundo**
- Upgrade: $0.004/request

#### Edamam (Gratuito)
- **5 requests/minuto**
- **10,000 requests/mês**
- Upgrade: Planos pagos disponíveis

### 6. 🔧 Resolução de Problemas

**Erro: "API key inválida"**
- Verifique se copiou a chave corretamente
- Confirme que a conta está ativa

**Erro: "Limit exceeded"**
- Você excedeu o limite gratuito
- Aguarde reset (24h) ou considere upgrade

**Erro: "Network error"**
- Verifique conexão com internet
- APIs podem estar temporariamente indisponíveis

### 7. 🔄 Funcionalidades Disponíveis

Com APIs configuradas, você terá acesso a:
- **Milhares de receitas** internacionais
- **Informações nutricionais** detalhadas
- **Filtros avançados** por dieta, tempo, etc.
- **Imagens reais** das receitas
- **Instruções passo-a-passo**

### 8. 🛡️ Segurança

- **Nunca commite** suas chaves reais
- Arquivo `.env` está no `.gitignore`
- Use `.env.example` como referência
- Regenere chaves se comprometidas

### 9. 📈 Monitoramento

- Spoonacular: https://spoonacular.com/food-api/console
- Edamam: https://developer.edamam.com/admin

Monitore seu uso para não exceder limites gratuitos.

---

**Dica**: Configure as APIs para ter acesso a receitas reais, mas o app continua funcionando mesmo sem elas (modo mock).