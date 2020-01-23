// Copyright © 2020 Brandon Li. All rights reserved.

/**
 * Utility class for referencing and retrieving user-specific configuration options and values.
 *
 * User-specific configuration values are dynamic and depend on the user and its environment. For instance, the
 * package.json of every user will have slightly different values. Each key-value pair of package.json is a
 * user-specific value and determines Generator values.
 *
 * Contains static references that should be conditionally validated only in the grunt-task that uses it. Contains a
 * convenience method to parse a value from either PACKAGE_JSON or BUILD_RC and provides a helpful error message if
 * the file wasn't implemented correctly to guide the user to correct it.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

module.exports = ( () => {
  'use strict';

  // modules
  const chalk = require( 'chalk' );
  const grunt = require( 'grunt' );
  const Util = require( './Util' );

  const UserConfig = {

    //----------------------------------------------------------------------------------------
    // Static References
    //----------------------------------------------------------------------------------------

    // @public {Object} (grunt-config-internal) - reference to the package.json object of the root repository that
    //                                            invoked the command, if it exists.
    PACKAGE_JSON: grunt.file.isFile( 'package.json' ) ? grunt.file.readJSON( 'package.json' ) : undefined,

    // @public {Object} (grunt-config-internal) - reference to the repository buildrc.json object of the root repository
    //                                            that invoked the command, if it exists. See ./Builder.js for more
    //                                            documentation of this file.
    BUILD_RC: grunt.file.isFile( 'package.json' ) ? grunt.file.readJSON( 'package.json' ) : undefined,

    // @public {String} (grunt-config-internal) - reference to the GITHUB_ACCESS_TOKEN environment variable if it
    //                                            exists. See ./Labeler.js for more documentation of this variable.
    GITHUB_ACCESS_TOKEN: process.env.GITHUB_ACCESS_TOKEN,

    //----------------------------------------------------------------------------------------

    /**
     * Retrieves a nested property value of either PACKAGE_JSON or BUILD_RC. Uses an array of sub-paths to represent
     * the nested keys. For instance, parseNestedJSONValue( 'PACKAGE_JSON', [ 'foo', 'bar' ] ) gets PACKAGE_JSON.foo.bar
     * @private
     *
     * The value is then validated such that it must be either a number or a string. If the JSON object doesn't
     * contain any of the sub-path keys, it errors out with a helpful error message to guide the user to correct it.
     *
     * @param {String} name - either 'PACKAGE_JSON' || 'BUILD_RC'. Indicates which JSON file to parse.
     * @param {String[]} subpaths - the nested keys to parse from the JSON object
     * @param {String} [valueName] - name of the value. Only used if the JSON object isn't implemented correctly. If not
     *                               provided and the JSON object wasn't correct, it will use the last path in subpaths.
     * @returns {number|string} - the parsed value
     */
    parseNestedJSONValue( name, subpaths, valueName ) {
      Util.assert( [ 'PACKAGE_JSON', 'BUILD_RC' ].includes( name ), `invalid name: ${ name }` );
      Util.assert( subpaths.every( path => typeof path === 'string' ), `invalid subpaths: ${ subpaths }` );
      Util.assert( !valueName || typeof valueName === 'string', `invalid valueName: ${ valueName }` );

      let value = UserConfig[ name ]; // Create a flag that points to the nested paths values.
      let error = false; // Create a flag that indicates if the JSON object wasn't correct.
      subpaths.forEach( subpath => {
        if ( !error && !Object.prototype.hasOwnProperty.call( value, subpath ) ) error = true;
        else value = value[ subpath ];
      } );

      // We have traversed through the object to the current path. Double check that the value is a string or a number.
      if ( !error && !( typeof value === 'number' || typeof value === 'string' ) ) error = true;

      // If an error has occurred, log a helpful message.
      if ( error ) {
        // First, get the error message by recursively creating the error message.
        const getErrorMessage = paths => {
          valueName = valueName || subpaths[ subpaths.length - 1 ].toUpperCase();

          // Base case - one path left is the value
          if ( paths.length === 1 ) {
            return `  "${ paths[ 0 ] }": ${ chalk.bold( `{{${ valueName }}}` ) }`;
          }
          else {
            return `  "${ paths[ 0 ] }": {\n` +
                   `  ${ Util.replaceAll( getErrorMessage( paths.slice( 1 ) ), '\n', '\n  ' ) }\n` +
                   `  }${ paths.length === subpaths.length ? '' : ',' }`;
          }
        };
        // Throw the error.
        Util.throw( chalk.underline( `${ name === 'BUILD_RC' ? 'buildrc' : 'package' }.json` )
          + ' was not implemented correctly. It should have something like: \n'
          + '{\n' + getErrorMessage( subpaths ) + '\n  ...\n}' );
      }
      return value;
    }
  }

  return UserConfig;
} )();