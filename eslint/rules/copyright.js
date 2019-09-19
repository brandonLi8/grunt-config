// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A custom rule that requires a correct copyright statement on the first line of every **.js file.
 *
 * Copyright statements MUST be in one of the two forms (case-sensitive):
 *    1. // Copyright © ${ YEAR } ${ AUTHOR }. All rights reserved.
 *    2. // Copyright © ${ YEAR }-${ YEAR } ${ AUTHOR }. All rights reserved.
 *
 *    - where `${ YEAR }` is any 4 digit year (eg. '2019')
 *    - where `${ AUTHOR }` is the author listed in **package.json**. The author key-value should look like:
 *
 *      ```
 *        "author": {
 *           "name": "Brandon Li",              // {required} your name
 *           "email": "brandon.li820@gmail.com" // {optional} your email
 *        }
 *      ```
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

module.exports = ( () => {
  'use strict';

  // modules
  const assert = require( '../../grunt-commands/helpers/assert' );
  const grunt = require( 'grunt' );

  // constants

  // String literal using RegExp for any 4-digit year. See https://www.rexegg.com/regex-quickstart.html for context.
  const YEAR = '\\d\\d\\d\\d';


  return {

    // Meta-data
    meta: {
      type: 'problem',
      docs: {
        description: 'Require correct copyright statements. See grunt-config//rules/copyright.js for more doc.',
        category: 'Best Practices',
        recommended: true
      },
      fixable: 'code', // not fixable
      schema: [] // no options
    },

    /**
     * Creates the Rule Definition
     * @param {Object} context - Object literal that contains information relevant to the rule. See
     *                           https://eslint.org/docs/developer-guide/working-with-rules
     *
     * @returns {Object} returns an Object with methods that ESlint calls to “visit” nodes while traversing the AST
     */
    create: context => {

      return {

        /**
         * Checks to make sure the copyright is correct. Called at the start of every file.
         *
         * @param {ASTNode} node - the current node (of the file)
         */
        Program( node ) {

          // convenience references
          const packageObj = grunt.file.readJSON( 'package.json' );
          const author = ( packageObj.author && packageObj.author.name ) ? packageObj.author.name : null;

          // Check that the package.json was implemented correctly.
          assert( typeof author === 'string',
            'package.json was not implemented correctly. See grunt-config/eslint/rules/copyright.js for doc.' );

          // Get the first line of code of the file. Derived be getting the entire source code but extracting
          // the string up to either the first newline or the end of the file (which ever occurs first).
          // If the file is empty, this results in an empty string.
          const firstLine = context.getSourceCode().text.split( '\n' )[ 0 ];

          // Array of booleans that indicate if they correspond to the template.
          const isValidCopyrights = [
            new RegExp( `// Copyright © ${ YEAR }-${ YEAR } ${ author }. All rights reserved.` ).test( firstLine ),
            new RegExp( `// Copyright © ${ YEAR } ${ author }. All rights reserved.` ).test( firstLine )
          ];

          // If there aren't any valid copyrights, report the incorrect copy right statement
          !isValidCopyrights.includes( true ) && context.report( {
            node,
            loc: 1,
            message: 'Incorrect copyright statement on first line.'
          } );
        }

      };
    }
  };

} )();