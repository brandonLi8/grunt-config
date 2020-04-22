// Copyright © 2020 Brandon Li. All rights reserved.

/**
 * Utility class for referencing polyfills for building.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

module.exports = ( () => {
  'use strict';

  const Polyfill = {

    string: {
      includes: `if ( !String.prototype.includes ) {
                    String.prototype.includes = function( search, start ) {
                      if ( typeof start !== 'number' ) start = 0;

                      if ( start + search.length > this.length ) return false;
                      else return this.indexOf( search, start ) !== -1;
                    };
                  }`
    },

    array: {
      includes: `if ( !Array.prototype.includes ) {
                   Object.defineProperty( Array.prototype, 'includes', {
                     enumerable: false,
                     value: function( obj, start ) { return this.indexOf( obj, start ) !== -1 }
                   } );
                 }`,

      // From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
      find: `if ( !Array.prototype.find ) {
               Object.defineProperty( Array.prototype, 'find', {
                value: function( predicate ) {
                  var o = Object(this);
                  var len = o.length >>> 0;
                  if ( typeof predicate !== 'function' ) throw TypeError( 'predicate must be a function' );
                  var thisArg = arguments[ 1 ];
                  var k = 0;
                  while ( k < len ) {
                    var kValue = o[ k ];
                    if (predicate.call( thisArg, kValue, k, o ) ) return kValue;
                    k++;
                  }
                  return undefined;
                },
                configurable: true,
                writable: true
              } );
            }`

    }
  }

  return Polyfill;
} )();