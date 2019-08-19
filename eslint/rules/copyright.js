// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A custom rule that requires a correct copyright statement on the first line
 *
 * ## Documentation:
 *  - The copyright statement must be in the form "Copyright © {{YEARS}} {{AUTHOR}}. All rights reserved."
 *  - the '{{YEARS}}' can be a single year (eg. '2019') or multiple years (eg. '2019-2022')
 *  - the {{AUTHOR}} is based on the author in the package.json file. The author should look like:
 *      "author": {
 *        "name": "Brandon Li",
 *        "email": "brandon.li820@gmail.com"
 *      }
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

module.exports = ( () => {
  'use strict';

  // modules
  const assert = require( '../../grunt-commands/helpers/assert' );
  const grunt = require( 'grunt' );

  // constants
  const PACKAGE = grunt.file.readJSON( 'package.json' );
  const AUTHOR = ( PACKAGE.author && PACKAGE.author.name ) ? PACKAGE.author.name : null;


  //------------------------------------------------------------------------------
  // Rule Definition
  //------------------------------------------------------------------------------
  return {

    //----------------------------------------------------------------------------------------
    // Meta-data
    //----------------------------------------------------------------------------------------
    meta: {
      type: 'problem',
      docs: {
        description: 'require correct copyright statements',
        category: 'Best Practices',
        recommended: true
      },
      fixable: 'code', // not fixable
      schema: [] // no options
    },

    /**
     * Creates the rule function
     * @param {Object} context - Object literal that contains information relevant to the rule. See
     *                           https://eslint.org/docs/developer-guide/working-with-rules
     *
     * @returns {Object} returns an Object with methods that ESlint calls to “visit” nodes while traversing the AST
     */
    create: context => {

      return {

        Program( node ) {

          // Check that the package.json was implemented correctly.
          assert( typeof AUTHOR === 'string',
            'package.json was not implemented correctly. See grunt-config/eslint/rules/copyright.js' );

          // Get the comments of the source code
          const comments = context.getSourceCode().getAllComments();


          if ( !comments || comments.length === 0 ) {
            context.report( {
              node: node,
              loc: 1,
              message: 'Incorrect copyright statement in first comment'
            } );
          }
          else {
            grunt.log.write( new RegExp( ` Copyright © \\d\\d\\d\\d-\\d\\d\\d\\d ${ AUTHOR }. All rights reserved\.` ) )
            var isDateRangeOK = new RegExp( ` Copyright © \\d\\d\\d\\d-\\d\\d\\d\\d ${ AUTHOR }. All rights reserved\.` ).test( comments[ 0 ].value );
            var isSingleDateOK = new RegExp( ` Copyright © \\d\\d\\d\\d ${ AUTHOR }. All rights reserved\.` ).test( comments[ 0 ].value );
            if ( !isDateRangeOK && !isSingleDateOK ) {
              context.report( {
                node: node,
                loc: comments[ 0 ].loc.start,
                message: 'Incorrect copyright statement in first comment'
              } );
            }
          }
        }

      };
    }
  };

} )();