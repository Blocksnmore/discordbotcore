const { parse } = require("yaml");
const { readFileSync } = require("fs");

/**
 * @description Returns the given YML file parsed as JSON
 * @param {String} dir
 * @returns JSON 
 */
module.exports = function (dir) {
  return parse(readFileSync(dir, "utf8"));
};
