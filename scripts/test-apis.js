#!/usr/bin/env node

// Script para testar as APIs externas
// Executar: node scripts/test-apis.js

import { config } from 'dotenv';
import fetch from 'node-fetch';

// Carregar variáveis de ambiente
config();

const SPOONACULAR_API_KEY = process.env.VITE_SPOONACULAR_API_KEY;
const EDAMAM_APP_ID = process.env.VITE_EDAMAM_APP_ID;
const EDAMAM_APP_KEY = process.env.VITE_EDAMAM_APP_KEY;

async function testSpoonacularAPI() {
  console.log('🥄 Testando Spoonacular API...');
  
  if (!SPOONACULAR_API_KEY || SPOONACULAR_API_KEY === 'demo-key') {
    console.log('❌ Chave Spoonacular não configurada ou é demo');
    return false;
  }

  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&number=5&query=chicken`
    );
    
    if (!response.ok) {
      console.log(`❌ Erro HTTP: ${response.status}`);
      return false;
    }
    
    const data = await response.json();
    console.log(`✅ Spoonacular OK - ${data.results.length} receitas encontradas`);
    console.log(`📊 Total disponível: ${data.totalResults}`);
    
    // Mostrar primeira receita
    if (data.results.length > 0) {
      const recipe = data.results[0];
      console.log(`📖 Exemplo: "${recipe.title}"`);
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
    return false;
  }
}

async function testEdamamAPI() {
  console.log('\n🍽️ Testando Edamam API...');
  
  if (!EDAMAM_APP_ID || EDAMAM_APP_ID === 'demo-id') {
    console.log('❌ Credenciais Edamam não configuradas ou são demo');
    return false;
  }

  try {
    const response = await fetch(
      `https://api.edamam.com/search?q=chicken&app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&from=0&to=5`
    );
    
    if (!response.ok) {
      console.log(`❌ Erro HTTP: ${response.status}`);
      return false;
    }
    
    const data = await response.json();
    console.log(`✅ Edamam OK - ${data.hits.length} receitas encontradas`);
    console.log(`📊 Total disponível: ${data.count}`);
    
    // Mostrar primeira receita
    if (data.hits.length > 0) {
      const recipe = data.hits[0].recipe;
      console.log(`📖 Exemplo: "${recipe.label}"`);
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔑 Testando APIs de Receitas Externas\n');
  
  const spoonacularOK = await testSpoonacularAPI();
  const edamamOK = await testEdamamAPI();
  
  console.log('\n📋 Resumo:');
  console.log(`Spoonacular: ${spoonacularOK ? '✅ Funcionando' : '❌ Não configurada'}`);
  console.log(`Edamam: ${edamamOK ? '✅ Funcionando' : '❌ Não configurada'}`);
  
  if (spoonacularOK || edamamOK) {
    console.log('\n🎉 APIs configuradas com sucesso!');
    console.log('Agora você tem acesso a milhares de receitas reais.');
  } else {
    console.log('\n⚠️  Nenhuma API configurada.');
    console.log('O app funcionará com receitas mock.');
    console.log('Veja SETUP-APIS.md para instruções de configuração.');
  }
}

main();