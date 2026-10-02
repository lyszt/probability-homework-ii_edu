#include "./proportion.h"

static PropVariables result;

void beginProportionEstimation(double sample_proportion, double sample_size, double items_in_sample, double standard_deviation, int intervalar_pontual)
{
    result.sample_proportion = sample_proportion;
    result.sample_size = sample_size;
    result.items_in_sample = items_in_sample;
    result.standard_deviation = standard_deviation;
    result.intervalar_pontual = intervalar_pontual;
    intervalar_pontual == 0? performPonctualProportion(&result) : performIntervalProportion(&result);
}


void performPonctualProportion(PropVariables* variables) {
    variables->ponctual_estimative = variables->items_in_sample / variables->sample_size;
}

void performIntervalProportion(PropVariables* variables) {
    double* standard_deviation = &variables->standard_deviation;
    double half_eq = *standard_deviation * __builtin_sqrt((variables->sample_proportion * (1 - variables->sample_proportion) / variables->sample_size));
    variables->interval_estimative.first = variables->sample_proportion + half_eq;
    variables->interval_estimative.second = variables->sample_proportion - half_eq;
}

double getPonctualProportion() {
    return result.ponctual_estimative;
}

double getIntervalProportionUpper() {
    return result.interval_estimative.first;
}
double getIntervalProportionLower() {
    return result.interval_estimative.second;
}