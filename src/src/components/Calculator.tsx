import { createResource, createSignal, For, Show } from 'solid-js';
import { Tabs } from '@kobalte/core/tabs';
import init from '../../wasm/main.wasm?init';

interface PopulationExports {
  memory: WebAssembly.Memory;
  beginParameterEstimation(
    population_size: number,
    sample_size: number,
    sample_mean: number,
    sample_standard_deviation: number,
    confidence_level: number,
  ): void;
  get_ponctual(): number;
  get_upper(): number;
  get_lower(): number;
  get_error(): number;
  get_critical_value(): number;
  beginProportionEstimation(
    population_size: number,
    sample_size: number,
    sample_proportion: number,
    confidence_level: number,
  ): void;
  getPonctualProportion(): number;
  getIntervalProportionLower(): number;
  getIntervalProportionUpper(): number;
  getProportionError(): number;
  getProportionCriticalValue(): number;
}

type Result = {
  tab: string;
  pointSymbol: string;
  point: number;
  symbol: string;
  lower: number;
  upper: number;
  error: number;
  z: number;
};

const loadWasm = async () =>
  (await init()).exports as unknown as PopulationExports;

type Field = { id: string; label: string };

const populationMeanFields: Field[] = [
  { id: 'population_size', label: 'Tamanho da população (N)' },
  { id: 'sample_size', label: 'Tamanho da amostra (n)' },
  { id: 'sample_mean', label: 'Média amostral (x̄)' },
  { id: 'sample_standard_deviation', label: 'Desvio padrão amostral (S)' },
  { id: 'confidence_level', label: 'Grau de confiança (g.c)' },
];

const proportionFields: Field[] = [
  { id: 'population_size', label: 'Tamanho da população (N)' },
  { id: 'sample_size', label: 'Tamanho da amostra (n)' },
  { id: 'sample_proportion', label: 'Proporção amostral (p̄)' },
  { id: 'confidence_level', label: 'Grau de confiança (g.c)' },
];

const tabs = [
  { value: 'population_mean', label: 'Estimação da média populacional', fields: populationMeanFields },
  { value: 'proportion', label: 'Estimativa de proporções', fields: proportionFields },
];

const triggerClass =
  'px-4 py-2 text-sm font-medium text-gray-500 border-b-2 border-transparent ' +
  'hover:text-gray-900 data-selected:text-gray-900 data-selected:border-gray-900';

const format = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 4 });

export default function Calculator() {
  const [wasm] = createResource(loadWasm);
  const [selectedOption, setSelectedOption] = createSignal('population_mean');
  const [result, setResult] = createSignal<Result>();
  const [error, setError] = createSignal<{ tab: string; field: string; message: string }>();
  const invalid = (tab: string, field: string) => error()?.tab === tab && error()?.field === field;
  async function populationEstimationCalc(e: SubmitEvent) {
    e.preventDefault()
    const data = new FormData(e.currentTarget as HTMLFormElement);
    const to_number = (key: string) => Number(data.get(key));

    const fail = (tab: string, field: string, message: string) => {
      setResult(undefined);
      setError({ tab, field, message });
    };
    setError(undefined);

    const tab = selectedOption();
    const N = to_number('population_size');
    const n = to_number('sample_size');
    const gc = to_number('confidence_level');
    if (N <= 1) return fail(tab, 'population_size', 'Deve ser maior que 1.');
    if (n <= 0) return fail(tab, 'sample_size', 'Deve ser maior que zero.');
    if (n > N) return fail(tab, 'sample_size', 'Não pode ser maior que N.');
    if (gc <= 0 || gc >= 1) return fail(tab, 'confidence_level', 'Deve estar entre 0 e 1.');

    const w = wasm();
    if (!w) return;

    switch (tab) {
      case 'population_mean': {
        const S = to_number('sample_standard_deviation');
        if (S < 0) return fail(tab, 'sample_standard_deviation', 'Não pode ser negativo.');
        w.beginParameterEstimation(N, n, to_number('sample_mean'), S, gc);
        setResult({
          tab, pointSymbol: 'μ', point: w.get_ponctual(), symbol: 'μ',
          lower: w.get_lower(), upper: w.get_upper(), error: w.get_error(), z: w.get_critical_value(),
        });
        break;
      }
      case 'proportion': {
        const p = to_number('sample_proportion');
        if (p < 0 || p > 1) return fail(tab, 'sample_proportion', 'Deve estar entre 0 e 1.');
        w.beginProportionEstimation(N, n, p, gc);
        setResult({
          tab, pointSymbol: 'p', point: w.getPonctualProportion(), symbol: 'p',
          lower: w.getIntervalProportionLower(), upper: w.getIntervalProportionUpper(),
          error: w.getProportionError(), z: w.getProportionCriticalValue(),
        });
        break;
      }
      default:
        break;
    }
  }

  return (
    <Tabs value={selectedOption()} onChange={setSelectedOption} class="w-full max-w-xl">
      <Tabs.List class="flex border-b border-gray-200">
        <For each={tabs}>
          {(tab) => (
            <Tabs.Trigger value={tab.value} class={triggerClass}>
              {tab.label}
            </Tabs.Trigger>
          )}
        </For>
      </Tabs.List>

      <For each={tabs}>
        {(tab) => (
          <Tabs.Content value={tab.value} forceMount class="hidden pt-6 data-selected:block">
            <p class="mb-6 rounded-md border-l-4 border-blue-500 bg-blue-50 px-4 py-2 text-sm text-blue-900">
              Informe os valores em forma absoluta. Ex.: g.c = 0.95, p̄ = 0.40.
            </p>

            <form class="grid gap-4" onSubmit={(e) => populationEstimationCalc(e)}>
              <For each={tab.fields}>
                {(f) => (
                  <label class="grid gap-1">
                    <span class="text-sm font-medium text-gray-700">{f.label}</span>
                    <input
                      id={`${tab.value}_${f.id}`}
                      name={f.id}
                      type="number"
                      step="any"
                      class="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                      classList={{ 'border-red-500': invalid(tab.value, f.id) }}
                    />
                    <Show when={invalid(tab.value, f.id)}>
                      <span class="text-sm text-red-600">{error()!.message}</span>
                    </Show>
                  </label>
                )}
              </For>
              <button
                type="submit"
                class="mt-2 rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Calcular
              </button>
            </form>

            <Show when={result()?.tab === tab.value && result()}>
              {(r) => {
                const row = 'flex justify-between rounded-md border border-gray-200 px-4 py-2';
                const res = r();
                return (
                  <dl class="mt-6 grid gap-2">
                    <div class={row}>
                      <dt class="text-sm text-gray-600">Estimação pontual</dt>
                      <dd class="font-mono">{res.pointSymbol} = {format(res.point)}</dd>
                    </div>
                    <div class={row}>
                      <dt class="text-sm text-gray-600">Estimação intervalar</dt>
                      <dd class="font-mono">{format(res.lower)} ≤ {res.symbol} ≤ {format(res.upper)}</dd>
                    </div>
                    <div class={row}>
                      <dt class="text-sm text-gray-600">Erro de estimação (e)</dt>
                      <dd class="font-mono">{format(res.error)}</dd>
                    </div>
                  </dl>
                );
              }}
            </Show>
          </Tabs.Content>
        )}
      </For>
    </Tabs>
  );
}
