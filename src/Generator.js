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
  const UserConfig = require( './UserConfig' );
  const Util = require( './Util' );

  // constants
  // Object literal that describes the replacement strings in template files to replace. Each key is the replacement
  // string (without the brackets for now) and correlates with one of the three values stated below:
  // 1. String[] - nested keys path to the package value. For example, PACKAGE_JSON.foo.bar would have nested keys
  //               [ 'foo', 'bar' ]. PACKAGE_JSON is checked to have the nested keys (see
  //               UserConfig.parseNestedJSONValue()).
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
    GITHUB_URL: { path: [ 'repository', 'url' ], parse: value => value.replace( /.git|git+/i, '' ) },
    REPO_TITLE: { path: [ 'name' ], parse: value => Util.toTitleCase( value ) },
    COPYRIGHT_YEARS: Util.CURRENT_YEAR  // Use the current year for now, then use ./Copyright to update after generating
  };

  // Object literal that keeps track of the replacement values. This helps performance and ensures that replacement
  // values that aren't needed aren't validated, providing a better user experience.
  const REPLACEMENT_VALUES = {};

  class Generator {

    /**
     * Retrieves and validates a single value for a replacement strings as defined in REPLACEMENT_STRINGS_SCHEMA.
     * Will error out if package.json was not implemented correctly for the specific value only (see
     * UserConfig.parseNestedJSONValue()).
     * @public
     *
     * @public {String} replacementString - the replacementString that correlates with the value to get.
     * @returns {Object} mapping object that maps replacement strings (keys) to their replacement value.
     */
    static getReplacementValue( replacementString ) {

      // If the value has already been retrieved, return it.
      if ( REPLACEMENT_VALUES.hasOwnProperty( replacementString ) ) return REPLACEMENT_VALUES[ replacementString ];

      // Reference the Schema from REPLACEMENT_STRINGS_SCHEMA
      const schema = REPLACEMENT_STRINGS_SCHEMA[ replacementValue ];

      // Reference the value to get.
      let value;

      // Three different types of schema. See REPLACEMENT_STRINGS_SCHEMA for more documentation.
      if ( Array.isArray( schema ) ) {
        value = UserConfig.parseNestedJSONValue( 'PACKAGE_JSON', schema, replacementString );
      }
      else if ( Object.getPrototypeOf( schema ) === Object.prototype ) {
        value = schema.parse( UserConfig.parseNestedJSONValue( 'PACKAGE_JSON', schema.path, replacementString ) );
      }
      else {
        value = schema;
      }

      // Save the value into the REPLACEMENT_VALUES object to ensure the same value isn't validated twice.
      REPLACEMENT_VALUES[ replacementString ] = value;
      return value;
    },

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

      // Replace each replacement string (wrapped with brackets {{}}) with the respective parsed replacement value.
      Util.iterate( REPLACEMENT_STRINGS_SCHEMA, replacementString => {

        // Parse the replacement value
        const replacementValue = Generator.getReplacementValue( replacementString );

        template = Util.replaceAll( template, `{{${ replacementString }}}`, replacementValue );
      } );

      // Write to the repository's root directory.
      grunt.file.write( outputFilePath, template );

      // Update the Copyright Statement now that the file has been generated. The require statement is in here to fix
      // circular dependency problems.
      require( './Copyright' ).updateFileCopyright( outputFilePath );

      Util.log( chalk.hex( '046200' )( `\nSuccessfully generated ${ Util.toRepoPath( outputFilePath ) }` ) );
    }
  }

  return Generator;
} )();