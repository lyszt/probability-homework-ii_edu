#include "./population.h"

void estimate_population_mean(PopVariables* variables) {
    variables->population_mean.first = variables->sample_mean + variables->error_estimate;
    variables->population_mean.second = variables->sample_mean - variables->error_estimate;
}

void calculate_error_estimate(PopVariables* variables) {
    variables->error_estimate = variables->critical_value * variables->sample_standard_deviation / __builtin_sqrtf(variables->sample_size);
    if(variables->needs_correction == 1) {
        variables->error_estimate *= __builtin_sqrtf((variables->population_size - variables->sample_size)/(variables->population_size - 1));
    }
}

void performParameterEstimation(PopVariables* variables) {
    variables->needs_correction = variables->population_size / variables->sample_size > 0.5 ? 1 : 0;
    calculate_error_estimate(variables);
    estimate_population_mean(variables);
}