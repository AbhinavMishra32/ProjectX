#include <napi.h>
#include <memory>
#include <vector>
#include "core.h"

using namespace Napi;

class VectorDBWrap : public ObjectWrap<VectorDBWrap> {
public:
	static Object Init(Napi::Env env, Object exports) {
		Function ctor = DefineClass(
			env,
			"VectorDB",
			{
				InstanceMethod("add", &VectorDBWrap::Add),
				InstanceMethod("search", &VectorDBWrap::Search),
				InstanceMethod("size", &VectorDBWrap::Size),
				InstanceMethod("dim", &VectorDBWrap::Dim)
			}
		);

		FunctionReference* constructor = new FunctionReference();
		*constructor = Persistent(ctor);
		env.SetInstanceData(constructor);

		exports.Set("VectorDB", ctor);
		return exports;
	}

	VectorDBWrap(const CallbackInfo& info) : ObjectWrap<VectorDBWrap>(info) {
		Napi::Env env = info.Env();
		if (info.Length() < 1 || !info[0].IsNumber()) {
			TypeError::New(env, "Expected dimension").ThrowAsJavaScriptException();
			return;
		}
		int dim = info[0].As<Number>().Int32Value();
		if (dim <= 0) {
			RangeError::New(env, "Dimension must be > 0").ThrowAsJavaScriptException();
			return;
		}
		db_ = std::make_unique<VectorDB>(dim);
	}

private:
	std::unique_ptr<VectorDB> db_;

	std::vector<float> ToVector(const Napi::Value& value, int dim, Napi::Env env) {
		std::vector<float> out;

		if (value.IsTypedArray()) {
			TypedArray ta = value.As<TypedArray>();
			if (ta.TypedArrayType() == napi_float32_array) {
				Float32Array fa = value.As<Float32Array>();
				if (static_cast<int>(fa.ElementLength()) != dim) {
					RangeError::New(env, "Vector size mismatch").ThrowAsJavaScriptException();
					return out;
				}
				out.assign(fa.Data(), fa.Data() + dim);
				return out;
			}
			if (ta.TypedArrayType() == napi_float64_array) {
				Float64Array fa = value.As<Float64Array>();
				if (static_cast<int>(fa.ElementLength()) != dim) {
					RangeError::New(env, "Vector size mismatch").ThrowAsJavaScriptException();
					return out;
				}
				out.reserve(dim);
				for (int i = 0; i < dim; ++i) {
					out.push_back(static_cast<float>(fa[i]));
				}
				return out;
			}
		}

		if (value.IsArray()) {
			Array arr = value.As<Array>();
			if (static_cast<int>(arr.Length()) != dim) {
				RangeError::New(env, "Vector size mismatch").ThrowAsJavaScriptException();
				return out;
			}
			out.reserve(dim);
			for (int i = 0; i < dim; ++i) {
				Napi::Value v = arr.Get(i);
				if (!v.IsNumber()) {
					TypeError::New(env, "Vector must contain numbers").ThrowAsJavaScriptException();
					return std::vector<float>();
				}
				out.push_back(v.As<Number>().FloatValue());
			}
			return out;
		}

		TypeError::New(env, "Expected Float32Array or number[]").ThrowAsJavaScriptException();
		return out;
	}

	Napi::Value Add(const CallbackInfo& info) {
		Napi::Env env = info.Env();
		if (info.Length() < 1) {
			TypeError::New(env, "Expected vector").ThrowAsJavaScriptException();
			return env.Null();
		}

		std::vector<float> v = ToVector(info[0], db_->dim(), env);
		if (env.IsExceptionPending()) {
			return env.Null();
		}

		db_->add(v.data());
		return env.Undefined();
	}

	Napi::Value Search(const CallbackInfo& info) {
		Napi::Env env = info.Env();
		if (info.Length() < 1) {
			TypeError::New(env, "Expected query").ThrowAsJavaScriptException();
			return env.Null();
		}

		int dim = db_->dim();
		std::vector<float> q = ToVector(info[0], dim, env);
		if (env.IsExceptionPending()) {
			return env.Null();
		}

		float dist = 0.0f;
		int index = db_->search(q.data(), &dist);
		if (index < 0) {
			return env.Null();
		}

		Object out = Object::New(env);
		out.Set("index", Number::New(env, index));
		out.Set("distance", Number::New(env, dist));
		return out;
	}

	Napi::Value Size(const CallbackInfo& info) {
		return Number::New(info.Env(), static_cast<double>(db_->size()));
	}

	Napi::Value Dim(const CallbackInfo& info) {
		return Number::New(info.Env(), db_->dim());
	}
};

Object Init(Env env, Object exports) {
	return VectorDBWrap::Init(env, exports);
}

NODE_API_MODULE(native_math, Init)