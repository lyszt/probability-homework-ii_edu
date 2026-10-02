#ifndef POPULATION_ESTIMATION_H
#define POPULATION_ESTIMATION_H
#include "../Utility/utility.h"

typedef struct pop_variables {
    double sample_mean; // not x, mean
    double critical_value; // z
    double sample_standard_deviation; //s,x
    double sample_size; // n 
    double population_size; // N
    int needs_correction;
    PairDouble population_mean; // u,x
    double error_estimate; // first pos second minus
} PopVariables;


void estimate_population_mean(PopVariables* variables);
void calculate_error_estimate(PopVariables* variables);
void performParameterEstimation(PopVariables* variables);
void beginParameterEstimation(double sample_mean, double sample_size, double critical_value, double sample_standard_deviation, double population_size); 
double get_upper();
double get_lower();
double get_error();

#endif