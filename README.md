# probability-homework-ii_edu

Confidence interval calculator. The math is in C, compiled to WebAssembly, with a SolidJS interface.

## Formulas

Margin of error for the mean:

  E = z · s / √n

Finite population correction, applied when n/N > 0.05:

  E = z · (s / √n) · √((N − n) / (N − 1))

Confidence interval:

  x̄ − E ≤ μ ≤ x̄ + E

Margin of error for a proportion:

  E = z · √(p̂(1 − p̂) / n)

With finite population correction, applied when n/N > 0.05:

  E = z · √(p̂(1 − p̂) / n) · √((N − n) / (N − 1))

Confidence interval:

  p̂ − E ≤ p ≤ p̂ + E
