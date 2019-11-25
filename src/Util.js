// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A combination of utility static methods for grunt-config development.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

module.exports = ( () => {
  'use strict';

  // modules
  const grunt = require( 'grunt' );

  const Util = {

    /**
     * A basic grunt-specific assertion function, which uses `grunt.fail.fatal` to throw errors.
     * See https://gruntjs.com/api/grunt.fail for background.
     * @public
     *
     * @param {boolean} predicate - throws an error if not truthy.
     * @param {string} [message] - message to throw
     */
    assert( predicate, message ) {
      if ( !predicate ) {

        message = message ? 'Assertion failed: ' + message : 'Assertion failed.';

        grunt.fail.fatal( message.bold.red );
      }
    },

    /**
     * A improved version of string.prototype.replace to replace all instances of a substring in a string.
     * @public
     *
     * @param {string} str - the input string
     * @param {string} find - the string to find
     * @param {string} replaceWith - the string to replace the find string with
     * @returns {string}
     */
    replaceAll( str, find, replaceWith ) {
      return str.replace( new RegExp( find.replace( /[-\\^$*+?.()|[\]{}]/g, '\\$&' ), 'g' ), replaceWith );
    },

    /**
     * Custom handling of a grunt task by wrapping a 'task' inside a try-catch statement. Ensures that if a failure
     * happens, a full stack trace is provided, regardless of whether --stack was provided.
     *
     * @param {function} task - the task function to execute
     * @param {...*} args - args passed from the grunt task. This is passed to the task function.
     * @returns {function}
     */
    wrap( task, ...args ) {
      Util.assert( typeof task === 'function', `invalid task: ${ task }` );

      return ( ...args ) => {
        try {
          task( ...args );
        }
        catch( error ) {
          Util.assert( false, `Task failed:\n${ error.stack || error }` );
        }
      };
    }
  };

  return Util;
} )();