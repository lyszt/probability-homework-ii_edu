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
}

const loadWasm = async () =>
  (await init()).exports as unknown as PopulationExports;

type Field = { id: string; label: string; intervalOnly?: boolean };
type Mode = 'intervalar' | 'pontual';

const populationMeanFields: Field[] = [
  { id: 'sample_mean', label: 'Média amostral (x̄)' },
  { id: 'sample_size', label: 'Tamanho da amostra (n)', intervalOnly: true },
  { id: 'critical_value', label: 'Valor crítico (z)', intervalOnly: true },
  { id: 'sample_standard_deviation', label: 'Desvio padrão amostral (s)', intervalOnly: true },
  { id: 'population_size', label: 'Tamanho da população (N)', intervalOnly: true },
];

const proportionFields: Field[] = [
  { id: 'sample_proportion', label: 'Proporção amostral (p̂)' },
  { id: 'sample_size', label: 'Tamanho da amostra (n)', intervalOnly: true },
  { id: 'critical_value', label: 'Valor crítico (z)', intervalOnly: true },
  { id: 'population_size', label: 'Tamanho da população (N)', intervalOnly: true },
];

const tabs = [
  { value: 'population_mean', label: 'Estimação da média populacional', fields: populationMeanFields },
  { value: 'proportion', label: 'Estimativa de proporções', fields: proportionFields },
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
  const [result, setResult] = createSignal<{ tab: string; lower: number; upper: number; error: number }>();
  async function populationEstimationCalc(e: SubmitEvent) {
    e.preventDefault()
    const data = new FormData(e.currentTarget as HTMLFormElement);
    const to_number = (key: string) => Number(data.get(key));

    console.log(selectedOption())
    switch (selectedOption()) {
      case 'population_mean': {
        const w = wasm();
        const args = populationMeanFields.map((f) => to_number(f.id)) as [number, number, number, number, number];
        w?.beginParameterEstimation(...args);
        if (w) {
          setResult({ tab: 'population_mean', lower: w.get_lower(), upper: w.get_upper(), error: w.get_error() });
        }
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
            <div class="mb-6 flex rounded-md border border-gray-300 p-1">
              <For each={modes}>
                {(m) => (
                  <button
                    type="button"
                    class={modeButtonClass(mode() === m.value)}
                    aria-pressed={mode() === m.value}
                    onClick={() => setMode(m.value)}
                  >
                    {m.label}
                  </button>
                )}
              </For>
            </div>

            <form class="grid gap-4" onSubmit={(e) => populationEstimationCalc(e)}>
              <For each={tab.fields}>
                {(f) => (
                  <label class="grid gap-1" classList={{ hidden: f.intervalOnly && mode() === 'pontual' }}>
                    <span class="text-sm font-medium text-gray-700">{f.label}</span>
                    <input
                      id={`${tab.value}_${f.id}`}
                      name={f.id}
                      type="number"
                      step="any"
                      class="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
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
              {(r) => (
                <div class="mt-6 grid gap-3">
                  <p class="rounded-md bg-gray-50 px-4 py-3 text-center font-mono">
                    {format(r().lower)} ≤ μ ≤ {format(r().upper)}
                  </p>
                  <dl class="grid gap-2">
                    <div class="flex justify-between rounded-md border border-gray-200 px-4 py-2">
                      <dt class="text-sm text-gray-600">Limite inferior</dt>
                      <dd class="font-mono">{format(r().lower)}</dd>
                    </div>
                    <div class="flex justify-between rounded-md border border-gray-200 px-4 py-2">
                      <dt class="text-sm text-gray-600">Limite superior</dt>
                      <dd class="font-mono">{format(r().upper)}</dd>
                    </div>
                    <div class="flex justify-between rounded-md border border-gray-200 px-4 py-2">
                      <dt class="text-sm text-gray-600">Margem de erro (E)</dt>
                      <dd class="font-mono">{format(r().error)}</dd>
                    </div>
                  </dl>
                </div>
              )}
            </Show>
          </Tabs.Content>
        )}
      </For>
    </Tabs>
  );
}
