// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * @fileoverview Rule to check that the copyright statement is present and correct
 * @author Brandon Li <brandon.li820@gmail.com>
 * @copyright © 2019 Brandon Li. All rights reserved.
 */

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function( context ) {
  'use strict';

  return {

    Program: function checkCopyright( node ) {

      var comments = context.getSourceCode().getAllComments();

      if ( !comments || comments.length === 0 ) {
        context.report( {
          node: node,
          loc: 1,
          message: 'Incorrect copyright statement in first comment'
        } );
      }
      else {
        var isDateRangeOK = /^ Copyright © 20\d\d-20\d\d Brandon Li. All rights reserved.$/.test( comments[ 0 ].value );
        var isSingleDateOK = /^ Copyright © 20\d\d Brandon Li. All rights reserved.$/.test( comments[ 0 ].value );
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
};

module.exports.schema = [
  // JSON Schema for rule options goes here
];