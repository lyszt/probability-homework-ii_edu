#include "./population.h"

static PopVariables result;

void estimate_population_mean(PopVariables *variables)
{
    variables->population_mean.first = variables->sample_mean + variables->error_estimate;
    variables->population_mean.second = variables->sample_mean - variables->error_estimate;
}

void calculate_error_estimate(PopVariables *variables)
{
    variables->error_estimate = variables->critical_value * variables->sample_standard_deviation / __builtin_sqrt(variables->sample_size);
    if (variables->needs_correction == 1)
    {
        variables->error_estimate *= __builtin_sqrt((variables->population_size - variables->sample_size) / (variables->population_size - 1));
    }
}

void performParameterEstimation(PopVariables *variables)
{
    variables->needs_correction = variables->sample_size / variables->population_size > 0.05 ? 1 : 0;
    calculate_error_estimate(variables);
    estimate_population_mean(variables);
}

void beginParameterEstimation(double sample_mean, double sample_size, double critical_value, double sample_standard_deviation, double population_size)
{
    result.sample_mean = sample_mean;
    result.sample_size = sample_size;
    result.critical_value = critical_value;
    result.sample_standard_deviation = sample_standard_deviation;
    result.population_size = population_size;
    performParameterEstimation(&result);
}

double get_upper()
{
    return result.population_mean.first;
}

double get_lower()
{
    return result.population_mean.second;
}
double get_error()
{
    return result.error_estimate;
}