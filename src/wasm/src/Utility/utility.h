#ifndef UTILITY_ESTIMATION_H
#define UTILITY_ESTIMATION_H

typedef struct pair_int {
    int first;
    int second;
} PairInt;

typedef struct pair_float {
    float first;
    float second;
} PairFloat;

typedef struct pair_double {
    double first;
    double second;
} PairDouble;

double normal_cdf(double z);
double critical_value_from_confidence(double confidence_level);

#endif
