// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A custom solution to a buggy string.replace.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

//----------------------------------------------------------------------------------------

/**
 * Solution from https://github.com/phetsims/chipper
 *
 * @param {string} str - the input string
 * @param {string} find - the string to find
 * @param {string} replaceWith - the string to replace find with
 * @returns {string} a new string
 */
module.exports = ( str, find, replaceWith ) => {
  return str.replace( new RegExp( find.replace( /[-\\^$*+?.()|[\]{}]/g, '\\$&' ), 'g' ), replaceWith );
};