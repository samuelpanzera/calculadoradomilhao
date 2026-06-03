# Requisitos Não Funcionais (RNF) - Calculadora do Primeiro Milhão

Este documento define as restrições, padrões de qualidade e critérios técnicos da aplicação.

## RNF-01: Stack Tecnológica e Ferramental
- **Gerenciador de Pacotes e Executável**: **Bun**. Utilizaremos o Bun para instalar dependências, rodar scripts e gerenciar o fluxo de desenvolvimento.
- **Ferramenta de Build**: **Vite**. O Vite será configurado para empacotar a aplicação de forma rápida e otimizada.
- **Framework Frontend**: **Svelte** com **TypeScript**.
- **Servidor Web Local / Produção**: O build gerará ativos estáticos na pasta `dist/`, que serão servidos pelo Nginx em container (conforme as especificações da VPS descritas em `vps_specs.md`).

## RNF-02: Performance e Tempo de Carregamento
- **Carregamento Instantâneo**: A página deve ter tempo de carregamento de recursos críticos abaixo de 1 segundo em conexões 3G.
- **Métricas do Lighthouse**: A aplicação deve buscar 100% (ou o mais próximo possível disso) em todas as categorias do Google Lighthouse:
  - Performance: > 95%
  - Acessibilidade: > 95%
  - Boas Práticas: > 95%
  - SEO: 100%

## RNF-03: SEO (Otimização para Mecanismos de Busca)
- **Metadados Completos**: O arquivo HTML de entrada deve declarar tags de metadados explícitas otimizadas para pesquisas como "calculadora primeiro milhão", "calculadora do primeiro milhão" e "simulador primeiro milhão".
- **Semantic HTML**: Utilização de tags semânticas do HTML5 (`<header>`, `<main>`, `<section>`, `<footer>`, `<aside>`) para facilitar a indexação pelos robôs de busca.
- **Structured Data (JSON-LD)**: Inclusão de dados estruturados Schema.org para indexação inteligente:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Calculadora do Primeiro Milhão",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "All",
    "browserRequirements": "Requires HTML5/JavaScript support"
  }
  ```

## RNF-04: Design Premium e Experiência do Usuário (UX/UI)
- **Aparência Visual**: Interface luxuosa, moderna e limpa, utilizando glassmorphism (efeitos translúcidos com `backdrop-filter`), gradientes suaves e esquema de cores moderno baseado em HSL (preferencialmente tema escuro sofisticado com tons de azul marinho, violeta, cinza escuro e acentos em verde menta/neon).
- **Tipografia**: Utilização de fontes modernas de alta legibilidade (ex: *Inter*, *Outfit* ou *Plus Jakarta Sans* via Google Fonts).
- **Micro-animações**: Transições suaves de hover nos botões, sliders e cadeados, além de animações de entrada elegantes para os cards de resultados e linhas de gráficos.
- **Design Responsivo (Mobile-First)**: O site deve se adaptar perfeitamente a dispositivos móveis (smartphones) e computadores de todas as resoluções.

## RNF-05: Peso da Aplicação (Bundle Size)
- **Tecnologia Leve**: O frontend deve ser construído sobre o Vite + Svelte para manter o tamanho do bundle final compilado abaixo de 50KB (gzipped).
- **Sem Dependências Pesadas**: A biblioteca gráfica não deve ser uma dependência externa pesada. O gráfico deve ser gerado nativamente em SVG com TypeScript para ter tamanho zero no bundle final.

## RNF-06: Acessibilidade (a11y)
- **Contraste**: A paleta de cores deve passar no teste de contraste WCAG AA.
- **Aria Attributes**: Utilização de atributos ARIA apropriados para leitores de tela nos sliders, botões interativos e cadeados.
- **Navegabilidade**: A calculadora deve ser navegável e utilizável via teclado (teclas Tab, Setas).
