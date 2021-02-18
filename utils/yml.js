const { parse } = require("yaml");
const { readFileSync } = require("fs");

/**
 * @description Returns the given YML file parsed as JSON
 * @param {String} dir
 * @returns JSON 
 */
module.exports = function (dir) {
  dir = "./dev "+dir.substring("./".length); // For development
  return parse(readFileSync(dir, "utf8"));
};
