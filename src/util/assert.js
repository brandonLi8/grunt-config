// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A basic grunt-specific assertion function.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */
module.exports = ( () => {
  'use strict';

  // modules
  const grunt = require( 'grunt' );

  /**
   * The common assertion function.
   * @public
   *
   * @param {boolean} predicate - throws an error if not truthy.
   * @param {string} [message] - message to throw
   */
  const assert = ( predicate, message ) => {
    if ( !predicate ) {

      message = message ? 'Assertion failed: ' + message : 'Assertion failed';

      grunt.fail.fatal( message );
    }
  }

  return assert;
} );