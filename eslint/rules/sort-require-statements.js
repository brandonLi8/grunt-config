// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Custom ESlint rule that checks that the RequireJS statements of a file are alphabetically sorted (case insensitive).
 *
 * For instance, the following modules are alphabetically sorted case insensitive:
 * ```
 *  // modules
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

  // modules
  const assert = require( 'assert' );
  const grunt = require( 'grunt' );

  // constants
  const REQUIRE = /require\(/; // RegEx expression to test if a string contains a require call

  //------------------------------------------------------------------------------
  // Rule Definition
  const rule = {

    //----------------------------------------------------------------------------------------
    // Meta-data
    //----------------------------------------------------------------------------------------
    meta: {
      type: 'problem',
      docs: {
        description: 'require RequireJs require statements to be sorted',
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

      const sourceCode = context.getSourceCode();
      const requireStatementNodes = [];

      const check = ( group ) => {
        const texts = group.map( function( decl ) {
          return sourceCode.getText( decl );
        } );

        if ( !isSorted( texts ) ) {
          texts.sort( function( a, b ) {
            const aLower = a.toLowerCase();
            const bLower = b.toLowerCase();
            return aLower < bLower ? -1 : aLower > bLower ? 1 : 0;
          } );

          context.report( {
            loc: { start: group[ 0 ].loc.start, end: group[ group.length - 1 ].loc.end },
            message: 'This group of requires is not sorted',
            fix: function fix( fixer ) {
              return fixer.replaceTextRange( [ group[ 0 ].start, group[ group.length - 1 ].end ], texts.join( '\n' ) );
            }
          } );
        }
      };

      return {
        VariableDeclaration( node ) {
          if ( !hasRequire.test( sourceCode.getText( node ) ) ) return;

          if ( shouldStartNewGroup( node, previousNode ) ) {
            groups.push( [ node ] );
          }
          else {
            groups[ groups.length - 1 ].push( node );
          }

          previousNode = node;
        },
        'Program:exit': () => {
          grunt.log.write
          groups.forEach( check );
        }

      };

    }
  };


  return rule;
} )();


  //   /**
  //    * Creates the rule function
  //    * @param {Object} context - Object literal that contains information relevant to the rule. See
  //    *                           https://eslint.org/docs/developer-guide/working-with-rules
  //    *
  //    * @returns {Object} returns an Object with methods that ESlint calls to “visit” nodes while traversing the AST
  //    */
  //   create: context => {

  //     const sourceCode = context.getSourceCode();

  //     const hasRequire = /require\(/;
  //     const groups = [];
  //     let previousNode = void 0;

  //     const check = ( group ) => {
  //       const texts = group.map( function( decl ) {
  //         return sourceCode.getText( decl );
  //       } );

  //       if ( !isSorted( texts ) ) {
  //         texts.sort( function( a, b ) {
  //           const aLower = a.toLowerCase();
  //           const bLower = b.toLowerCase();
  //           return aLower < bLower ? -1 : aLower > bLower ? 1 : 0;
  //         } );

  //         context.report( {
  //           loc: { start: group[ 0 ].loc.start, end: group[ group.length - 1 ].loc.end },
  //           message: 'This group of requires is not sorted',
  //           fix: function fix( fixer ) {
  //             return fixer.replaceTextRange( [ group[ 0 ].start, group[ group.length - 1 ].end ], texts.join( '\n' ) );
  //           }
  //         } );
  //       }
  //     };

  //     function shouldStartNewGroup( node, previousNode ) {
  //       if ( !previousNode ) return true;
  //       if ( node.parent !== previousNode.parent ) return true;

  //       const lineOfNode = sourceCode.getFirstToken( node ).loc.start.line;
  //       const lineOfPrev = sourceCode.getLastToken( previousNode ).loc.start.line;
  //       return lineOfNode - lineOfPrev !== 1;
  //     }

  //     function isSorted( ary ) {
  //       return ary.every( function( value, idx ) {
  //         return idx === 0 || ary[ idx - 1 ].toLowerCase() <= value.toLowerCase();
  //       } );
  //     }

  //     return {
  //       VariableDeclaration: function VariableDeclaration( node ) {
  //         if ( !hasRequire.test( sourceCode.getText( node ) ) ) return;

  //         if ( shouldStartNewGroup( node, previousNode ) ) {
  //           groups.push( [ node ] );
  //         }
  //         else {
  //           groups[ groups.length - 1 ].push( node );
  //         }

  //         previousNode = node;
  //       },
  //       'Program:exit': function ProgramExit() {
  //         grunt.log.write
  //         groups.forEach( check );
  //       }
  //     };

  //   }
  // };