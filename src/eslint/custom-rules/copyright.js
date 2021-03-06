// Copyright © 2020 Brandon Li. All rights reserved.

/**
 * Custom ESlint rule that enforces the first line of each file to be a correctly implemented copyright statement,
 * including format and dates.
 *
 * See ../../src/Copyright.js (relative to this file) for more documentation of a valid copyright statement.
 * Validates by generating a correct copyright statement and comparing with the current copyright statement.
 *
 * See https://eslint.org/docs/developer-guide/working-with-rules for documentation of implementing ESlint custom rules.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

module.exports = ( () => {
  'use strict';

  // modules
  const Copyright = require( '../../Copyright' );

  return {

    // Meta-data
    meta: {
      type: 'suggestion',
      docs: {
        description: 'Enforces correct copyright statements, including format and dates.',
        url: 'https://github.com/brandonLi8/grunt-config/blob/master/eslint/rules/copyright.js',
        category: 'Stylistic Issues',
        recommended: true
      }
    },

    /**
     * Creates the Rule Definition.
     * @public
     *
     * @param {Object} context - Object literal that contains information relevant to the rule. See
     *                           https://eslint.org/docs/developer-guide/working-with-rules
     * @returns {Object} - Object literal with methods that ESlint calls to visit nodes while traversing through the AST
     */
    create( context ) {

      return {

        /**
         * Checks that the first line of each file is a copyright statement and is correctly implemented.
         * Called at the start of every file when traversing down the AST.
         * @public
         *
         * @param {ASTNode} node - the current node (of the file)
         */
        Program( node ) {

          // Check the file copyright from Copyright. Will return a boolean indicating if the copyright statement was
          // correct.
          if ( !Copyright.checkFileCopyright( context.getFilename(), false ) ) {
            // If the copyright statement was incorrect, report it.
            context.report( {
              node,
              loc: 1,
              message: 'Incorrect copyright statement on first line.'
            } );
          }
        }
      };
    }
  };
} )();