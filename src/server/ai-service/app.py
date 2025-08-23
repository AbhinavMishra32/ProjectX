from fastapi import FastAPI


app = FastAPI(title="AI Service", version="1.0.0")


@app.get("/ai/healthz")
def healthz():
    return {"status": "ok"}


@app.get("/ai/")
def root():
    return {"service": "ai", "message": "Hello from FastAPI AI service"}


@app.get("/ai/echo/{text}")
def echo(text: str):
    return {"service": "ai", "echo": text}


