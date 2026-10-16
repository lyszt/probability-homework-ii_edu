#ifndef POPULATION_ESTIMATION_H
#define POPULATION_ESTIMATION_H
#include "../Utility/utility.h"

typedef struct pop_variables {
    double sample_mean; // x̄
    double confidence_level; // g.c
    double critical_value; // z
    double sample_standard_deviation; // S
    double sample_size; // n
    double population_size; // N
    int needs_correction;
    PairDouble population_mean; // μ
    double error_estimate; // e
} PopVariables;


void estimate_population_mean(PopVariables* variables);
void calculate_error_estimate(PopVariables* variables);
void performParameterEstimation(PopVariables* variables);
void beginParameterEstimation(double population_size, double sample_size, double sample_mean, double sample_standard_deviation, double confidence_level);
double get_ponctual();
double get_upper();
double get_lower();
double get_error();
double get_critical_value();

#endif
