// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Generator encapsulation that retrieves and validates values from package.json and replaces template strings
 * from a template file with these values. The result is then outputted in a specified file.
 *
 * ## Background
 *  - A template string is a string that changes for each project. It is is wrapped with two brackets {{}} and are all
 *    caps. For instance, `{{REPO_TITLE}}` (template for the title of the project) is used in template files. This class
 *    will retrieve the name property from the package.json object and convert it to title case. However, there is a
 *    chance that the user might have not implemented this property, so this class will validate all of package.json
 *    to replace all template strings from the TEMPLATE_STRINGS_SCHEMA.
 *
 * Will error out and provide helpful error messages if package.json isn't implemented correctly.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

module.exports = ( () => {

  // modules
  const grunt = require( 'grunt' );
  const Util = require( './Util' );

  // constants
  const PACKAGE_JSON = grunt.file.readJSON( 'package.json' ) || {};

  // Object literal that describes the replacement strings in template files to replace. Each key is the replacement
  // string (without the brackets for now) and correlates with one of the three values stated below:
  // 1. String[] - nested keys to the package value. For example, PACKAGE_JSON.foo.bar correlates with [ 'foo', 'bar' ].
  //               The package object is checked to have this replacement value (see parseNestedPackageValue()).
  // 2. Object literal - an object literal with:
  //                      - a path key that correlates to an array of the nested package keys as described in 1.
  //                      - a parse key that correlates to a function that is called to 'parse' a value that is
  //                        retrieved from the package object. The returned value is the replacement value.
  // 3. * - the actual replacement value to replace the replacement string in the template file.
  const TEMPLATE_STRINGS_SCHEMA = {
    AUTHOR: [ 'author', 'name' ],
    AUTHOR_EMAIL: [ 'author', 'email' ],
    DESCRIPTION: [ 'description' ],
    GIT_REMOTE: [ 'repository', 'url' ],
    HOMEPAGE: [ 'homepage' ],
    ISSUES_URL: [ 'bugs', 'url' ],
    LICENSE: [ 'license' ],
    REPO_NAME: [ 'name' ],
    REPO_TITLE: { path: [ 'name' ], parse: value => Util.toTitleCase( value ) },
    YEAR: new Date().getFullYear()
  };

  class Generator {


    /**
     * Checks package.json such that all of the replacement strings in TEMPLATE_STRINGS_SCHEMA
     * contain a value that is either a number or a string. If the package doesn't have a path, this method
     * will error out with a useful message to guide the user to correct the package object.
     * @private
     */
    static validatePackageJSON() {

      Object.entries( TEMPLATE_STRINGS_SCHEMA ).forEach( ( [ replacementString, schema ] ) => {
        let value;
        if ( Array.isArray( schema ) ) {
          value = parseNestedPackageValue( schema );
        }
        else if ( Object.getPrototypeOf( schema ) === Object.prototype ) {
          value = schema.parse( parseNestedPackageValue( schema.path ) );
        }
        else {
          value = schema;
        }
        Util.assert( !!value, `something went wrong` );
      } );
    }

    /**
     * @param {string} templatePath - path to the template file
     * @param {string} writePath - path to the file (doesn't have to exist) to write to
     */
    static generateFile( templatePath, relativePath, writePath ) {

      Object.keys( TEMPLATE_STRINGS_SCHEMA ).forEach( replacementString => {

        const obj = replacementStrings[ replacementString ];

        if ( template.includes( replacementString ) ) {


          assert( obj && typeof obj.value === 'string', `

    package.json was not implemented correctly when replacing ${ replacementString }.
    Double check that you have something like
    ${ obj.failExample || 'something went wrong :( unable to find example' }

    inside your package.json.` );

          template = template.replace( new RegExp( replacementString.replace( /[-\\^$*+?.()|[\]{}]/g, '\\$&' ), 'g' ), obj.value );

        }

      } );



      // Write to the repository's root directory.
      grunt.file.write( writePath, template );

      grunt.log.write( '\n\nSuccessfully generated!' );
    }
  }


  //----------------------------------------------------------------------------------------
  // Helpers
  //----------------------------------------------------------------------------------------

  /**
   * Retrieves a nested property value of the package.json object. Uses an array of sub-paths to represent the nested
   * keys. For instance, parseNestedPackageValue( [ 'foo', 'bar' ] ) gets PACKAGE_JSON.foo.bar.
   *
   * The value is then validated such that it must be either a number or a string. If the PACKAGE_JSON object doesn't
   * contain any of the sub-path keys, it errors out with a helpful error message to guide the user to correct it.
   *
   * @param {String[]} subpaths - the nested keys to parse from package.json
   * @returns {number|string} - the parsed value
   */
  function parseNestedPackageValue( subpaths ) {
    Util.assert( subpaths.every( path => typeof path === 'string' ) );

    // Create a flag for the package.json object and traverse throw each nested path to the value.
    let value = PACKAGE_JSON;
    subpaths.forEach( subpath => {
      if ( !Object.prototype.hasOwnProperty.call( value, subpath ) ) throwPackageError( subpaths );
      value = value[ subpath ];
    } );

    // We have traversed through the Package to the current path. Double check that the value is a string or a number.
    if ( !( typeof value === 'number' || typeof value === 'string' ) ) throwPackageError( subpaths );
    return value;
  }

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
   */
  function throwPackageError( subpaths ) {
    Util.assert( subpaths.every( path => typeof path === 'string' ) );

    // First, get the error message by recursively creating the error message.
    const getPackageErrorMessage = paths => {
      // Base case - one path left is the value
      if ( paths.length === 1 ) {
        return `  "${ paths[ 0 ] }": {{${ subpaths.map( path => path.toUpperCase() ).join( '_' ) }}}`;
      }
      else {
        return `  "${ paths[ 0 ] }": {\n` +
               `  ${ Util.replaceAll( getPackageErrorMessage( paths.slice( 1 ) ), '\n', '\n  ' ) }\n` +
               `  }${ paths.length === subpaths.length ? '' : ',' }`;
      }
    };
    // Throw the package error.
    Util.assert(
      false,
      ` package.json was not implemented correctly. Ensure that you have: \n${ getPackageErrorMessage( subpaths ) }`
    );
  }

  return Generator;
} )();