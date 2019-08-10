// Copyright 2018-2019, University of Colorado Boulder
/* eslint-disable */

/**
 * Lint detector for invalid text.  Checks the entire file and does not correctly report line number.
 * Lint is disabled for this file so the bad texts aren't themselves flagged.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
module.exports = function( context ) {
  'use strict';


  var badTexts = [
    'extends Object',
    ' the the ',
    ' a a ',
    '@return ',
    'Number.parseInt(',
    'Array.prototype.find',
    'Math.sign',
    'instanceof Array'
  ];

  return {
    Program: node => {
      const sourceCode = context.getSourceCode();
      const text = sourceCode.text;
      badTexts.forEach( badText => {
        let failedText = null;
        if ( badText.regex instanceof RegExp && badText.regex.test( text ) ) {
          failedText = badText.name;
        }
        if ( text.indexOf( badText ) >= 0 ) {
          failedText = badText;
        }
        failedText && context.report( {
          node: node,
          message: 'File contains bad text: \'' + failedText + '\''
       } );
      } );
    }
  };
};

module.exports.schema = [
  // JSON Schema for rule options goes here
];