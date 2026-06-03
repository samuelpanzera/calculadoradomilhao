<script lang="ts">

  interface Props {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    isLocked: boolean;
    formatType: 'currency' | 'percent';
    decimals?: number; // Quantidade de casas decimais permitidas
    onChange?: () => void;
  }

  let {
    label,
    value = $bindable(),
    min,
    max,
    step,
    isLocked = $bindable(),
    formatType,
    decimals = 2,
    onChange
  }: Props = $props();

  function handleInputChange(e: Event) {
    const target = e.target as HTMLInputElement;
    let parsed = parseFloat(target.value);
    if (isNaN(parsed)) parsed = min;
    
    // Limita as casas decimais de acordo com a regra de negócios
    const factor = Math.pow(10, decimals);
    const rounded = Math.round(parsed * factor) / factor;
    
    value = Math.max(min, Math.min(max, rounded));
    if (onChange) onChange();
  }


</script>

<div 
  class="glass-panel p-5 rounded-2xl transition-all duration-300 flex flex-col gap-3 relative overflow-hidden border {isLocked ? 'border-amber-600/20 bg-amber-950/5' : 'border-slate-800/60 bg-slate-900/20'}"
>
  <!-- Cabeçalho do Card -->
  <div class="flex items-center justify-between">
    <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
    
    <!-- Botão de Cadeado para Travamento -->
    <button 
      type="button"
      onclick={() => { isLocked = !isLocked; }}
      aria-label={isLocked ? `Desbloquear ${label}` : `Bloquear ${label}`}
      class="p-2 rounded-xl transition-all duration-200 border flex items-center justify-center cursor-pointer {isLocked ? 'bg-amber-600/10 text-amber-500 border-amber-600/20' : 'bg-slate-800/30 text-slate-500 border-slate-800 hover:text-slate-300 hover:bg-slate-800/50'}"
    >
      {#if isLocked}
        <!-- Ícone de Cadeado Fechado -->
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
      {:else}
        <!-- Ícone de Cadeado Aberto -->
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
      {/if}
    </button>
  </div>

  <!-- Campo de Entrada Direto e Editável -->
  <div class="flex items-center gap-2 bg-slate-950/30 border border-slate-800/80 focus-within:border-amber-600/40 rounded-xl px-4 py-2.5 transition-colors">
    {#if formatType === 'currency'}
      <span class="text-slate-500 font-semibold text-base select-none">R$</span>
    {/if}
    <input 
      type="number" 
      {min} 
      {max} 
      {step} 
      value={value} 
      onchange={handleInputChange}
      class="bg-transparent border-none outline-none text-white text-xl font-bold w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
    {#if formatType === 'percent'}
      <span class="text-slate-500 font-semibold text-base select-none">% a.a.</span>
    {/if}
  </div>
</div>
