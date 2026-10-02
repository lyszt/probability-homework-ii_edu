#ifndef PROPORTION_ESTIMATION_H
#define PROPORTION_ESTIMATION_H
#include "../Utility/utility.h"

typedef struct prop_variables {
    PairDouble interval_estimative; // p
    double ponctual_estimative;
    double sample_proportion; // not p
    double sample_size; // n
    double items_in_sample; // x
    double standard_deviation; // z
    int intervalar_pontual;
} PropVariables;

void beginProportionEstimation(double sample_proportion, double sample_size, double items_in_sample, double standard_deviation, int intervalar_pontual);
void performPonctualProportion(PropVariables* variables);
void performIntervalProportion(PropVariables* variables);
double getIntervalProportionUpper();
double getIntervalProportionLower();



#endif