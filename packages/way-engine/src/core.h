#pragma once
#include <vector>

class VectorDB {
public:
	explicit VectorDB(int dim);

	int dim() const;
	size_t size() const;

	void add(const float* v);
	int search(const float* query, float* outDistance) const;

private:
	float l2(const float* a, const float* b) const;

	int dim_;
	size_t count_;
	std::vector<float> data_;
};