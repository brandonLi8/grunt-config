// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Generator encapsulation that retrieves and validates values from package.json and replaces template strings
 * from a template file with these values. The result is then outputted in a specified file.
 *
 * ## Background
 *  - A template string is a string that changes for each project. It is is wrapped with {{}}.
 *    For instance, `{{REPO_TITLE}}` (template for the title of the project) is used in template files. This class will
 *    retrieve the name property from the package.json object and convert it to title case. However, there is a chance
 *    that the user might have not implemented this property, so this class will validate all of package.json
 *    to replace all template strings from the TEMPLATE_STRINGS_SCHEMA.
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
  // string and correlates with one of the three values stated below:
  // 1. String[] - nested keys to the package value. For example, PACKAGE_JSON.foo.bar correlates with [ 'foo', 'bar' ]
  //                The package object is checked to have this value, which is the replacement value.
  // 2. Object literal - an object literal with:
  //                - a path key that correlates to an array of the nested package keys as described in 1.
  //                - a parse key that correlates to a function that is called to 'parse' a value that is
  //                  retrieved from the package object. The returned value is is the replacement value.
  // 3. * - the actual replacement value to replace the replacement string in the template file.
  const TEMPLATE_STRINGS_SCHEMA = {
    AUTHOR: [ 'author', 'name' ],
    AUTHOR_EMAIL: [ 'author', 'email' ],
    DESCRIPTION: [ 'description' ],
    GIT_REMOTE: [ 'repository', 'url' ],
    HOMEPAGE: [ 'homepage' ],
    ISSUES_URL: [ 'bugs' ],
    LICENSE: [ 'license' ],
    REPO_NAME: { path: 'name', parse: Util.toTitleCase },
    REPO_NAME: { path: 'name', parse: Util.toTitleCase },

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

        if ( Array.isArray( schema ) ) {
          let obj = PACKAGE_JSON;
          schema.forEach( subpath => {
            if ( !Object.prototype.hasOwnProperty.call( obj, subpath ) ) Generator.throwPackageError( schema );

            obj = obj[ subpath ];
          } );

          assert( obj)
        }
        else if ( Object.getPrototypeOf( schema ) === Object.prototype ) {
          schema.

        }

      } );
  // var args = Array.prototype.slice.call(arguments, 1);


  // return true;

  //     TEMPLATE_STRINGS_SCHEMA.forEach( replacementString => {

      // } );
//       assert( obj && typeof obj.value === 'string', `

// package.json was not implemented correctly when replacing ${ replacementString }.
// Double check that you have something like
// ${ obj.failExample || 'something went wrong :( unable to find example' }
    }

  }
  Generator.validatePackageJSON();

  // return Generator;


    /**
     * Replaces all instances of the keys (as placeholder substrings) of the mapping with the corresponding values.
     * For instance, Util.replacePlaceholders( '{{NAME}} {{AGE}}', { NAME: 'bob', AGE: 5 } ) returns 'bob 5'.
     * Used to customize template files with content from package.json.
     * @public
     *
     * @param {string} str - the input string
     * @param {Object} mapping - object literal of the keys as the substring to find and replace with the value.
     * @returns {string}
     */
    // replacePlaceholders( str, mapping ) {
    //   Util.assert( typeof str === 'string', `invalid str: ${ str }` );
    //   Util.assert( Object.getPrototypeOf( mapping ) === Object.prototype, `Extra prototype on mapping: ${ mapping }` );

    //   Object.keys( mapping ).forEach( key => {
    //     str = Util.replaceAll( str, `{{${ key }}}`, `${ mapping[ key ] }` );
    //   } );
    //   return str;
    // },
} )();



// /**
//  * @param {object} packageObject - object literal of package.JSON
//  * @param {string} templatePath - path to the template file
//  * @param {string} writePath - path to the file (doesn't have to exist) to write to
//  */
// module.exports = ( packageObject, templatePath, relativePath, writePath ) => {
//   'use strict';

//   assert( !packageObject || Object.getPrototypeOf( packageObject ) === Object.prototype,
//     `Extra prototype on Options: ${ packageObject }` );
//   assert( typeof templatePath === 'string', `invalid templatePath: ${ templatePath }` );
//   assert( typeof writePath === 'string', `invalid writePath: ${ writePath }` );



//   const lastChar = relativePath.charAt( relativePath.length - 1 );

//   ( lastChar !== '/' ) && ( relativePath += '/' );

//   templatePath = relativePath + templatePath;



//   // get the template file
//   let template = grunt.file.read( templatePath );



//   Object.keys( replacementStrings ).forEach( replacementString => {

//     const obj = replacementStrings[ replacementString ];

//     if ( template.includes( replacementString ) ) {


//       assert( obj && typeof obj.value === 'string', `

// package.json was not implemented correctly when replacing ${ replacementString }.
// Double check that you have something like
// ${ obj.failExample || 'something went wrong :( unable to find example' }

// inside your package.json.` );

//       template = template.replace( new RegExp( replacementString.replace( /[-\\^$*+?.()|[\]{}]/g, '\\$&' ), 'g' ), obj.value );

//     }

//   } );


//   //========================================================================================

//   // Write to the repository's root directory.
//   grunt.file.write( writePath, template );

//   grunt.log.write( '\n\nSuccessfully generated!' );