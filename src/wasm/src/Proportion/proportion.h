#ifndef PROPORTION_ESTIMATION_H
#define PROPORTION_ESTIMATION_H
#include "../Utility/utility.h"

typedef struct prop_variables {
    PairDouble interval_estimative; // p
    double sample_proportion; // p̄
    double sample_size; // n
    double population_size; // N
    double confidence_level; // g.c
    double critical_value; // z
    int needs_correction;
    double error_estimate; // e
} PropVariables;

void beginProportionEstimation(double population_size, double sample_size, double sample_proportion, double confidence_level);
void performIntervalProportion(PropVariables* variables);
double getPonctualProportion();
double getIntervalProportionUpper();
double getIntervalProportionLower();
double getProportionError();
double getProportionCriticalValue();

#endif
