<script lang="ts">
  import { onMount } from 'svelte';
  import Header from './components/Header.svelte';
  import InputCard from './components/InputCard.svelte';
  import Chart from './components/Chart.svelte';
  import {
    calculateMonthsToTarget,
    calculateRequiredPmt,
    calculateRequiredPv,
    calculateRequiredAnnualRate,
    generateChartData,
    formatCurrency,
    formatMonthsToTime
  } from './utils/finance';

  // Estados dos inputs (Valores iniciais numéricos)
  let pv = $state(10000); // Capital Inicial
  let pmt = $state(1000); // Aporte Mensal
  let annualRate = $state(10.5); // Taxa de Juros Anual (%)

  // Estados dos cadeados (Locks)
  let isPvLocked = $state(false);
  let isPmtLocked = $state(false);
  let isAnnualRateLocked = $state(false);

  // Estados da simulação e gráfico
  let months = $state(120); // Tempo padrão: 10 anos
  let selectedMonth = $state(120);

  // Mensagem de erro caso a meta seja inatingível com os parâmetros atuais
  let isUnreachable = $state(false);

  // Garante que pelo menos um campo esteja destravado (regra dos cadeados)
  $effect(() => {
    if (isPvLocked && isPmtLocked && isAnnualRateLocked) {
      // Se todos estiverem travados, destrava o aporte mensal por padrão
      isPmtLocked = false;
    }
  });

  // Handler para alteração direta nos inputs (numéricos)
  function handleInputAdjust() {
    isUnreachable = false;
    const calcMonths = calculateMonthsToTarget(pv, pmt, annualRate);
    
    if (calcMonths === Infinity || isNaN(calcMonths)) {
      isUnreachable = true;
      months = 120; // fallback visual
      selectedMonth = 120;
    } else {
      // Arredonda para o ano inteiro mais próximo (múltiplos de 12 meses)
      const years = Math.round(calcMonths / 12);
      // Limita a exibição do gráfico a no máximo 50 anos (600 meses)
      months = Math.max(12, Math.min(600, years * 12));
      selectedMonth = months;
    }
  }

  // Handler para alteração na Linha de Tempo / Volume (através do gráfico ou slider)
  function handleTimelineAdjust(newMonths: number) {
    if (newMonths <= 0) return;
    
    // Garante que a duração seja sempre múltiplo de 12 meses (ano em ano)
    const years = Math.round(newMonths / 12);
    const snappedMonths = Math.max(12, Math.min(600, years * 12));
    
    months = snappedMonths;
    selectedMonth = snappedMonths;

    // Resolve as equações e aplica as regras de arredondamento de negócios
    if (!isPmtLocked) {
      // Aporte mensal: arredondado para até 2 casas decimais (centavos)
      const calculatedPmt = calculateRequiredPmt(pv, months, annualRate);
      pmt = Math.round(calculatedPmt * 100) / 100;
    } else if (!isPvLocked) {
      // Capital inicial: arredondado para valor inteiro
      const calculatedPv = calculateRequiredPv(pmt, months, annualRate);
      pv = Math.round(calculatedPv);
    } else if (!isAnnualRateLocked) {
      // Taxa de juros anual: arredondada para até 2 casas decimais
      const rate = calculateRequiredAnnualRate(pv, pmt, months);
      annualRate = Math.max(0.1, Math.min(200, Math.round(rate * 100) / 100));
    }
  }

  // Inicializa o cálculo na montagem
  onMount(() => {
    handleInputAdjust();
  });

  // Gera reativamente os dados do gráfico uPlot
  const chartData = $derived.by(() => {
    return generateChartData(pv, pmt, annualRate, months);
  });

  // Cálculos de resumo no ponto selecionado
  const totalInvested = $derived(pv + pmt * selectedMonth);
  const totalAccumulated = $derived(chartData[2][Math.min(selectedMonth, chartData[2].length - 1)] || 0);
  const totalInterest = $derived(Math.max(0, totalAccumulated - totalInvested));
</script>

