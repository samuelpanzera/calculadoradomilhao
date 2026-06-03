# Requisitos Funcionais (RF) - Calculadora do Primeiro Milhão

Este documento lista as funcionalidades obrigatórias que a calculadora do primeiro milhão deve possuir.

## RF-01: Entradas do Simulador com Bloqueio (Cadeados)
O usuário deve ser capaz de definir e bloquear os seguintes parâmetros para a simulação:
1. **Capital Inicial (R$)**
2. **Aporte Mensal (R$)**
3. **Taxa de Juros Anual (%)**

### Mecanismo de Cadeados (Locks):
- Ao lado de cada um dos 3 campos de entrada acima, haverá um ícone de **cadeado** interativo (Bloqueado / Desbloqueado).
- O usuário pode travar os valores que ele deseja manter fixos.
- Se o usuário ajustar a linha do tempo (através do Gráfico ou do Campo de Volume de Tempo), os campos **bloqueados** permanecem inalterados, e o valor do campo **desbloqueado** é recalculado dinamicamente para que a meta de R$ 1.000.000,00 seja atingida exatamente no tempo selecionado.
- *Regra de prioridade:* Se houver mais de um campo desbloqueado ao alterar o tempo, o sistema recalculará preferencialmente o **Aporte Mensal** (caso esteja desbloqueado), seguido pelo **Capital Inicial**, e por último a **Taxa de Juros**.

## RF-02: Campo de Volume de Tempo (Slider Geral)
- A interface terá um **Campo de Volume** (controle deslizante de tempo/duração) que representa o prazo (em meses ou anos) para atingir o primeiro milhão.
- Ajustar este slider de volume irá "encurtar" ou "alongar" a curva de crescimento do gráfico.
- Ao encurtar o tempo, a simulação recalcula instantaneamente os parâmetros desbloqueados (por exemplo, exigindo um aporte mensal maior ou taxa de juros maior se o capital estiver fixo).

## RF-03: Sincronização de Inputs
- Cada campo de entrada deve possuir um slider de arraste e um campo de digitação de valor.
- Ao alterar o slider, o valor numérico correspondente deve ser atualizado instantaneamente, e vice-versa.
- Formatação em tempo real de moeda (R$) e porcentagem (%).

## RF-04: Cálculo Reverso de Juros Compostos
O sistema deve implementar os algoritmos de cálculo direto e reverso:
1. **Cálculo Direto (Tempo como Incógnita)**: Dado $V_0$ (Capital Inicial), $A$ (Aporte Mensal) e $i$ (Taxa de Juros Mensal), calcular o número de meses $t$ necessários para atingir $Montante \ge 1.000.000$.
2. **Cálculo de Aporte Requerido**: Dado $V_0$, $i$ e $t$ (Tempo), calcular o Aporte Mensal $A$ necessário:
   $$A = \frac{1.000.000 - V_0 \times (1 + i)^t}{\frac{(1 + i)^t - 1}{i}}$$
3. **Cálculo de Capital Inicial Requerido**: Dado $A$, $i$ e $t$, calcular o Capital Inicial $V_0$ necessário:
   $$V_0 = \frac{1.000.000 - A \times \frac{(1 + i)^t - 1}{i}}{(1 + i)^t}$$
4. **Cálculo de Taxa de Juros Requerida**: Dado $V_0$, $A$ e $t$, estimar a taxa mensal $i$ necessária através de método numérico (ex: Newton-Raphson ou Bissecção) para satisfazer a equação do montante.

## RF-05: Gráfico de Evolução Patrimonial Interativo
- O gráfico deve ser desenhado em tela (SVG) mostrando a evolução do montante acumulado mês a mês até R$ 1.000.000,00.
- **Interatividade no Gráfico**: 
  - Ao passar o mouse ou arrastar o dedo sobre o gráfico, um tooltip interativo deve mostrar os valores detalhados daquele ponto (Mês/Ano, Total Investido, Total em Juros).
  - O usuário poderá **arrastar a linha/marcador de tempo diretamente no gráfico** para alterar o prazo (equivalente a ajustar o Campo de Volume), recalculando dinamicamente os valores de entrada desbloqueados.

## RF-06: Resumo dos Resultados
Exibição destacada dos valores finais após cada simulação:
1. **Tempo Exato**: Anos e meses para atingir R$ 1.000.000.
2. **Total Investido**: $V_0 + (A \times t)$
3. **Total em Juros**: $1.000.000 - Total\ Investido$
