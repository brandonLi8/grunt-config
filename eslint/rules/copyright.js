// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Custom ESlint rule that checks the first line of each file is a copyright statement and is correctly implemented.
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
  const grunt = require( 'grunt' );
  const Copyright = require( '../../src/Copyright' );

  return {

    // Meta-data
    meta: {
      type: 'problem',
      docs: {
        description: 'Enforces correct copyright statements. See grunt-config/src/Copyright.js for documentation.',
        category: 'Best Practices',
        recommended: true
      },
      fixable: 'code', // not fixable
      schema: [] // no options
    },

    /**
     * Creates the Rule Definition.
     * @public
     *
     * @param {Object} context - Object literal that contains information relevant to the rule. See
     *                           https://eslint.org/docs/developer-guide/working-with-rules
     * @returns {Object} - Object literal with methods that ESlint calls to visit nodes while traversing the AST
     */
    create: context => {

      return {

        /**
         * Checks that the first line of each file is a copyright statement and is correctly implemented.
         * Called at the start of every file.
         * @public
         *
         * @param {ASTNode} node - the current node (of the file)
         */
        Program( node ) {

          // Read the file first
          const fileContent = grunt.file.read( context.getFilename() );

          // Parse by line separator
          const fileLines = fileContent.split( /\r?\n/ ); // splits for both unix and windows newlines

          // If the first line doesn't equate to a correct copyright statement, report the lint error.
          if ( fileLines[ 0 ] !== Copyright.getFileCopyright( context.getFilename() ) ) {
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