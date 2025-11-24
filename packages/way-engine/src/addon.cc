#include <napi.h>
#include "core.h"

using namespace Napi;

Value SumArrayWrapped(const CallbackInfo& info) {
	Env env = info.Env();

	if (info.Length() < 1 || !info[0].IsTypedArray()) {
		TypeError::New(env, "Expected a Float64Array argument").ThrowAsJavaScriptException();
		return env.Null();
	}

	TypedArray ta = info[0].As<TypedArray>();
	if (ta.TypedArrayType() != napi_float64_array) {
		TypeError::New(env, "Expected a Float64Array").ThrowAsJavaScriptException();
		return env.Null();
	}

	Float64Array fa = info[0].As<Float64Array>();
	size_t length = fa.ElementLength();
	const double* data = reinterpret_cast<const double*>(fa.ArrayBuffer().Data()) + fa.ByteOffset() / sizeof(double);

	double result = sum_array(data, length);

	return Number::New(env, result);
}

Object Init(Env env, Object exports) {
	exports.Set("sumArray", Function::New(env, SumArrayWrapped));
	return exports;
}

NODE_API_MODULE(native_math, Init)