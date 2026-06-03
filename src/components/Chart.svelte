<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import uPlot from 'uplot';
  import 'uplot/dist/uPlot.min.css';
  import { formatCurrency, formatMonthsToTime } from '../utils/finance';

  interface Props {
    data: [number[], number[], number[]]; // [meses, investido, acumulado]
    selectedMonth: number;
    onSelectMonth: (month: number) => void;
  }

  // Recebe as props reativas do Svelte 5 diretamente (sem desestruturação para manter a reatividade viva em closures)
  let props: Props = $props();

  // Variáveis locais puras para controle uPlot
  let containerEl: HTMLDivElement | null = null;
  let chartEl: HTMLDivElement | null = null;
  let chartInstance: uPlot | null = null;
  let resizeObserver: ResizeObserver | null = null;

  // Encontra o índice ativo seguro para leitura de dados
  const activeIndex = $derived(Math.min(props.selectedMonth, props.data[0].length - 1));

  function initChart() {
    if (!chartEl || !containerEl) return;

    // Dimensões iniciais responsivas
    const rect = containerEl.getBoundingClientRect();
    const width = Math.round(rect.width || containerEl.clientWidth || 600);
    const height = Math.max(280, Math.min(360, window.innerHeight * 0.35));

    const opts: uPlot.Options = {
      width,
      height,
      title: "",
      class: "uplot-premium",
      cursor: {
        drag: { x: false, y: false },
        points: {
          show: true
        }
      },
      select: {
        show: false,
        left: 0,
        top: 0,
        width: 0,
        height: 0
      },
      scales: {
        x: {
          time: false,
          auto: true,
          range: (self, _min, max) => {
            const dataX = self.data[0];
            const dataMax = dataX && dataX.length > 0 ? dataX[dataX.length - 1] : 12;
            return [0, dataMax];
          }
        },
        y: {
          auto: true,
          range: (_self, _min, max) => [0, Math.max(1200000, max * 1.05)]
        }
      },
      axes: [
        {
          stroke: "#475569",
          grid: {
            stroke: "rgba(71, 85, 105, 0.08)",
            width: 1
          },
          ticks: {
            stroke: "#475569"
          },
          values: (_self, splits) => splits ? splits.map(v => `${Math.floor(v / 12)}a`) : [],
          font: "11px 'Outfit', sans-serif"
        },
        {
          stroke: "#475569",
          grid: {
            stroke: "rgba(71, 85, 105, 0.08)",
            width: 1
          },
          ticks: {
            stroke: "#475569"
          },
          values: (_self, splits) => splits ? splits.map(v => {
            if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
            return `${Math.round(v / 1000)}k`;
          }) : [],
          font: "11px 'Outfit', sans-serif"
        }
      ],
      series: [
        {},
        {
          label: "Total Investido",
          stroke: "#94a3b8", // Slate/Prata
          width: 2,
          fill: "rgba(148, 163, 184, 0.02)",
          // Linha suavizada (spline) para eliminar aspecto tremido/serrilhado
          paths: uPlot.paths.spline ? uPlot.paths.spline() : undefined,
          points: { show: false },
          value: (_self, rawValue) => rawValue != null ? formatCurrency(rawValue, 2) : '--'
        },
        {
          label: "Total Acumulado",
          stroke: "#f59e0b", // Gold/Amber
          width: 3,
          fill: "rgba(245, 158, 11, 0.04)",
          // Curva de juros compostos perfeitamente lisa
          paths: uPlot.paths.spline ? uPlot.paths.spline() : undefined,
          points: { show: false },
          value: (_self, rawValue) => rawValue != null ? formatCurrency(rawValue, 2) : '--'
        }
      ],
      hooks: {
        draw: [
          (self) => {
            if (!self.data || !self.data[0] || self.data[0].length === 0) return;
            const ctx = self.ctx;
            
            // 1. Linha horizontal meta de R$ 1.000.000 (usando canvasPixels = true para alinhamento correto no buffer do canvas)
            const millionY = self.valToPos(1000000, 'y', true);
            ctx.save();
            ctx.beginPath();
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = "rgba(245, 158, 11, 0.2)";
            ctx.lineWidth = 1;
            ctx.moveTo(self.bbox.left, millionY);
            ctx.lineTo(self.bbox.left + self.bbox.width, millionY);
            ctx.stroke();
            ctx.restore();
          }
        ]
      }
    };

    // Remove Proxy do Svelte 5 convertendo em objeto JS puro para o uPlot
    const rawData = $state.snapshot(props.data);
    chartInstance = new uPlot(opts, rawData, chartEl);
  }

  // Efeito reativo para atualizar dados (convertendo Proxy do Svelte 5 em snapshot cru)
  $effect(() => {
    // Acessa props.data incondicionalmente no topo do efeito para registrar a dependência reativa no Svelte 5
    const rawData = $state.snapshot(props.data);
    
    if (chartInstance && rawData) {
      chartInstance.setData(rawData, true);
    }
  });

  // Efeito reativo para redesenhar o gráfico ao mudar selectedMonth
  $effect(() => {
    props.selectedMonth;
    if (chartInstance) {
      chartInstance.redraw();
    }
  });

  onMount(() => {
    initChart();
    
    // Configura o ResizeObserver para redimensionamento perfeito
    if (containerEl) {
      resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          if (chartInstance) {
            const width = Math.round(entry.contentRect.width);
            const height = Math.max(280, Math.min(360, window.innerHeight * 0.35));
            chartInstance.setSize({ width, height });
          }
        }
      });
      resizeObserver.observe(containerEl);
    }
  });

  onDestroy(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
    if (chartInstance) {
      chartInstance.destroy();
    }
  });
</script>

<div bind:this={containerEl} class="w-full relative">
  <div bind:this={chartEl} class="w-full flex justify-center"></div>
  
  <!-- Detalhe da Projeção no Ponto Selecionado -->
  <div class="flex justify-between items-center mt-3 px-2 text-xs font-semibold text-slate-400 border-t border-slate-800/40 pt-3">
    <div class="flex items-center gap-1.5">
      <span class="w-2 h-2 rounded-full bg-slate-400"></span>
      <span>Total Investido: <strong class="text-white">{formatCurrency(props.data[1][activeIndex] || 0, 2)}</strong></span>
    </div>
    <div class="text-[11px] bg-slate-800/20 text-slate-400 px-2 py-0.5 rounded-md border border-slate-800/60 font-bold">
      Prazo Selecionado: {activeIndex} ({formatMonthsToTime(activeIndex)})
    </div>
    <div class="flex items-center gap-1.5">
      <span class="w-2 h-2 rounded-full bg-[#f59e0b]"></span>
      <span>Patrimônio Total: <strong class="text-white">{formatCurrency(props.data[2][activeIndex] || 0, 2)}</strong></span>
    </div>
  </div>
</div>

<style>
  :global(.uplot-premium) {
    background: transparent !important;
  }
</style>
