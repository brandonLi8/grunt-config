// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Custom ESlint rule that checks that the RequireJS statements of groups are alphabetically sorted (case insensitive).
 *
 * For instance, the following group is alphabetically sorted (case insensitive):
 * ```
 *  const Apple = require( 'Apple' );
 *  const art = require( 'art' );
 *  const Bar = require( 'Bar' );
 *  const Zap = require( 'Zap' );
 * ```
 *
 * See https://eslint.org/docs/developer-guide/working-with-rules for documentation of implementing ESlint custom rules.
 *
 * This rule works by first traversing down the AST, searching for require variable statements that are in a group
 * (1 line apart from each other). Each group is recorded. Then, traverse back up the AST at the end of the file,
 * checking that each group of require statements are alphabetically sorted. Sorting is done by the variable name,
 * not the require module name.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

module.exports = ( () => {
  'use strict';

  return {

    // Meta-data
    meta: {
      type: 'problem',
      docs: {
        description: 'Enforces require statements to be sorted in groups.',
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
      // Reference the source code object.
      const sourceCode = context.getSourceCode();

      // Array of an array of require statement nodes. Each sub-array represents a grouping of require
      // statements such that they are 1 line apart from each other.
      const requireStatementGroups = [];

      // Flag reference to the current group to add require statement nodes to while traversing down the AST.
      let currentGroup = [];

      // Flag reference to the last added node to a group to compare to new nodes while traversing down the AST.
      // This flag is used to determine if a node is part of currentGroup or apart of a new group.
      let lastNodeAdded;

      return {

        /**
         * Called when traversing down the AST at a variable declaration. If the variable declaration is a require
         * statement, determine if its a new group or apart of the current group and record it.
         * @public
         *
         * @param {ASTNode} node - the current node (a variable declaration)
         */
        VariableDeclaration( node ) {

          // First check if the variable declaration is a require statement. A typical require statement node has the
          // following properties that we care about:
          // *|   id: {
          // *|     name: 'VariableName'
          // *|   },
          // *|   init: {
          // *|     callee: { name: 'require' },
          // *|     arguments: [ {
          // *|       value: 'ModuleName'
          // *|     } ]
          // *|   }
          // This corresponds with `const VariableName = require( 'ModuleName' );`
          // A node with the name property and the argument callee as 'require' is a require statement.
          if ( node.declarations[ 0 ].init &&
               node.declarations[ 0 ].id &&
               node.declarations[ 0 ].init.callee &&
               node.declarations[ 0 ].init.arguments &&
               node.declarations[ 0 ].init.callee.name === 'require' ) {

            // Always push new require statement nodes.
            currentGroup.push( node );

            // Determine if it's a new group, which occurs when the currentGroup flag doesn't exist, the lastNodeAdded
            // flag doesn't exist, or the node and the lastNodeAdded aren't 1 line apart.
            if ( lastNodeAdded && (
                  node.parent !== lastNodeAdded.parent ||
                  sourceCode.getFirstToken( node ).loc.start.line -
                  sourceCode.getLastToken( lastNodeAdded ).loc.start.line !== 1 ) ) {

              // If it is a new group, push the current group and re reference it to a new group array.
              requireStatementGroups.push( currentGroup );
              currentGroup = [];
            }
            // re-reference the lastNodeAdded.
            lastNodeAdded = node;
          }
        },

        /**
         * When ESLint traverses back up the AST, at the end of the file, check that each group of require statements
         * are alphabetically (case insensitive) sorted.
         * @public
         *
         * @param {ASTNode} node - the current node (of the file)
         */
        'Program:exit'( node ) {
          // Push the final group if it hasn't been pushed yet.
          if ( currentGroup.length ) requireStatementGroups.push( currentGroup );

          // Check that each array of nodes in requireStatementGroups is sorted. If not, report the lint error.
          requireStatementGroups.forEach( group => {
            // Convert from nodes to variable names (what to sort by)
            const variableNames = group.map( node => node.declarations[ 0 ].id.name );

            variableNames.forEach( ( variableName, index ) => {
              if ( index !== 0 && variableName.toLowerCase() < variableNames[ index - 1 ].toLowerCase() ) {
                context.report( {
                  loc: { start: group[ 0 ].loc.start, end: group[ group.length - 1 ].loc.end },
                  message: 'Require statements not alphabetically sorted.'
                } );
              }
            } );
          } );
        }
      };
    }
  };
} )();