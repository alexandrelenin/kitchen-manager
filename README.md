# Kitchen Manager - PWA de Gestão de Cozinha

## Descrição

Kitchen Manager é um aplicativo Progressive Web App (PWA) completo para gestão doméstica de cozinha, desenvolvido com React + TypeScript + Tailwind CSS. O aplicativo oferece funcionalidades avançadas para planejamento de cardápio semanal/mensal e controle inteligente de estoque de ingredientes.

## ✨ Funcionalidades Principais

### 🏠 Gestão de Membros da Casa
- Cadastro de membros da família com preferências alimentares
- Sistema de restrições alimentares (vegetariano, vegano, etc.)
- Controle de alergias alimentares
- Configuração personalizada para cada membro

### 📦 Gestão de Estoque
- CRUD completo de ingredientes com categorização
- Controle inteligente de quantidade e validade
- Alertas visuais para itens próximos ao vencimento
- Sistema de busca e filtros avançados
- Categorização automática por tipo de alimento

### 📚 Sistema de Receitas
- Base de dados pré-populada com receitas clássicas do Le Cordon Bleu
- CRUD completo de receitas próprias
- Sistema de avaliação com estrelas (1-5)
- Comentários e notas dos usuários
- Categorização por tipo de prato, refeição e dificuldade
- Sistema de tags para organização

### 📅 Planejamento de Cardápio
- Interface drag-and-drop intuitiva para planejar refeições
- Visualização em calendário semanal
- Sugestões automáticas baseadas em ingredientes disponíveis
- Filtros por preferências dos membros da família
- Planejamento para diferentes tipos de refeição (café, almoço, jantar, lanche)

### 🛒 Lista de Compras Inteligente
- Geração automática baseada no cardápio da semana
- Comparação automática com estoque atual
- Cálculo inteligente de quantidades por número de pessoas
- Interface para marcar itens como comprados
- Organização automática por categoria de alimento
- Progresso visual das compras

### 🎉 Eventos Especiais
- Criação de eventos (churrascos, jantares, festas)
- Configuração de número de convidados
- Ajuste automático da lista de compras
- Receitas específicas para ocasiões especiais

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 19** - Biblioteca para interfaces de usuário
- **TypeScript** - Superset tipado do JavaScript
- **Tailwind CSS** - Framework CSS utilitário
- **Headless UI** - Componentes acessíveis sem estilo
- **Heroicons** - Biblioteca de ícones SVG

### Persistência
- **IndexedDB** - Banco de dados local do navegador
- **Dexie.js** - Wrapper moderno para IndexedDB
- **Armazenamento offline** - Funciona completamente offline

### PWA
- **Service Worker** - Cache inteligente e funcionamento offline
- **Web App Manifest** - Instalação como app nativo
- **Responsive Design** - Otimizado para mobile-first

### Build Tools
- **Vite** - Build tool moderna e rápida
- **PostCSS** - Processamento de CSS
- **ESLint** - Linting de código

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone <repository-url>
cd kitchen-manager

# Instale as dependências
npm install

# Execute em modo de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build de produção
npm run preview
```

### Configuração PWA
O aplicativo já está configurado como PWA e pode ser instalado diretamente do navegador. As funcionalidades offline funcionam automaticamente após a primeira visita.

## 📱 Funcionalidades PWA

- **Instalável** - Pode ser instalado como app nativo
- **Offline First** - Funciona completamente offline
- **Responsivo** - Otimizado para todos os dispositivos
- **Cache Inteligente** - Estratégias de cache otimizadas
- **Sincronização** - Sync automática quando online

## 🎨 Design e UX

### Mobile-First
- Interface otimizada para dispositivos móveis
- Gestos touch-friendly (swipe, drag, pinch)
- Navegação intuitiva com sidebar responsiva

### Acessibilidade
- Contraste adequado de cores
- Suporte completo a screen readers
- Navegação por teclado
- Tamanhos de fonte ajustáveis

### Experiência do Usuário
- Feedback visual para todas as ações
- Estados de loading e error bem definidos
- Confirmações para ações destrutivas
- Animações suaves e naturais

## 📊 Estrutura do Banco de Dados

### Tabelas Principais
- **houseMembers** - Membros da casa e preferências
- **ingredients** - Estoque de ingredientes
- **recipes** - Receitas e avaliações
- **mealPlans** - Planejamento de refeições
- **shoppingList** - Lista de compras
- **events** - Eventos especiais
- **settings** - Configurações do usuário

### Relacionamentos
- Receitas podem ter múltiplos ingredientes
- Planejamentos referenciam receitas e membros
- Lista de compras é gerada a partir dos planejamentos
- Eventos podem incluir múltiplas receitas

## 🍽️ Receitas Pré-Instaladas

O aplicativo vem com receitas clássicas do Le Cordon Bleu:
- **Boeuf Bourguignon** - Ensopado francês clássico
- **Coq au Vin** - Frango ao vinho tinto
- **Ratatouille** - Refogado provençal de legumes
- **Bouillabaisse** - Sopa de peixe de Marselha
- **Tarte Tatin** - Torta de maçã invertida
- **Soufflé au Chocolat** - Soufflé de chocolate
- **Cassoulet** - Ensopado de feijão com carnes
- **Confit de Canard** - Pato confitado

## 🔧 Configurações Avançadas

### Personalização
- Tamanho da família configurável
- Horários de refeição preferidos
- Porções padrão por receita
- Dias de compra da semana
- Moeda local para custos

### Performance
- Lazy loading de componentes
- Otimização de imagens
- Bundle splitting automático
- Cache eficiente de dados

## 🚀 Próximas Funcionalidades

### Em Desenvolvimento
- Sistema de sugestões inteligentes baseado em IA
- Calculadora nutricional detalhada
- Compartilhamento de receitas entre usuários
- Integração com APIs de supermercados
- Backup e sincronização na nuvem

### Planejado
- Modo escuro/claro
- Múltiplos idiomas
- Importação/exportação de dados
- Notificações push
- Integração com assistentes de voz

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, leia as [diretrizes de contribuição](CONTRIBUTING.md) antes de submeter pull requests.

## 📞 Suporte

Para suporte ou dúvidas, abra uma [issue](https://github.com/your-username/kitchen-manager/issues) no GitHub.

---

**Kitchen Manager** - Transformando a gestão da sua cozinha com tecnologia moderna e design intuitivo! 🍳✨