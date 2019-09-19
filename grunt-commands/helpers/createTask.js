// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A grunt-specific task creator. Wraps a 'task' inside a try-catch statement.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

// modules
const assert = require( './assert' );

/**
 * Custom handling of a grunt task. Ensures that if a failure happens, a full stack trace is provided, regardless of
 * whether --stack was provided.
 *
 * @param {function} task
 * @returns {function}
 */
module.exports = task => {

  'use strict';

  // double check the task was a function
  assert( typeof task === 'function', `invalid task: ${task}` );

  return () => {
    try {
      task();
    }
    catch( error ) {
      assert( false, `Task failed:\n${ error.stack || error }` );
    }
  };
};