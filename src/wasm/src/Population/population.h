#ifndef POPULATION_ESTIMATION_H
#define POPULATION_ESTIMATION_H
#include "../Utility/utility.h"

typedef struct pop_variables {
    float sample_mean; // not x, mean
    float critical_value; // z
    float sample_standard_deviation; //s,x
    float sample_size; // n 
    float population_size; // N
    int needs_correction;
    PairFloat population_mean; // u,x
    float error_estimate; // first pos second minus
} PopVariables;


void estimate_population_mean(PopVariables* variables);
void calculate_error_estimate(PopVariables* variables);
void performParameterEstimation(PopVariables* variables);
void beginParameterEstimation(float sample_mean, float sample_size, float critical_value, float sample_standard_deviation, float population_size); 
float get_upper();
float get_lower();
float get_error();

#endif