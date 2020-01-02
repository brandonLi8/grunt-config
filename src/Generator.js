// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * File Generator encapsulation that retrieves and validates values from package.json and replaces placeholder strings
 * from a template file with these values. The result is then outputted in a specified output file.
 *
 * ## Background
 *  - A placeholder string is a string used in template files (see ../../templates) to indicate a string that changes
 *    for each project. They are wrapped with two brackets {{}} and all capitalized. For instance, the placeholder
 *    string '{{REPO_TITLE}}' is used in multiple template files to indicate the title of the project. In this case,
 *    the output file has this replaced with the actual repository title, as defined in the package.json name property.
 *
 *  - This class will retrieve the properties from the package.json object and in some cases parse it. However, there is
 *    a chance that the user might have not implemented some of the properties / sub-properties correctly, so this class
 *    will validate all of package.json to ensure all placeholder strings in REPLACEMENT_STRINGS_SCHEMA can be replaced.
 *
 * NOTE: Will error out and provide helpful error messages if package.json isn't implemented correctly.
 * NOTE: Copyright statements will be checked after generating based on when the file was checked into git.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

module.exports = ( () => {
  'use strict';

  // modules
  const chalk = require( 'chalk' );
  const grunt = require( 'grunt' );
  const path = require( 'path' );
  const Util = require( './Util' );

  // constants
  const PACKAGE_JSON = grunt.file.readJSON( 'package.json' ) || {};

  // Object literal that describes the replacement strings in template files to replace. Each key is the replacement
  // string (without the brackets for now) and correlates with one of the three values stated below:
  // 1. String[] - nested keys path to the package value. For example, PACKAGE_JSON.foo.bar would have nested keys
  //               [ 'foo', 'bar' ]. PACKAGE_JSON is checked to have the nested keys (see parseNestedPackageValue()).
  // 2. Object Literal - an object literal with:
  //                      - a path key that correlates to an array of the nested package keys as described in 1.
  //                      - a parse key that correlates to a function that is called to 'parse' a value that is
  //                        retrieved from the package object. The returned value is the replacement value.
  // 3. * - the actual replacement value to replace the replacement string in the template file.
  const REPLACEMENT_STRINGS_SCHEMA = {
    AUTHOR: [ 'author', 'name' ],
    AUTHOR_EMAIL: [ 'author', 'email' ],
    DESCRIPTION: [ 'description' ],
    GIT_REMOTE: [ 'repository', 'url' ],
    HOMEPAGE: [ 'homepage' ],
    ISSUES_URL: [ 'bugs', 'url' ],
    REPO_NAME: [ 'name' ],
    VERSION: [ 'version' ],
    LICENSE: [ 'license' ],
    GITHUB_URL: { path: [ 'repository', 'url' ], parse: value => value.replace( '.git', '' ) },
    REPO_TITLE: { path: [ 'name' ], parse: value => Util.toTitleCase( value ) },
    COPYRIGHT_YEARS: Util.CURRENT_YEAR  // Use the current year for now, then use ./Copyright to update after generating
  };

  class Generator {

    /**
     * Retrieves and validates all values for replacement strings as defined in REPLACEMENT_STRINGS_SCHEMA.
     * Will error out if package.json was not implemented correctly (see parseNestedPackageValue()).
     * @public
     *
     * @returns {Object} mapping object that maps replacement strings (keys) to their replacement value.
     */
    static getReplacementValuesMapping() {
      const mapping = {}; // the result mapping

      Util.iterate( REPLACEMENT_STRINGS_SCHEMA, ( replacementString, schema ) => {

        // Three different types of schema. See REPLACEMENT_STRINGS_SCHEMA for more documentation.
        if ( Array.isArray( schema ) ) {
          mapping[ replacementString ] = this.parseNestedPackageValue( schema, replacementString );
        }
        else if ( Object.getPrototypeOf( schema ) === Object.prototype ) {
          mapping[ replacementString ] = schema.parse( this.parseNestedPackageValue( schema.path, replacementString ) );
        }
        else {
          mapping[ replacementString ] = schema;
        }
      } );
      return mapping;
    }

    /**
     * The main API of this file. Retrieves and validates values from package.json and replaces placeholder strings
     * from a template file with these values. The result is then outputted in a specified output file.
     * @public
     *
     * @param {string} templateFilePath - path to the template file, relative to the root of THIS repository.
     * @param {string} outputFilePath - potential path to the output file, relative to the root of the repository.
     */
    static generateFile( templateFilePath, outputFilePath ) {

      // Retrieve the template file via the grunt file reader.
      let template = grunt.file.read( path.dirname( __dirname ) + '/' + templateFilePath );

      // Create an object literal that maps replacement strings to their replacement values respectively.
      const replacementValuesMapping = this.getReplacementValuesMapping();

      // Replace each replacement string (wrapped with brackets {{}}) with the respective parsed replacement value.
      Util.iterate( replacementValuesMapping, ( replacementString, replacementValue ) => {
        template = Util.replaceAll( template, `{{${ replacementString }}}`, replacementValue );
      } );

      // Write to the repository's root directory.
      grunt.file.write( outputFilePath, template );

      // Update the Copyright Statement now that the file has been generated. The require statement is in here to fix
      // circular dependency problems.
      require( './Copyright' ).updateFileCopyright( outputFilePath );

      Util.log( chalk.hex( '046200' )( `\nSuccessfully generated ${ chalk.underline( outputFilePath ) }` ) );
    }

    /**
     * Retrieves a nested property value of the package.json object. Uses an array of sub-paths to represent the nested
     * keys. For instance, parseNestedPackageValue( [ 'foo', 'bar' ] ) gets PACKAGE_JSON.foo.bar.
     * @public
     *
     * The value is then validated such that it must be either a number or a string. If the PACKAGE_JSON object doesn't
     * contain any of the sub-path keys, it errors out with a helpful error message to guide the user to correct it.
     *
     * @param {String[]} subpaths - the nested keys to parse from package.json
     * @param {String} valueName - name of the value. Only used if package.json isn't implemented correctly
     * @returns {number|string} - the parsed value
     */
    static parseNestedPackageValue( subpaths, valueName ) {
      Util.assert( subpaths.every( path => typeof path === 'string' ) );

      // Create a flag for the package.json object and traverse throw each nested path to the value.
      let value = PACKAGE_JSON;
      subpaths.forEach( subpath => {
        if ( !Object.prototype.hasOwnProperty.call( value, subpath ) ) throwPackageError( subpaths, valueName );
        value = value[ subpath ];
      } );

      // We have traversed through the Package to the current path. Double check that the value is a string or a number.
      if ( !( typeof value === 'number' || typeof value === 'string' ) ) throwPackageError( subpaths, valueName );
      return value;
    }
  }


  //----------------------------------------------------------------------------------------
  // Helpers
  //----------------------------------------------------------------------------------------
  /**
   * Throws an error such that the message is helpful to guide the user to correct package.json.
   * For instance, throwPackageError( [ 'hello', 'world' ] ) would throw:
   * ```
   *    package.json was not implemented correctly. Ensure that you have:
   *      "hello": {
   *         "world": {{WORLD}}
   *      }
   * ```
   * See parseNestedPackageValue for context of subpaths. This function is implemented recursively.
   *
   * @param {String[]} subpaths
   * @param {String} valueName - name of the sub-path value. Only used if package.json isn't implemented correctly
   */
  function throwPackageError( subpaths, valueName ) {
    Util.assert( subpaths.every( path => typeof path === 'string' ) );

    // First, get the error message by recursively creating the error message.
    const getErrorMessage = paths => {
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
    // Throw the package error.
    Util.throw( chalk.underline( 'package.json' ) +' should have: \n{\n' + getErrorMessage( subpaths ) + '\n  ...\n}' );
  }

  return Generator;
} )();