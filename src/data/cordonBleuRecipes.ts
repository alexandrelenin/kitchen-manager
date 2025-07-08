import type { Recipe } from '../types';

export const cordonBleuRecipes: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Boeuf Bourguignon',
    description: 'Clássico ensopado francês de carne bovina cozido lentamente em vinho tinto de Borgonha, com legumes aromáticos e cogumelos.',
    ingredients: [
      { ingredientId: '', name: 'Coxão mole', quantity: 1.5, unit: 'kg' },
      { ingredientId: '', name: 'Vinho tinto seco', quantity: 750, unit: 'mL' },
      { ingredientId: '', name: 'Bacon', quantity: 200, unit: 'g' },
      { ingredientId: '', name: 'Cebola pequena', quantity: 12, unit: 'un' },
      { ingredientId: '', name: 'Cenoura', quantity: 3, unit: 'un' },
      { ingredientId: '', name: 'Cogumelos Paris', quantity: 300, unit: 'g' },
      { ingredientId: '', name: 'Alho', quantity: 4, unit: 'dentes' },
      { ingredientId: '', name: 'Bouquet garni', quantity: 1, unit: 'un' },
      { ingredientId: '', name: 'Caldo de carne', quantity: 500, unit: 'mL' },
      { ingredientId: '', name: 'Manteiga', quantity: 50, unit: 'g' },
      { ingredientId: '', name: 'Farinha de trigo', quantity: 2, unit: 'colher (sopa)' }
    ],
    instructions: [
      'Corte a carne em cubos de 5cm e tempere com sal e pimenta',
      'Corte o bacon em cubos pequenos e refogue até dourar',
      'Na mesma panela, doure a carne de todos os lados',
      'Adicione as cebolas descascadas inteiras e as cenouras em rodelas',
      'Flambe com cognac e adicione o vinho tinto',
      'Adicione o bouquet garni, alho e caldo de carne',
      'Cozinhe em forno baixo (160°C) por 2 horas',
      'Adicione os cogumelos e cozinhe por mais 30 minutos',
      'Finalize com manteiga e farinha para engrossar o molho'
    ],
    prepTime: 30,
    cookTime: 150,
    servings: 6,
    difficulty: 'hard',
    category: 'Prato Principal',
    tags: ['Francês', 'Ensopado', 'Carne Bovina', 'Vinho'],
    rating: 5,
    reviews: [],
    source: 'cordon-bleu'
  },
  {
    name: 'Coq au Vin',
    description: 'Frango cozido em vinho tinto com bacon, cogumelos e ervas aromáticas, um dos pratos mais emblemáticos da culinária francesa.',
    ingredients: [
      { ingredientId: '', name: 'Frango inteiro', quantity: 1.5, unit: 'kg' },
      { ingredientId: '', name: 'Vinho tinto', quantity: 750, unit: 'mL' },
      { ingredientId: '', name: 'Bacon', quantity: 150, unit: 'g' },
      { ingredientId: '', name: 'Cebola pequena', quantity: 8, unit: 'un' },
      { ingredientId: '', name: 'Cogumelos', quantity: 250, unit: 'g' },
      { ingredientId: '', name: 'Alho', quantity: 3, unit: 'dentes' },
      { ingredientId: '', name: 'Tomilho', quantity: 2, unit: 'ramos' },
      { ingredientId: '', name: 'Louro', quantity: 2, unit: 'folhas' },
      { ingredientId: '', name: 'Caldo de galinha', quantity: 300, unit: 'mL' },
      { ingredientId: '', name: 'Manteiga', quantity: 30, unit: 'g' },
      { ingredientId: '', name: 'Farinha de trigo', quantity: 2, unit: 'colher (sopa)' }
    ],
    instructions: [
      'Corte o frango em pedaços e tempere com sal e pimenta',
      'Corte o bacon em cubos e refogue até dourar',
      'Doure os pedaços de frango na gordura do bacon',
      'Adicione as cebolas inteiras e doure levemente',
      'Flambe com cognac e adicione o vinho tinto',
      'Adicione as ervas aromáticas e o caldo',
      'Cozinhe tampado por 45 minutos em fogo baixo',
      'Refogue os cogumelos separadamente na manteiga',
      'Adicione os cogumelos ao frango nos últimos 10 minutos',
      'Finalize o molho com manteiga gelada'
    ],
    prepTime: 25,
    cookTime: 60,
    servings: 4,
    difficulty: 'medium',
    category: 'Prato Principal',
    tags: ['Francês', 'Frango', 'Vinho', 'Clássico'],
    rating: 5,
    reviews: [],
    source: 'cordon-bleu'
  },
  {
    name: 'Ratatouille',
    description: 'Refogado provençal de legumes de verão, harmoniosamente temperado com ervas da Provença.',
    ingredients: [
      { ingredientId: '', name: 'Berinjela', quantity: 2, unit: 'un' },
      { ingredientId: '', name: 'Abobrinha', quantity: 2, unit: 'un' },
      { ingredientId: '', name: 'Pimentão vermelho', quantity: 2, unit: 'un' },
      { ingredientId: '', name: 'Tomate maduro', quantity: 4, unit: 'un' },
      { ingredientId: '', name: 'Cebola', quantity: 2, unit: 'un' },
      { ingredientId: '', name: 'Alho', quantity: 4, unit: 'dentes' },
      { ingredientId: '', name: 'Azeite de oliva', quantity: 100, unit: 'mL' },
      { ingredientId: '', name: 'Tomilho', quantity: 2, unit: 'ramos' },
      { ingredientId: '', name: 'Manjericão', quantity: 10, unit: 'folhas' },
      { ingredientId: '', name: 'Louro', quantity: 2, unit: 'folhas' }
    ],
    instructions: [
      'Corte todos os legumes em cubos de tamanho similar',
      'Refogue a cebola e o alho no azeite até ficarem transparentes',
      'Adicione os pimentões e refogue por 5 minutos',
      'Acrescente a berinjela e cozinhe por mais 5 minutos',
      'Adicione a abobrinha e os tomates',
      'Tempere com sal, pimenta e ervas aromáticas',
      'Cozinhe em fogo baixo por 30-40 minutos, mexendo ocasionalmente',
      'Ajuste o tempero e finalize com manjericão fresco'
    ],
    prepTime: 20,
    cookTime: 45,
    servings: 6,
    difficulty: 'easy',
    category: 'Acompanhamento',
    tags: ['Francês', 'Vegetariano', 'Legumes', 'Provençal'],
    rating: 4,
    reviews: [],
    source: 'cordon-bleu'
  },
  {
    name: 'Bouillabaisse',
    description: 'Sopa de peixe provençal tradicional de Marselha, servida com rouille e croutons.',
    ingredients: [
      { ingredientId: '', name: 'Peixe branco (linguado)', quantity: 500, unit: 'g' },
      { ingredientId: '', name: 'Peixe vermelho (garoupa)', quantity: 500, unit: 'g' },
      { ingredientId: '', name: 'Camarão', quantity: 300, unit: 'g' },
      { ingredientId: '', name: 'Lula', quantity: 200, unit: 'g' },
      { ingredientId: '', name: 'Tomate', quantity: 3, unit: 'un' },
      { ingredientId: '', name: 'Cebola', quantity: 1, unit: 'un' },
      { ingredientId: '', name: 'Alho', quantity: 4, unit: 'dentes' },
      { ingredientId: '', name: 'Azeite de oliva', quantity: 100, unit: 'mL' },
      { ingredientId: '', name: 'Açafrão', quantity: 1, unit: 'pitada' },
      { ingredientId: '', name: 'Erva-doce', quantity: 1, unit: 'un' },
      { ingredientId: '', name: 'Vinho branco', quantity: 200, unit: 'mL' }
    ],
    instructions: [
      'Prepare um fumet com as espinhas dos peixes',
      'Corte os peixes em pedaços grandes',
      'Refogue a cebola, alho e erva-doce no azeite',
      'Adicione os tomates descascados e picados',
      'Acrescente o açafrão e o vinho branco',
      'Adicione o fumet e deixe ferver',
      'Cozinhe os peixes por ordem de tempo de cocção',
      'Tempere com sal, pimenta e ervas frescas',
      'Sirva com rouille e croutons'
    ],
    prepTime: 45,
    cookTime: 30,
    servings: 4,
    difficulty: 'hard',
    category: 'Sopa',
    tags: ['Francês', 'Peixe', 'Frutos do Mar', 'Provençal'],
    rating: 5,
    reviews: [],
    source: 'cordon-bleu'
  },
  {
    name: 'Tarte Tatin',
    description: 'Torta de maçã francesa invertida caramelizada, servida morna com sorvete de baunilha.',
    ingredients: [
      { ingredientId: '', name: 'Maçã Gala', quantity: 8, unit: 'un' },
      { ingredientId: '', name: 'Açúcar cristal', quantity: 200, unit: 'g' },
      { ingredientId: '', name: 'Manteiga', quantity: 100, unit: 'g' },
      { ingredientId: '', name: 'Massa folhada', quantity: 250, unit: 'g' },
      { ingredientId: '', name: 'Baunilha', quantity: 1, unit: 'fava' },
      { ingredientId: '', name: 'Canela em pó', quantity: 1, unit: 'colher (chá)' },
      { ingredientId: '', name: 'Limão', quantity: 1, unit: 'un' }
    ],
    instructions: [
      'Descasque as maçãs e corte em quartos',
      'Prepare um caramelo seco com o açúcar',
      'Adicione a manteiga ao caramelo',
      'Disponha as maçãs sobre o caramelo na forma',
      'Tempere com canela e raspas de limão',
      'Cubra com a massa folhada',
      'Asse a 200°C por 25-30 minutos',
      'Desenforme ainda morna, invertendo a torta',
      'Sirva com sorvete de baunilha'
    ],
    prepTime: 30,
    cookTime: 30,
    servings: 8,
    difficulty: 'medium',
    category: 'Sobremesa',
    tags: ['Francês', 'Torta', 'Maçã', 'Caramelo'],
    rating: 5,
    reviews: [],
    source: 'cordon-bleu'
  },
  {
    name: 'Soufflé au Chocolat',
    description: 'Soufflé de chocolate clássico, leve e aerado, servido imediatamente após sair do forno.',
    ingredients: [
      { ingredientId: '', name: 'Chocolate amargo 70%', quantity: 200, unit: 'g' },
      { ingredientId: '', name: 'Ovo', quantity: 6, unit: 'un' },
      { ingredientId: '', name: 'Açúcar cristal', quantity: 100, unit: 'g' },
      { ingredientId: '', name: 'Manteiga', quantity: 30, unit: 'g' },
      { ingredientId: '', name: 'Farinha de trigo', quantity: 30, unit: 'g' },
      { ingredientId: '', name: 'Leite', quantity: 250, unit: 'mL' },
      { ingredientId: '', name: 'Baunilha', quantity: 1, unit: 'colher (chá)' }
    ],
    instructions: [
      'Derreta o chocolate em banho-maria',
      'Prepare um creme pâtissier com leite, farinha e gemas',
      'Misture o chocolate derretido ao creme',
      'Bata as claras em neve com o açúcar',
      'Incorpore delicadamente as claras ao chocolate',
      'Unte as formas com manteiga e açúcar',
      'Distribua a mistura nas formas',
      'Asse a 180°C por 12-15 minutos',
      'Sirva imediatamente'
    ],
    prepTime: 25,
    cookTime: 15,
    servings: 6,
    difficulty: 'hard',
    category: 'Sobremesa',
    tags: ['Francês', 'Chocolate', 'Soufflé', 'Clássico'],
    rating: 5,
    reviews: [],
    source: 'cordon-bleu'
  },
  {
    name: 'Cassoulet',
    description: 'Ensopado tradicional do sudoeste da França com feijão branco, linguiça e carnes confitadas.',
    ingredients: [
      { ingredientId: '', name: 'Feijão branco', quantity: 500, unit: 'g' },
      { ingredientId: '', name: 'Pato confitado', quantity: 4, unit: 'coxas' },
      { ingredientId: '', name: 'Linguiça de Toulouse', quantity: 300, unit: 'g' },
      { ingredientId: '', name: 'Toucinho', quantity: 200, unit: 'g' },
      { ingredientId: '', name: 'Cebola', quantity: 2, unit: 'un' },
      { ingredientId: '', name: 'Tomate', quantity: 3, unit: 'un' },
      { ingredientId: '', name: 'Alho', quantity: 4, unit: 'dentes' },
      { ingredientId: '', name: 'Tomilho', quantity: 2, unit: 'ramos' },
      { ingredientId: '', name: 'Louro', quantity: 2, unit: 'folhas' },
      { ingredientId: '', name: 'Caldo de galinha', quantity: 1, unit: 'L' }
    ],
    instructions: [
      'Deixe o feijão de molho por 12 horas',
      'Cozinhe o feijão com as aromáticas',
      'Doure as carnes separadamente',
      'Refogue a cebola e o alho',
      'Adicione os tomates descascados e picados',
      'Monte o cassoulet em camadas na panela',
      'Cubra com caldo e cozinhe por 2 horas',
      'Quebre a crosta formada várias vezes',
      'Sirva bem quente'
    ],
    prepTime: 60,
    cookTime: 180,
    servings: 8,
    difficulty: 'hard',
    category: 'Prato Principal',
    tags: ['Francês', 'Feijão', 'Carne', 'Tradicional'],
    rating: 5,
    reviews: [],
    source: 'cordon-bleu'
  },
  {
    name: 'Confit de Canard',
    description: 'Pato confitado lentamente em sua própria gordura, prato tradicional do sudoeste francês.',
    ingredients: [
      { ingredientId: '', name: 'Pato (coxas)', quantity: 4, unit: 'un' },
      { ingredientId: '', name: 'Gordura de pato', quantity: 1, unit: 'kg' },
      { ingredientId: '', name: 'Sal grosso', quantity: 100, unit: 'g' },
      { ingredientId: '', name: 'Tomilho', quantity: 4, unit: 'ramos' },
      { ingredientId: '', name: 'Louro', quantity: 4, unit: 'folhas' },
      { ingredientId: '', name: 'Alho', quantity: 6, unit: 'dentes' },
      { ingredientId: '', name: 'Pimenta preta', quantity: 1, unit: 'colher (chá)' }
    ],
    instructions: [
      'Tempere as coxas de pato com sal grosso e ervas',
      'Deixe curar por 24 horas na geladeira',
      'Retire o excesso de sal e seque bem',
      'Derreta a gordura de pato em fogo baixo',
      'Mergulhe as coxas na gordura a 65°C',
      'Cozinhe por 2-3 horas mantendo a temperatura',
      'Conserve na própria gordura até o uso',
      'Para servir, doure a pele até ficar crocante',
      'Acompanhe com batatas sarladaises'
    ],
    prepTime: 30,
    cookTime: 180,
    servings: 4,
    difficulty: 'hard',
    category: 'Prato Principal',
    tags: ['Francês', 'Pato', 'Confitado', 'Tradicional'],
    rating: 5,
    reviews: [],
    source: 'cordon-bleu'
  }
];

export const initializeCordonBleuRecipes = async () => {
  const { dbService } = await import('../lib/database');
  
  try {
    const existingRecipes = await dbService.getRecipes();
    const cordonBleuExists = existingRecipes.some(recipe => recipe.source === 'cordon-bleu');
    
    if (!cordonBleuExists) {
      console.log('Inicializando receitas do Le Cordon Bleu...');
      
      for (const recipe of cordonBleuRecipes) {
        await dbService.addRecipe(recipe);
      }
      
      console.log('Receitas do Le Cordon Bleu adicionadas com sucesso!');
    }
  } catch (error) {
    console.error('Erro ao inicializar receitas do Le Cordon Bleu:', error);
  }
};