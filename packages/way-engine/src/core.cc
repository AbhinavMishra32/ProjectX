#include "core.h"

double sum_array(const double* data, size_t length) {
    double sum = 0.0;
    for (size_t i = 0; i < length; ++i) {
        sum += data[i];
    }
    return sum;
}