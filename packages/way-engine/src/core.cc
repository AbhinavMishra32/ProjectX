#include "core.h"
#include <vector>

double sum_array(const double* data, size_t length) {
    double sum = 0.0;
    for (size_t i = 0; i < length; ++i) {
        sum += data[i];
    }
    return sum;
}

struct VectorDB {
    std::vector<float> data;
    int dim;

    VectorDB(int dim): dim(dim) {}

    void add(const std::vector<float> &v){
        for (float x : v) {
            data.push_back(x);
        }
    }

    // distance between two vectors is just normal distance formula!
    float l2(const float* a, const float* b, int dim) {
        float d = 0;
        for (int i = 0; i < dim; i++) {
            float diff = a[i] - b[i];
            d += diff * diff;
        }
        return d;
    }

    int search(const std::vector<float>& query) {
        float bestDist = 1e30;
        int bestIndex = -1;

        for (int i = 0; i < data.size(); i += dim) {
            float d = l2(&data[i], query.data(), dim);

            if (d < bestDist) {
                bestDist = d;
                bestIndex = i / dim;
            }
        }
        return bestIndex;
    }
};