<main class="min-h-screen bg-brand-bg text-[#f8fafc] px-4 md:px-8 pb-12 relative overflow-hidden">
  
  <div class="max-w-4xl mx-auto flex flex-col gap-8 relative z-10">
    <Header />

    <!-- 1. Campos de Entrada na parte SUPERIOR -->
    <section class="flex flex-col gap-3">
      <div class="flex flex-col gap-1">
        <h2 class="text-base font-bold text-slate-200 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 text-amber-500">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
          </svg>
          Parâmetros de Investimento
        </h2>
        <p class="text-xs text-slate-400 font-medium">
          Ajuste os valores numéricos. Use o cadeado <strong class="text-amber-500">🔒</strong> para fixar variáveis e recalcular as outras ao alterar o tempo da simulação.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mt-1">
        <InputCard 
          label="Capital Inicial" 
          bind:value={pv} 
          min={0} 
          max={500000} 
          step={1} 
          bind:isLocked={isPvLocked} 
          formatType="currency"
          decimals={0} 
          onChange={handleInputAdjust}
        />

        <InputCard 
          label="Aporte Mensal" 
          bind:value={pmt} 
          min={0} 
          max={20000} 
          step={0.01} 
          bind:isLocked={isPmtLocked} 
          formatType="currency"
          decimals={2} 
          onChange={handleInputAdjust}
        />

        <InputCard 
          label="Taxa de Juros Anual" 
          bind:value={annualRate} 
          min={0.1} 
          max={200} 
          step={0.01} 
          bind:isLocked={isAnnualRateLocked} 
          formatType="percent"
          decimals={2} 
          onChange={handleInputAdjust}
        />
      </div>

      {#if isUnreachable}
        <div class="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-semibold flex items-center gap-2 mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 flex-shrink-0">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          Insira um Aporte Mensal ou Juros maiores para viabilizar a projeção do milhão.
        </div>
      {/if}
    </section>

    <!-- 2. Resumos e Gráfico na parte INFERIOR -->
    <section class="flex flex-col gap-6">
      
      <!-- Bloco de Resultados Principais -->
      <div class="glass-panel p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden border border-slate-800/60">
        <!-- Destaque: Tempo para o Milhão -->
        <div class="flex flex-col gap-1 w-full text-center md:text-left">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tempo para o 1º Milhão</span>
          <span class="text-3xl font-extrabold text-amber-500">
            {isUnreachable ? "Infinito" : formatMonthsToTime(months)}
          </span>
          <span class="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-1">
            Projeção baseada em {months} parcelas mensais
          </span>
        </div>

        <!-- Divisor Vertical -->
        <div class="hidden md:block w-px h-12 bg-slate-800/80"></div>

        <!-- Detalhamento de Valores -->
        <div class="grid grid-cols-2 gap-6 w-full">
          <div class="flex flex-col gap-1 text-center md:text-left">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Investido</span>
            <span class="text-xl font-bold text-white">{formatCurrency(totalInvested, 2)}</span>
            <span class="text-[10px] text-slate-500 font-semibold">{((totalInvested / Math.max(1, totalAccumulated)) * 100).toFixed(0)}% do total</span>
          </div>
          <div class="flex flex-col gap-1 text-center md:text-left">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rendimentos de Juros</span>
            <span class="text-xl font-bold text-amber-500">{formatCurrency(totalInterest, 2)}</span>
            <span class="text-[10px] text-slate-500 font-semibold">{((totalInterest / Math.max(1, totalAccumulated)) * 100).toFixed(0)}% do total</span>
          </div>
        </div>
      </div>

      <!-- Bloco do Gráfico -->
      <div class="glass-panel p-6 rounded-3xl flex flex-col gap-5 border border-slate-800/60">
        <div class="flex items-center justify-between">
          <div class="flex flex-col gap-1">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Gráfico Evolutivo</span>
            <span class="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Arraste a linha vertical ou use a barra de volume de tempo abaixo</span>
          </div>
          <div class="text-right">
            <span class="text-xs font-semibold text-slate-400">Patrimônio no Mês:</span>
            <div class="text-lg font-bold text-amber-500">{formatCurrency(totalAccumulated, 2)}</div>
          </div>
        </div>

        <!-- Componente uPlot -->
        <Chart 
          data={chartData} 
          {selectedMonth} 
          onSelectMonth={handleTimelineAdjust} 
        />

        <!-- Slider de Volume de Tempo colocado abaixo do gráfico -->
        <div class="mt-4 flex flex-col gap-2 border-t border-slate-800/30 pt-4">
          <div class="flex justify-between items-center text-xs font-semibold text-slate-400">
            <span class="uppercase tracking-wider">Linha do Tempo (Volume de Anos)</span>
            <span class="text-white bg-slate-800/40 px-2.5 py-0.5 rounded-lg border border-slate-800/60 font-bold">
              {selectedMonth / 12} {selectedMonth / 12 === 1 ? 'ano' : 'anos'} ({selectedMonth} meses)
            </span>
          </div>
          
          <input 
            type="range" 
            min={12} 
            max={600} 
            step={12} 
            value={selectedMonth} 
            oninput={(e) => {
              const target = e.target as HTMLInputElement;
              handleTimelineAdjust(parseInt(target.value));
            }}
            class="w-full accent-amber-500 cursor-pointer"
          />
          
          <!-- Escala de 5 em 5 anos posicionada com precisão absoluta -->
          <div class="relative w-full h-4 mt-1 text-[10px] text-slate-500 font-bold uppercase tracking-wider select-none">
            <span class="absolute left-0">1a</span>
            <span class="absolute left-[8.16%] -translate-x-1/2">5a</span>
            <span class="absolute left-[18.37%] -translate-x-1/2">10a</span>
            <span class="absolute left-[28.57%] -translate-x-1/2">15a</span>
            <span class="absolute left-[38.78%] -translate-x-1/2">20a</span>
            <span class="absolute left-[48.98%] -translate-x-1/2">25a</span>
            <span class="absolute left-[59.18%] -translate-x-1/2">30a</span>
            <span class="absolute left-[69.39%] -translate-x-1/2">35a</span>
            <span class="absolute left-[79.59%] -translate-x-1/2">40a</span>
            <span class="absolute left-[89.8%] -translate-x-1/2">45a</span>
            <span class="absolute right-0">50a</span>
          </div>
        </div>
      </div>

    </section>

    <!-- Footer -->
    <footer class="mt-2 text-center text-xs text-slate-600 font-medium">
      Projetado com Svelte 5, Tailwind v4 e uPlot para renderização instantânea.
    </footer>
  </div>

</main>
