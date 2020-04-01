// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * File Generator encapsulation that retrieves, registers, and validates replacement values and replaces placeholder
 * strings from a template file with these values. The result is then outputted in a specified output file.
 *
 * ## Background
 *  - A placeholder string is a string used in template files (see ../../templates) to indicate a string that changes
 *    for each project. They are wrapped with two brackets {{}} and all capitalized. For instance, the placeholder
 *    string '{{REPO_TITLE}}' is used in multiple template files to indicate the title of the project. In this case,
 *    the output file has this replaced with the actual repository title, as defined in the package.json name property.
 *
 *  - This class will retrieve properties from the package.json object and in some cases parse it. However, there is
 *    a chance that the user might have not implemented some of the properties / sub-properties correctly, so this class
 *    will validate all of package.json to ensure all placeholder strings in REPLACEMENT_STRINGS_SCHEMA can be replaced.
 *
 *  - Some placeholder values aren't determined by package.json and are calculated at run time. For instance,
 *    'COPYRIGHT_YEARS' depends on when the file was checked into git (see Copyright.js), which is checked at run time.
 *    These values are registered before replacing template strings in the generated file.
 *
 * NOTE: Will error out and provide helpful error messages if package.json isn't implemented correctly.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

module.exports = ( () => {
  'use strict';

  // modules
  const chalk = require( 'chalk' );
  const Copyright = require( './Copyright' );
  const grunt = require( 'grunt' );
  const path = require( 'path' );
  const UserConfig = require( './UserConfig' );
  const Util = require( './Util' );

  // constants
  // Object literal that describes ALL replacement strings in template files to replace. Each key is the replacement
  // string (without the brackets for now) and correlates with one of the three values stated below:
  // 1. String[] - nested keys path to the package value. For example, PACKAGE_JSON.foo.bar would have nested keys
  //               [ 'foo', 'bar' ]. PACKAGE_JSON is checked to have the nested keys (see
  //               UserConfig.parseNestedJSONValue()).
  // 2. Object Literal - an object literal with:
  //                      - a path key that correlates to an array of the nested package keys as described in 1.
  //                      - a parse key that correlates to a function that is called to 'parse' a value that is
  //                        retrieved from the package object. The returned value is the replacement value.
  // 3. Null - Indicates a replacement string whose value is determined at run time. These values are registered into
  //           REPLACEMENT_VALUES before replacing template strings in the generated file.
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
    COPYRIGHT_YEARS: null,
    BUILD_HEAD: null, // See Builder.js for more documentation.
    BUILD_BODY: null // See Builder.js for more documentation.
  };

  // Object literal that keeps track of the replacement values. This helps performance and ensures that replacement
  // values that aren't needed aren't validated, providing a better user experience.
  const REPLACEMENT_VALUES = {};

  class Generator {

    /**
     * Retrieves and validates a single value for a replacement string as defined in REPLACEMENT_STRINGS_SCHEMA.
     * Will error out if package.json was not implemented correctly for the specific value only (see
     * UserConfig.parseNestedJSONValue()).
     * @public
     *
     * @param {String} replacementString - the replacementString that correlates with the value, without the brackets.
     * @returns {String|number} - the replacement value that correlates with the replacementString
     */
    static getValue( replacementString ) {
      Util.assert( typeof replacementString === 'string', `invalid replacementString: ${ replacementString }` );
      Util.assert( replacementString in REPLACEMENT_STRINGS_SCHEMA, `{{${ replacementString }}} not registered.` );

      // If the value has already been retrieved, return it.
      if ( replacementString in REPLACEMENT_VALUES ) return REPLACEMENT_VALUES[ replacementString ];

      // Reference the Schema from REPLACEMENT_STRINGS_SCHEMA
      const schema = REPLACEMENT_STRINGS_SCHEMA[ replacementString ];

      // Reference the value to parse and validate.
      let value;

      // Three different types of schema. See REPLACEMENT_STRINGS_SCHEMA for more documentation.
      if ( schema && _.isArray( schema ) ) {
        value = UserConfig.parseNestedJSONValue( 'PACKAGE_JSON', schema, replacementString );
      }
      else if ( schema && Object.getPrototypeOf( schema ) === Object.prototype ) {
        value = schema.parse( UserConfig.parseNestedJSONValue( 'PACKAGE_JSON', schema.path, replacementString ) );
      }
      else { // schema was null type, but wasn't registered into REPLACEMENT_VALUES.
        Util.throw( `Tried to retrieve replacement value for {{${ replacementString }}} but it wasn't registered.` );
      }

      // Save the value into the REPLACEMENT_VALUES object to ensure the same value isn't validated and parsed twice.
      REPLACEMENT_VALUES[ replacementString ] = value;
      return value;
    }

    /**
     * Registers a value for a replacement string to REPLACEMENT_VALUES to be replaced for the next generated file.
     * Used for replacement values that are computed at run time. The replacement string must be apart of
     * REPLACEMENT_STRINGS_SCHEMA and correlate to a null value (see REPLACEMENT_STRINGS_SCHEMA declaration).
     * @public
     *
     * @param {String} replacementString - the replacementString to register, without the brackets.
     * @param {String|number} value - the replacement value to replace in the generated file.
     */
    static registerRunTimeReplacementValue( replacementString, value ) {
      Util.assert( typeof replacementString === 'string', `invalid replacementString: ${ replacementString }` );
      Util.assert( [ 'string', 'number' ].includes( typeof value ), `invalid value: ${ value }` );
      Util.assert( replacementString in REPLACEMENT_STRINGS_SCHEMA
        && REPLACEMENT_STRINGS_SCHEMA[ replacementString ] === null,
        `replacementString {{${ replacementString }}} not registered as a run-time replacement value.` );

      // Save the value into REPLACEMENT_VALUES for the next getValue call.
      REPLACEMENT_VALUES[ replacementString ] = value;
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

      // Retrieve the template file via the grunt file reader, relative to GRUNT_CONFIG_PATH (grunt-config.)
      let template = grunt.file.read( path.join( Util.GRUNT_CONFIG_PATH, templateFilePath ) );

      // Register the COPYRIGHT_YEARS replacement value.
      this.registerRunTimeReplacementValue( 'COPYRIGHT_YEARS', Copyright.computeCopyrightYears( outputFilePath ) );

      // Get the replacement strings in the template file that are registered in REPLACEMENT_STRINGS_SCHEMA.
      const replacementStrings = Util.getInnerDelimeterStrings( template, '{{', '}}' )
                                  .filter( str => str in REPLACEMENT_STRINGS_SCHEMA );

      // Replace each replacement string (wrapped with brackets {{}}) in the template file with the replacement value.
      replacementStrings.forEach( replacementString => {

        // Parse the replacement value and replace all template values.
        const replacementValue = Generator.getValue( replacementString );
        template = Util.replaceAll( template, `{{${ replacementString }}}`, replacementValue );
      } );

      // Write to the repository's root directory.
      grunt.file.write( path.join( Util.REPO_PATH, outputFilePath ), template );

      Util.log( chalk.hex( '046200' )( `\nSuccessfully generated ${ Util.toRepoPath( outputFilePath ) }` ) );
    }
  }

  return Generator;
} )();