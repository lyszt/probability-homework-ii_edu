import type { Component } from 'solid-js';
import Calculator from './components/Calculator';

const App: Component = () => {
  return (
    <main class="flex justify-center px-4 py-16">
      <Calculator />
    </main>
  );
};

export default App;
