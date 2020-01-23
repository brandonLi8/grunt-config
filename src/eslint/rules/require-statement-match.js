// Copyright © 2020 Brandon Li. All rights reserved.

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
      type: 'suggestion',
      docs: {
        description: 'Enforces variable names and module names of require statements to match.',
        url: 'https://github.com/brandonLi8/grunt-config/blob/master/eslint/rules/require-statement-match.js',
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
         * Called when traversing down the AST at each variable declaration. If the variable declaration is a require
         * statement, this checks that variable name and module name exactly match. No-op for non require statement
         * variable declarations.
         * @public
         *
         * @param {ASTNode} node - the current node (a variable declaration)
         */
        VariableDeclaration( node ) {

          // Check every variable declaration to allow multiple variable declarations.
          node.declarations.forEach( declarationNode => {

            // First check if the variable declaration is a require statement. A typical require statement node for
            // `const VariableName = require( 'foo/barModuleName' );` has the following properties that we care about:
            //   *|  id: { name: 'VariableName' },
            //   *|  init: {
            //   *|    callee: { name: 'require' },
            //   *|    arguments: [ {
            //   *|      value: 'foo/bar/ModuleName'
            //   *|    } ]
            //   *|  }
            if ( declarationNode.init &&
                 declarationNode.id &&
                 declarationNode.init.callee &&
                 declarationNode.init.arguments &&
                 declarationNode.init.callee.name === 'require' ) {

              const variableName = declarationNode.id.name;
              const requireStatementPath = declarationNode.init.arguments[ 0 ].value;

              // Get the module name from the last path of the requireStatementPath. In the example above, this would
              // turn 'foo/bar/ModuleName' into 'ModuleName'.
              const moduleName = requireStatementPath.substring( requireStatementPath.lastIndexOf( '/' ) + 1 );

              if ( variableName !== moduleName ) {  // exact (case sensitive) match check
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