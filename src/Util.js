// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * A combination of utility static methods for the development of grunt-related tasks.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

module.exports = ( () => {
  'use strict';

  // modules
  const fs = require( 'fs' );
  const grunt = require( 'grunt' );
  const ignore = require( 'ignore' );
  const os = require( 'os' );
  const path = require( 'path' );

  const Util = {

    /**
     * A basic grunt-specific assertion function, which uses grunt.fail.fatal() to throw errors. Errors will not be
     * catchable as grunt.fail.fatal calls process.exit. See https://gruntjs.com/api/grunt.fail for documentation.
     * @public
     *
     * @param {boolean} predicate - throws an error if not truthy.
     * @param {string} [message] - message to throw.
     */
    assert( predicate, message ) {
      if ( !predicate ) {

        // Use a default message if a message was not provided.
        message = message ? message : 'Assertion failed.';

        Util.logln( '' ); // Add a line of padding before and after.
        grunt.fail.fatal( message );
      }
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
      Util.assert( asyncTask.constructor.name === 'AsyncFunction', `invalid asyncTask: ${ asyncTask }` );

      return async function( ...args ) {
        const done = this.async();

        await asyncTask( ...args ).catch( error => {

          Util.throw( `Task failed:\n${ error.stack || error }` );
        } );

        done();
      };
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

      return path.extname( filePath ).replace( '.', '' ) || filePath.replace( '.', '' ); // remove the '.'
    },

    /**
     * Convenience method to get the lines of the file, outputted an array. Splits using both unix and windows newlines.
     * @public
     *
     * @param {String} filePath - path of the file, relative to the root directory that invoked the command
     * @returns {String[]} - the lines of the file
     */
    getFileLines( filePath ) {
      Util.assert( typeof filePath === 'string' && grunt.file.isFile( filePath ), `invalid filePath: ${ filePath }` );

      // Read the file first
      const fileContent = grunt.file.read( filePath );

      // Split the lines into an array and output it. Splits using both unix and windows newlines
      return fileContent.split( /\r?\n/ );
    },

    /**
     * Gets ALL substrings between delimiters of a string. For instance,
     * Util.getInnerDelimeterStrings( 'Foo <div> Bar </div><div>Doe</div>', '<div>', '</div>' ) -> [ ' Bar ', 'Doe' ].
     *
     * NOTE: this method doesn't work well for nested delimiters like '<div>H<div>B</div></div>'. Only use this method
     *       for delimiters that you know will 100% not have nested delimiters inside them.
     * @public
     *
     * @param {String} string - the string to search for the strings in between delimiters
     * @param {String} start - the start delimiter (e.g. '<div>')
     * @param {String} end - the end delimiter (e.g. '</div>')
     */
    getInnerDelimeterStrings( string, start, end ) {

      // First split the string with the inner delimiter strings with a regular expression
      const innerDelimterStrings = string.match( new RegExp( `${ start }(.*?)${ end }`, 'gm' ) );

      // Remove the delimiters from the inner strings and return it.
      return innerDelimterStrings.map( innerString => innerString.replace( start, '' ).replace( end, '' ) );
    },

    /**
     * Convenience method to pluralize a word, adding the number in front. For example,
     * Util.pluralize( 'dog', 2 ) -> '2 dogs'.
     * Util.pluralize( 'dog', 1 ) => '1 dog'.
     * @public
     *
     * @param {String} word - the word to pluralize
     * @param {number} number - the number that exists of the word
     */
    pluralize( word, number ) { return number === 1 ? `${ number } ${ word }` : `${ number } ${ word }s`; },

    /**
     * Convenience alias to grunt.log.write()
     * @public
     *
     * @param {...String} args
     */
    log( ...args ) { grunt.log.write( args ); },

    /**
     * Convenience alias to grunt.log.writeln()
     * @public
     *
     * @param {...String} args
     */
    logln( ...args ) { grunt.log.writeln( args ); },

    /**
     * Converts a relative path to the full absolute repository path, including the repository name.
     * For instance, Util.toRepoPath( 'src/Util.js' ) => 'grunt-config/src/Util.js'.
     * @public
     *
     * @param {String} relativePath - relative path to convert (relative to the root directory of the project)
     */
    toRepoPath( relativePath ) { return path.join( path.basename( Util.REPO_PATH ), relativePath ); },

    /**
     * Converts a relative path to the full absolute path.
     * For instance, Util.toAbsolutePath( 'src/Util.js' ) => '/Users/John/grunt-config/src/Util.js'.
     * @public
     *
     * @param {String} relativePath - relative path to convert (relative to the root directory of the project)
     */
    toAbsolutePath( relativePath ) { return path.join( Util.REPO_PATH, relativePath ); },

    /**
     * A grunt-config specific convenience method to throw an error (assert a false value).
     * @public
     *
     * @param {string} [message] - message to throw
     */
    throw( message ) { Util.assert( false, message ); },

    /**
     * Method to update the newlines of either a file or all files of a directory to os.EOL, depending on what is
     * passed in. If the given path isn't a real file or directory, an error will be thrown. If the path is a directory,
     * only files that don't fall into the IGNORE_PATTERN will be updated.
     * @public
     *
     * @param {String} path - either a file or directory to update newlines.
     */
    updateNewlines( path ) {
      Util.assert( grunt.file.exists( path ), `path doesn't exist: ${ Util.toRepoPath( path ) }` );

      // Base case: the path is a file. Now update the new lines.
      if ( grunt.file.isFile( path ) ) {
        fs.writeFileSync( path, Util.getFileLines( path ).join( os.EOL ) );
      }
      else {
        // Recurse through the directory with grunt API. See https://gruntjs.com/api/grunt.file#grunt.file.recurse
        grunt.file.recurse( path, filePath => {
          // Only update the copyright statement if it's a supported file type and if it's not in the ignore pattern.
          if ( !ignore().add( Util.IGNORE_PATTERN ).ignores( filePath ) ) {
            Util.updateNewlines( filePath );
          }
        } );
      }
    },

    // @public {number} CURRENT_YEAR - Static reference to the current full year.
    CURRENT_YEAR: new Date().getUTCFullYear(),

    // @public {String[]} - General pattern for files and directories to ignore for grunt-config.
    IGNORE_PATTERN: [ '**/.git', '**/node_modules', '**/third-party', '**/dist', '**/build', '**/templates' ],

    // @public {String} - global path to grunt-config.
    GRUNT_CONFIG_PATH: path.dirname( __dirname ),

    // @public {String} - global path to the root repository that invoked the command.
    REPO_PATH: process.cwd()
  };

  return Util;
} )();