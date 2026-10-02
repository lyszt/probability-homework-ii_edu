import { createResource, createSignal, For, Show } from 'solid-js';
import { Tabs } from '@kobalte/core/tabs';
import init from '../../wasm/main.wasm?init';

interface PopulationExports {
  memory: WebAssembly.Memory;
  beginParameterEstimation(
    sample_mean: number,
    sample_size: number,
    critical_value: number,
    sample_standard_deviation: number,
    population_size: number,
  ): void;
  get_upper(): number;
  get_lower(): number;
  get_error(): number;
  beginProportionEstimation(
    sample_proportion: number,
    sample_size: number,
    items_in_sample: number,
    critical_value: number,
    intervalar_pontual: number,
  ): void;
  getPonctualProportion(): number;
  getIntervalProportionLower(): number;
  getIntervalProportionUpper(): number;
}

type Result =
  | { tab: string; kind: 'interval'; symbol: string; lower: number; upper: number; error?: number }
  | { tab: string; kind: 'point'; symbol: string; value: number };

const loadWasm = async () =>
  (await init()).exports as unknown as PopulationExports;

type Field = { id: string; label: string; intervalOnly?: boolean; pointOnly?: boolean };
type Mode = 'intervalar' | 'pontual';

const populationMeanFields: Field[] = [
  { id: 'sample_mean', label: 'Média amostral (x̄)' },
  { id: 'sample_size', label: 'Tamanho da amostra (n)' },
  { id: 'critical_value', label: 'Valor crítico (z)' },
  { id: 'sample_standard_deviation', label: 'Desvio padrão amostral (s)' },
  { id: 'population_size', label: 'Tamanho da população (N)' },
];

const proportionFields: Field[] = [
  { id: 'items_in_sample', label: 'Itens na amostra (x)', pointOnly: true },
  { id: 'sample_proportion', label: 'Proporção amostral (p̂)', intervalOnly: true },
  { id: 'sample_size', label: 'Tamanho da amostra (n)' },
  { id: 'critical_value', label: 'Valor crítico (z)', intervalOnly: true },
];

const tabs = [
  { value: 'population_mean', label: 'Estimação da média populacional', fields: populationMeanFields, hasModes: false },
  { value: 'proportion', label: 'Estimativa de proporções', fields: proportionFields, hasModes: true },
];



const triggerClass =
  'px-4 py-2 text-sm font-medium text-gray-500 border-b-2 border-transparent ' +
  'hover:text-gray-900 data-selected:text-gray-900 data-selected:border-gray-900';

const modes: { value: Mode; label: string }[] = [
  { value: 'intervalar', label: 'Intervalar' },
  { value: 'pontual', label: 'Pontual' },
];

const modeButtonClass = (active: boolean) =>
  'flex-1 rounded px-3 py-1.5 text-sm font-medium ' +
  (active ? 'bg-primary text-primary-foreground' : 'text-gray-600 hover:text-gray-900');

const format = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 4 });

export default function Calculator() {
  const [wasm] = createResource(loadWasm);
  const [selectedOption, setSelectedOption] = createSignal('population_mean');
  const [mode, setMode] = createSignal<Mode>('intervalar');
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

    switch (selectedOption()) {
      case 'population_mean': {
        const n = to_number('sample_size');
        const N = to_number('population_size');
        if (n <= 0) return fail('population_mean', 'sample_size', 'Deve ser maior que zero.');
        if (N <= 1) return fail('population_mean', 'population_size', 'Deve ser maior que 1.');
        const w = wasm();
        const args = populationMeanFields.map((f) => to_number(f.id)) as [number, number, number, number, number];
        w?.beginParameterEstimation(...args);
        if (w) {
          setResult({ tab: 'population_mean', kind: 'interval', symbol: 'μ', lower: w.get_lower(), upper: w.get_upper(), error: w.get_error() });
        }
        break;
      }
      case 'proportion': {
        if (to_number('sample_size') <= 0) return fail('proportion', 'sample_size', 'Deve ser maior que zero.');
        const w = wasm();
        if (!w) break;
        const pontual = mode() === 'pontual';
        w.beginProportionEstimation(
          to_number('sample_proportion'),
          to_number('sample_size'),
          to_number('items_in_sample'),
          to_number('critical_value'),
          pontual ? 0 : 1,
        );
        setResult(
          pontual
            ? { tab: 'proportion', kind: 'point', symbol: 'p̂', value: w.getPonctualProportion() }
            : { tab: 'proportion', kind: 'interval', symbol: 'p', lower: w.getIntervalProportionLower(), upper: w.getIntervalProportionUpper() },
        );
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
            <Show when={tab.hasModes}>
            <div class="mb-6 flex rounded-md border border-gray-300 p-1">
              <For each={modes}>
                {(m) => (
                  <button
                    type="button"
                    class={modeButtonClass(mode() === m.value)}
                    aria-pressed={mode() === m.value}
                    onClick={() => { setMode(m.value); if (result()?.tab === 'proportion') setResult(undefined); }}
                  >
                    {m.label}
                  </button>
                )}
              </For>
            </div>
            </Show>

            <form class="grid gap-4" onSubmit={(e) => populationEstimationCalc(e)}>
              <For each={tab.fields}>
                {(f) => (
                  <label class="grid gap-1" classList={{ hidden: tab.hasModes && ((f.intervalOnly && mode() === 'pontual') || (f.pointOnly && mode() === 'intervalar')) }}>
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
                return res.kind === 'point' ? (
                  <p class="mt-6 rounded-md bg-gray-50 px-4 py-3 text-center font-mono">
                    {res.symbol} = {format(res.value)}
                  </p>
                ) : (
                  <div class="mt-6 grid gap-3">
                    <p class="rounded-md bg-gray-50 px-4 py-3 text-center font-mono">
                      {format(res.lower)} ≤ {res.symbol} ≤ {format(res.upper)}
                    </p>
                    <dl class="grid gap-2">
                      <div class={row}>
                        <dt class="text-sm text-gray-600">Limite inferior</dt>
                        <dd class="font-mono">{format(res.lower)}</dd>
                      </div>
                      <div class={row}>
                        <dt class="text-sm text-gray-600">Limite superior</dt>
                        <dd class="font-mono">{format(res.upper)}</dd>
                      </div>
                      <Show when={res.error !== undefined}>
                        <div class={row}>
                          <dt class="text-sm text-gray-600">Margem de erro (E)</dt>
                          <dd class="font-mono">{format(res.error!)}</dd>
                        </div>
                      </Show>
                    </dl>
                  </div>
                );
              }}
            </Show>
          </Tabs.Content>
        )}
      </For>
    </Tabs>
  );
}
