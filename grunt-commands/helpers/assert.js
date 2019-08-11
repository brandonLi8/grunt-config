// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * A grunt-specific assertion function.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

// modules
const grunt = require( 'grunt' );

// constants
const DEFAULT_MESSAGE = 'Grunt Assertion failed.';
const ERROR_FUNCTION = grunt.fail.fatal; // error function to property throw an error for a grunt command

/**
 * @public
 *
 * @param {boolean} predicate
 * @param {string} [message]
 */
module.exports = ( predicate, message ) => {
  'use strict';

  //----------------------------------------------------------------------------------------
  // Double check types on arguments
  if ( typeof predicate !== 'boolean' ) {
    ERROR_FUNCTION( `invalid predicate:${ predicate }` );
  }
  if ( typeof message !== 'string' || message === null ) {
    ERROR_FUNCTION( `invalid message: ${ message }` );
  }

  //----------------------------------------------------------------------------------------
  // assert the predicate is true
  if ( predicate === false ) {
    ERROR_FUNCTION( message || DEFUALT_MESSAGE );
  }
};