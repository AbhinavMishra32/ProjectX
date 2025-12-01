const path = require("path");

let native;
try {
  const possiblePaths = [
    path.resolve(__dirname, "build/Release/native_math.node"),
    path.resolve(process.cwd(), "packages/way-engine/build/Release/native_math.node"),
    path.resolve(process.cwd(), "../../packages/way-engine/build/Release/native_math.node"),
  ];

  let loaded = false;
  for (const p of possiblePaths) {
    try {
      native = require(p);
      loaded = true;
      break;
    } catch (e) {
      continue;
    }
  }

  if (!loaded) {
    throw new Error("Could not find native addon in any expected location");
  }
} catch (e) {
  console.error("Failed to load native addon:", e.message);
  throw e;
}

class VectorDB {
  constructor(dim) {
    this._db = new native.VectorDB(dim);
  }

  add(vector) {
    this._db.add(vector);
  }

  search(query) {
    return this._db.search(query);
  }

  size() {
    return this._db.size();
  }

  dim() {
    return this._db.dim();
  }
}

module.exports = {
  VectorDB,
  native
};
