#include "./proportion.h"

static PropVariables result;

void beginProportionEstimation(double population_size, double sample_size, double sample_proportion, double confidence_level)
{
    result.population_size = population_size;
    result.sample_size = sample_size;
    result.sample_proportion = sample_proportion;
    result.confidence_level = confidence_level;
    performIntervalProportion(&result);
}

void performIntervalProportion(PropVariables* variables) {
    variables->critical_value = critical_value_from_confidence(variables->confidence_level);
    variables->needs_correction = variables->sample_size / variables->population_size > 0.05 ? 1 : 0;
    double half_eq = variables->critical_value * __builtin_sqrt((variables->sample_proportion * (1 - variables->sample_proportion) / variables->sample_size));
    if (variables->needs_correction == 1)
    {
        half_eq *= __builtin_sqrt((variables->population_size - variables->sample_size) / (variables->population_size - 1));
    }
    variables->error_estimate = half_eq;
    variables->interval_estimative.first = variables->sample_proportion + half_eq;
    variables->interval_estimative.second = variables->sample_proportion - half_eq;
}

double getPonctualProportion() {
    return result.sample_proportion;
}

double getIntervalProportionUpper() {
    return result.interval_estimative.first;
}
double getIntervalProportionLower() {
    return result.interval_estimative.second;
}

double getProportionError() {
    return result.error_estimate;
}

double getProportionCriticalValue() {
    return result.critical_value;
}
