// Copyright © 2019 Brandon Li. All rights reserved.

/* eslint bad-text: 0 */

/**
 * Custom eslint rule that checks for:
 *  - bad practices
 *  - IE support
 *  - common wrong annotations
 *  - common typos
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

module.exports = ( () => {
  'use strict';

  // constants
  const BAD_TEXTS = [

    // bad practices
    'extends Object',       // redundant inheritance, and can cause problems

    // IE support
    'Number.parseInt(',     // use lodash's _.parseInt
    'Array.prototype.find', // use lodash's _.find or make a custom implementation
    'Math.sign',            // use a custom solution
    'instanceof Array',     // use lodash's _.isArray

    // common wrong annotations
    '@params',              // use @param
    '@authors',             // use @author
    '@extend',              // use @extends
    '@constructor',         // es6 specific rule - no more function constructors! (so no annotation needed)

    // common typos
    ' the the ',
    ' a a ',
    ' of of ',
    ' to to ',
    ' in in ',
    ' is is ',
    ' that that ',
    ' on on ',
    ' with with ',
    ' for for ',
    ' from from ',
    ' it it ',
    ' is is '

  ];

  //------------------------------------------------------------------------------
  // Rule Definition
  //------------------------------------------------------------------------------
  return {

    //----------------------------------------------------------------------------------------
    // Meta-data
    //----------------------------------------------------------------------------------------
    meta: {
      type: 'problem', // use 'problem' since IE support should be a priority
      docs: {
        description: 'disallow bad-text',
        category: 'Possible Errors',
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

          // get the source code text
          const sourceCodeText = context.getSourceCode().text;

          BAD_TEXTS.forEach( badText => {

            // reference to a potential failure
            let failedText = null;
            if ( badText.regex instanceof RegExp && badText.regex.test( sourceCodeText ) ) {
              failedText = badText.name;
            }
            if ( sourceCodeText.indexOf( badText ) >= 0 ) {
              failedText = badText;
            }

            // report if a failure occurs
            failedText && context.report( {
              node,
              message: `File contains bad text: ${ badText }`
           } );

          } );
        }
      };

    }
  };

} )();