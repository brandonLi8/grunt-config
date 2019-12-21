// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A combination of utility static methods for the development of grunt-related tasks.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

module.exports = ( () => {
  'use strict';

  // modules
  const grunt = require( 'grunt' );
  const path = require( 'path' );

  const Util = {

    /**
     * A basic grunt-specific assertion function, which uses `grunt.fail.fatal` to throw errors.
     * See https://gruntjs.com/api/grunt.fail for documentation.
     * @public
     *
     * @param {boolean} predicate - throws an error if not truthy.
     * @param {string} [message] - message to throw
     */
    assert( predicate, message ) {
      if ( !predicate ) {

        // Use a default message if a message was not provided.
        message = message ? message : 'Assertion failed.';

        grunt.fail.fatal( message );
      }
    },

    /**
     * A grunt-config specific convenience method to throw an error (assert a false value).
     * @public
     *
     * @param {string} [message] - message to throw
     */
    throw( message ) {
      grunt.log.writeln( '' ); // Add a line of padding before and after.
      Util.assert( false, `${ message }\n` );
    },

    /**
     * Custom handling of a grunt task by wrapping a 'task' inside a try-catch statement. Arguments passed to the
     * wrapper from the grunt task are transmitted to the task. Ensures that if a failure happens, a full stack trace is
     * provided, regardless of whether --stack was provided.
     * @public
     *
     * @param {function} task - the task function to execute. Arguments passed to the wrapper are passed to this task.
     * @returns {function} - the wrapper function to be passed as the grunt task
     */
    wrap( task ) {
      Util.assert( typeof task === 'function', `invalid task: ${ task }` );

      return ( ...args ) => {
        try {
          task( ...args ); // When the wrapper is called, execute the task and transfer the args.
        }
        catch( error ) {
          Util.throw( `Task failed:\n${ error.stack || error }` );
        }
      };
    },

    /**
     * Wraps an async task's promise inside a try-catch statement with grunt's async handling API. Arguments passed to
     * the wrapper from the grunt task are transmitted to the asynchronous task when executed. Ensures that if a
     * failure happens, a full stack trace is provided, regardless of whether --stack was provided.
     * @public
     *
     * @param {async function} asyncTask - the task function to execute. Arguments to the grunt task are transmitted.
     * @returns {function} - the wrapper function to be passed as the grunt task
     */
    wrapAsync( asyncTask ) {
      Util.assert( asyncTask.constructor.name == 'AsyncFunction', `invalid asyncTask: ${ asyncTask }` );

      return Util.wrap( async ( ...args ) => {
        const done = grunt.task.current.async();

        await asyncTask( ...args ).catch( error => {
          Util.throw( `Task failed:\n${ error.stack || error }` );
        } );
        done();
      } );
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
      Util.assert( typeof str === 'string', `invalid str: ${ str }` );

      return str.split( find ).join( replaceWith );
    },

    /**
     * Converts a string separated with dashes to camel case. For instance: Util.toCamelCase( 'foo-bar' ) -> 'fooBar'
     * @public
     *
     * @param {string} str - the input string
     * @returns {string}
     */
    toCamelCase( str ) {
      Util.assert( typeof str === 'string', `invalid str: ${ str }` );

      return str.toLowerCase().replace( /-(.)/g, ( match, group ) => {
        return group.toUpperCase();
      } );
    },

    /**
     * Converts a string separated with dashes to Title Case. For instance: Util.toTitleCase( 'foo-bar' ) -> 'Foo Bar'
     * @public
     *
     * @param {string} str - the input string
     * @returns {string}
     */
    toTitleCase( str ) {
      Util.assert( typeof str === 'string', `invalid str: ${ str }` );

      return str.split( /-|_|\// )
                .map( word => word.length > 0 ? word[ 0 ].toUpperCase() + word.substr( 1 ).toLowerCase() : '' )
                .join( ' ' );
    },

    /**
     * Convenience method to iterate through a object literal. The iterator function is given both the key and value.
     * @public
     *
     * @param {Object} object - object literal to loop through
     * @param {Function} iterator - function to call on each iteration, passing both the key and value.
     */
    iterate( object, iterator ) {
      Util.assert( Object.getPrototypeOf( object ) === Object.prototype, `invalid object: ${ object }` );

      Object.keys( object ).forEach( key => {
        iterator( key, object[ key ] );
      } );
    },

    /**
     * Convenience method to parse the extension of a file path. For instance Util.getExtension( 'foo/bar.html' )
     * returns 'html' (without the .)
     * @public
     *
     * @param {String} filePath
     * @returns {String} - the extension, without the '.'
     */
    getExtension( filePath ) {
      Util.assert( typeof filePath === 'string', `invalid filePath: ${ filePath }` );

      return path.extname( filePath ).replace( '.', '' ); // remove the . from the extension
    },

    // @public {string} CURRENT_YEAR - Static reference to the current full year.
    CURRENT_YEAR: `${ new Date().getFullYear() }`
  };

  return Util;
} )();