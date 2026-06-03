/**
 * Utilitários de cálculo financeiro para a Calculadora do Primeiro Milhão.
 */

// Meta final: R$ 1.000.000,00
export const TARGET_MILLION = 1000000;

/**
 * Converte taxa de juros anual (%) para taxa mensal (decimal)
 */
export function annualToMonthlyRate(annualRatePercent: number): number {
  const annualDecimal = annualRatePercent / 100;
  return Math.pow(1 + annualDecimal, 1 / 12) - 1;
}

/**
 * Converte taxa de juros mensal (decimal) para taxa anual (%)
 */
export function monthlyToAnnualRate(monthlyRateDecimal: number): number {
  return (Math.pow(1 + monthlyRateDecimal, 12) - 1) * 100;
}

/**
 * Calcula o tempo necessário em meses para atingir o primeiro milhão
 * FV = PV * (1 + i)^n + PMT * [((1 + i)^n - 1) / i]
 */
export function calculateMonthsToTarget(
  pv: number, // Capital Inicial
  pmt: number, // Aporte Mensal
  annualRatePercent: number, // Taxa Anual (%)
  target: number = TARGET_MILLION
): number {
  if (pv >= target) return 0;

  const i = annualToMonthlyRate(annualRatePercent);

  // Se a taxa de juros for zero
  if (i <= 0) {
    if (pmt <= 0) return Infinity; // Nunca vai atingir
    return Math.ceil((target - pv) / pmt);
  }

  // Se a taxa for positiva mas o aporte e pv forem zero
  if (pmt <= 0 && pv <= 0) return Infinity;

  // Se o rendimento mensal for positivo mas o crescimento for impossível (valores negativos)
  // (1+i)^n * (PV + PMT/i) = FV + PMT/i
  const denominator = pv + pmt / i;
  const numerator = target + pmt / i;

  if (denominator <= 0) return Infinity;

  const n = Math.log(numerator / denominator) / Math.log(1 + i);
  return Math.ceil(n);
}

/**
 * Calcula o Aporte Mensal (PMT) necessário para atingir o alvo
 * PMT = (FV - PV * (1 + i)^n) / [((1 + i)^n - 1) / i]
 */
export function calculateRequiredPmt(
  pv: number, // Capital Inicial
  months: number, // Tempo em meses
  annualRatePercent: number, // Taxa Anual (%)
  target: number = TARGET_MILLION
): number {
  if (months <= 0) return 0;
  const i = annualToMonthlyRate(annualRatePercent);

  if (i <= 0) {
    return Math.max(0, (target - pv) / months);
  }

  const compoundFactor = Math.pow(1 + i, months);
  const annuityFactor = (compoundFactor - 1) / i;

  const required = (target - pv * compoundFactor) / annuityFactor;
  return Math.max(0, required);
}

/**
 * Calcula o Capital Inicial (PV) necessário para atingir o alvo
 * PV = (FV - PMT * [((1 + i)^n - 1) / i]) / (1 + i)^n
 */
export function calculateRequiredPv(
  pmt: number, // Aporte Mensal
  months: number, // Tempo em meses
  annualRatePercent: number, // Taxa Anual (%)
  target: number = TARGET_MILLION
): number {
  if (months <= 0) return target;
  const i = annualToMonthlyRate(annualRatePercent);

  if (i <= 0) {
    return Math.max(0, target - pmt * months);
  }

  const compoundFactor = Math.pow(1 + i, months);
  const annuityFactor = (compoundFactor - 1) / i;

  const required = (target - pmt * annuityFactor) / compoundFactor;
  return Math.max(0, required);
}

/**
 * Calcula a Taxa de Juros Anual (%) necessária para atingir o alvo
 * Resolve a equação usando o Método da Bissecção
 */
export function calculateRequiredAnnualRate(
  pv: number, // Capital Inicial
  pmt: number, // Aporte Mensal
  months: number, // Tempo em meses
  target: number = TARGET_MILLION
): number {
  if (months <= 0) return 0;
  if (pv >= target) return 0;

  // Se a soma simples sem juros já bate a meta
  if (pv + pmt * months >= target) return 0;

  // Função f(i) onde i é a taxa mensal decimal
  const f = (i: number) => {
    const compoundFactor = Math.pow(1 + i, months);
    const annuityFactor = (compoundFactor - 1) / i;
    return pv * compoundFactor + pmt * annuityFactor - target;
  };

  // Método da Bissecção para encontrar a raiz
  let low = 0.00001; // Taxa mensal mínima (> 0)
  let high = 0.50;    // Taxa mensal máxima (50% ao mês)
  let tolerance = 0.0001;
  let maxIterations = 100;
  let mid = 0;

  if (f(high) < 0) {
    return monthlyToAnnualRate(high);
  }

  for (let k = 0; k < maxIterations; k++) {
    mid = (low + high) / 2;
    const val = f(mid);

    if (Math.abs(val) < tolerance) {
      break;
    }

    if (val < 0) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return monthlyToAnnualRate(mid);
}

/**
 * Gera os dados da série temporal para o gráfico uPlot
 * Retorna no formato [meses, investido, acumulado]
 */
export function generateChartData(
  pv: number,
  pmt: number,
  annualRatePercent: number,
  months: number
): [number[], number[], number[]] {
  const i = annualToMonthlyRate(annualRatePercent);
  
  const xData: number[] = [];
  const investedData: number[] = [];
  const accumulatedData: number[] = [];

  // Mês zero (Estado inicial)
  xData.push(0);
  investedData.push(pv);
  accumulatedData.push(pv);

  let currentAccumulated = pv;

  // Evolução mês a mês
  for (let m = 1; m <= months; m++) {
    // Rendimento e depois aporte
    currentAccumulated = currentAccumulated * (1 + i) + pmt;
    const currentInvested = pv + pmt * m;

    xData.push(m);
    investedData.push(Math.round(currentInvested));
    accumulatedData.push(Math.round(currentAccumulated));
  }

  return [xData, investedData, accumulatedData];
}

/**
 * Formata um número como moeda brasileira (BRL) com número ajustável de casas decimais
 */
export function formatCurrency(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Converte meses para um texto amigável de Anos e Meses
 */
export function formatMonthsToTime(totalMonths: number): string {
  if (totalMonths === Infinity || isNaN(totalMonths)) return "Infinito";
  if (totalMonths === 0) return "Imediato";

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  let result = "";
  if (years > 0) {
    result += `${years} ${years === 1 ? "ano" : "anos"}`;
  }
  if (months > 0) {
    if (result) result += " e ";
    result += `${months} ${months === 1 ? "mês" : "meses"}`;
  }

  return result;
}
