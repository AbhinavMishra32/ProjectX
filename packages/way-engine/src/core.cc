#include "core.h"
#include <limits>

VectorDB::VectorDB(int dim) : dim_(dim), count_(0) {}

int VectorDB::dim() const {
    return dim_;
}

size_t VectorDB::size() const {
    return count_;
}

void VectorDB::add(const float* v) {
    data_.insert(data_.end(), v, v + dim_);
    ++count_;
}

float VectorDB::l2(const float* a, const float* b) const {
    float d = 0.0f;
    for (int i = 0; i < dim_; ++i) {
        float diff = a[i] - b[i];
        d += diff * diff;
    }
    return d;
}

int VectorDB::search(const float* query, float* outDistance) const {
    if (count_ == 0) {
        if (outDistance) {
            *outDistance = std::numeric_limits<float>::infinity();
        }
        return -1;
    }

    float bestDist = std::numeric_limits<float>::infinity();
    int bestIndex = -1;

    for (size_t i = 0; i < count_; ++i) {
        const float* base = &data_[i * dim_];
        float d = l2(base, query);
        if (d < bestDist) {
            bestDist = d;
            bestIndex = static_cast<int>(i);
        }
    }

    if (outDistance) {
        *outDistance = bestDist;
    }
    return bestIndex;
}

