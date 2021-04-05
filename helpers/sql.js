const { BadRequestError } = require("../expressError");

/** return SQL string and list of values for partially updating an object */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  // get list of keys from dataToUpdate
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // create the portion of the SQL query listing the keys
  // jsToSql maps the JavaScript key to the database column name where they differ
  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  // values is the array of values for the query string
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
