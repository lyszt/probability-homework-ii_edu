#include "./utility.h"

double normal_cdf(double z)
{
    double x = z / __builtin_sqrt(2.0);
    double term = x;
    double sum = x;
    for (int n = 1; n < 200; n++)
    {
        term *= -x * x / n;
        sum += term / (2 * n + 1);
    }
    double erf = 2.0 / __builtin_sqrt(3.14159265358979323846) * sum;
    return 0.5 * (1.0 + erf);
}

double critical_value_from_confidence(double confidence_level)
{
    double gc = confidence_level * 100.0;
    if (gc > 89.999 && gc < 90.001) return 1.65;
    if (gc > 94.999 && gc < 95.001) return 1.96;
    if (gc > 98.999 && gc < 99.001) return 2.58;
    double target = (1.0 + confidence_level) / 2.0;
    double lower = 0.0;
    double upper = 5.0;
    for (int i = 0; i < 60; i++)
    {
        double middle = (lower + upper) / 2.0;
        if (normal_cdf(middle) < target)
            lower = middle;
        else
            upper = middle;
    }
    return (lower + upper) / 2.0;
}
