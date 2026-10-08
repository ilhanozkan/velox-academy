const { Model } = require("objection");

class BaseModel extends Model {
  // Whether the table has created_at/updated_at columns (timestamps(true, true)).
  static get hasTimestamps() {
    return true;
  }

  // The database fills both timestamp columns on insert, but nothing refreshed
  // updated_at when a row changed.
  $beforeUpdate(opt, queryContext) {
    super.$beforeUpdate(opt, queryContext);
    if (this.constructor.hasTimestamps) {
      this.updated_at = new Date().toISOString();
    }
  }
}

module.exports = BaseModel;
