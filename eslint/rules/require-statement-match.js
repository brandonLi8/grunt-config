// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Custom ESlint rule that checks that the module name (case sensitive) of a RequireJS statement matches the variable.
 *
 * For instance:
 * ```
 *  // correct
 *  const ModuleName = require( 'path/foo/bar/ModuleName' );
 *  const Foo = require( 'Foo' );
 *
 *  // incorrect
 *  const WrongName = require( 'path/foo/bar/ModuleName' );
 *  const Bar = require( 'Foo' );
 *  const Bar = require( 'bar' ); // case sensitive
 * ```
 *
 * See https://eslint.org/docs/developer-guide/working-with-rules for documentation of implementing ESlint custom rules.
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
        description: 'Enforces variable names and module names of require statements to match.',
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
         * Checks that variable names and module names of require statements to match. No-op if the variable declaration
         * isn't a require statement.
         * @public
         *
         * @param {ASTNode} node - the current node (a variable declaration)
         */
        VariableDeclaration( node ) {

          // Check every variable declaration.
          node.declarations.forEach( declarationNode => {

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
            if ( declarationNode.init &&
                 declarationNode.id &&
                 declarationNode.init.callee &&
                 declarationNode.init.arguments &&
                 declarationNode.init.callee.name === 'require' ) {

              const variableName = declarationNode.id.name;
              const requireStatementPath = declarationNode.init.arguments[ 0 ].value;

              // Get the module name from the requireStatementPath. For instance, turn foo/bar/ModuleName to ModuleName.
              const moduleName = requireStatementPath.substring( requireStatementPath.lastIndexOf( '/' ) + 1 );

              if ( variableName !== moduleName ) {
                context.report( {
                  node,
                  loc: node.loc.start,
                  message: `Mismatched require statement values, ${ variableName } !== ${ moduleName }`
                } );
              }
            }
          } );
        }
      };
    }
  };
} )();