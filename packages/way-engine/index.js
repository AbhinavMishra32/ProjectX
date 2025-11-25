const path = require("path");

const bindingPath = path.join(__dirname, "build", "Release", "native_math.node");
const native = require(bindingPath);

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
