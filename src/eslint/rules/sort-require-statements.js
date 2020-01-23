// Copyright © 2020 Brandon Li. All rights reserved.

/**
 * Custom ESlint rule that checks that the RequireJS statements of groups are alphabetically sorted (case-insensitive).
 *
 * For instance, the following group is correctly alphabetically sorted (case-insensitive):
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
      type: 'suggestion',
      docs: {
        description: 'Enforces require statements to be sorted in groups.',
        url: 'https://github.com/brandonLi8/grunt-config/blob/master/eslint/rules/sort-require-statements.js',
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

      // Array of an array of require statement nodes. Each sub-array represents a grouping of require
      // statements such that they are 1 line apart from each other.
      const requireStatementGroups = [];

      // Flag reference to the current group to add require statement nodes to while traversing down the AST.
      let currentGroup = [];

      // Flag reference to the last added node to a group to compare to new nodes while traversing down the AST.
      // This flag is used to determine if a node is part of currentGroup or a part of a new group.
      let lastNodeAdded;

      return {

        /**
         * Called when traversing down the AST at each variable declaration. If the variable declaration is a require
         * statement, this determines if it's a member of currentGroup or a member of a new group and records it.
         * No-op for non require statement variable declarations.
         * @public
         *
         * @param {ASTNode} node - the current node (a variable declaration)
         */
        VariableDeclaration( node ) {

          // Check every variable declaration to allow multiple variable declarations.
          node.declarations.forEach( declarationNode => {

            // First check if the variable declaration is a require statement. A typical require statement node for
            // `const VariableName = require( 'ModuleName' );` has the following properties that we care about:
            //   *|  id: { name: 'VariableName' },
            //   *|  init: {
            //   *|    callee: { name: 'require' },
            //   *|    arguments: [ {
            //   *|      value: 'ModuleName'
            //   *|    } ]
            //   *|  }
            if ( declarationNode.init &&
                 declarationNode.id &&
                 declarationNode.init.callee &&
                 declarationNode.init.arguments &&
                 declarationNode.init.callee.name === 'require' ) {

              // Determine if the current declarationNode is a member of a new group, which occurs when the
              // lastNodeAdded exists and either the declarationNode and the lastNodeAdded aren't in the same scope or
              // are more than 1 line apart.
              if ( lastNodeAdded && (
                     declarationNode.parent.parent !== lastNodeAdded.parent.parent ||
                     declarationNode.loc.start.line - lastNodeAdded.loc.start.line > 1 ) ) {  // member of new group

                // Before creating the new group push the current group and then re-reference it to a new array.
                requireStatementGroups.push( currentGroup );
                currentGroup = [];
              }

              // Always push the require statement declarationNode. Then re-reference the lastNodeAdded.
              currentGroup.push( declarationNode );
              lastNodeAdded = declarationNode;
            }
          } );
        },

        /**
         * Called when ESLint traverses back up the AST at the end of the file. Checks that each group of require
         * statements are alphabetically (case-insensitive) sorted.
         * @public
         *
         * @param {ASTNode} node - the current node (the file)
         */
        'Program:exit'( node ) {

          // Push the final group if it hasn't been pushed yet.
          if ( currentGroup.length ) requireStatementGroups.push( currentGroup );

          // Iterate through the require statement groups and check that each group array of nodes is alphabetically
          // sorted. If not, report the lint error.
          requireStatementGroups.forEach( group => {

            // First convert the nodes to the variable names, which determines if the require statements are merged.
            const variableNames = group.map( node => node.id.name );

            // Iterate through the variable names and check that each variable name is 'greater' than the previous,
            // or in other words, sorted.
            variableNames.forEach( ( variableName, index ) => {

              // Use toLowerCase for case-insensitive sorting. Use comparison operators to check ordering.
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