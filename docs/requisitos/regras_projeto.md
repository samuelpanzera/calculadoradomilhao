# Regras de Desenvolvimento do Projeto - Calculadora do Primeiro Milhão

Este documento estabelece as regras e diretrizes técnicas para desenvolvedores e agentes de IA que atuarem neste repositório.

## 1. Arquitetura e Estrutura do Código

- **Frontend Framework**: **Svelte + TypeScript + Vite**. Todo componente novo deve ser criado na pasta `src/components/` com a extensão `.svelte`.
- **CSS**: Utilização de CSS Vanilla puro. Evitar frameworks CSS pesados. Centralizar variáveis de cores, espaçamentos e fontes em `src/styles/theme.css`.
- **Gráficos**: Proibido adicionar bibliotecas externas de gráficos que inflem o bundle (como Chart.js ou Highcharts), a menos que explicitamente solicitado pelo usuário. Use gráficos baseados em elementos `<svg>` nativos do HTML manipulados reativamente pelo Svelte e TypeScript.
- **Formatação de Moeda**: Use sempre utilitários de internacionalização nativos do JavaScript (`Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`) para exibição de valores monetários.

## 2. Padrões de Design e UX

- **Tema Padrão**: Escuro (Dark Mode) sofisticado por padrão, com suporte a cores vibrantes baseadas em HSL para acentos visuais.
- **Responsividade**: Layout responsivo adaptado para resoluções de 320px até 4K.
- **Interatividade**: Transições nos sliders, botões e mudanças de estado devem ser suaves (`transition: all 0.2s ease-in-out`).

## 3. SEO e Metadados

- Qualquer alteração no arquivo `index.html` deve manter ou otimizar os metadados de SEO para o termo **"calculadora primeiro milhão"**.
- O título da página, descrição meta e cabeçalhos principais (`<h1>`, `<h2>`) devem estar alinhados com boas práticas de indexação do Google.

## 4. Infraestrutura VPS e Deployment (Importante)

O projeto deve obrigatoriamente respeitar as diretrizes de infraestrutura contidas em `vps_specs.md`:
- **Portas**: Este projeto está alocado no bloco de portas da VPS. O container frontend é mapeado para a porta designada (ex: `3200` ou conforme especificado na infraestrutura).
- **Quadlets**: Arquivo de container do Podman Quadlet localizado em `infra/frontend/calculadoramilhao-frontend.container`.
- **Nginx**: Arquivo de configuração de proxy reverso em `infra/nginx/calculadoramilhao.conf`.
- **CI/CD**: Deploy atômico via GitHub Actions, validando a sintaxe do Nginx no host antes de reiniciar e recarregar os serviços.
