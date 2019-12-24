// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * @author Brandon Li <brandon.li820@gmail.com>
 */

module.exports = ( () => {
  'use strict';

  // modules
  const Util = require( './Util' );
  const Generator = require( './Generator' );

  // constants

  // Object literal that describes the Github issue labels that should be added. Each key is the name of the Github
  // issue label and correlates to one of the two values stated below:
  // 1. String - The color of the Github label as it appears in the issue. The label is assumed to have no aliases.
  // 2. Object Literal - an object literal with:
  //                      - a color key that correlates to a color string as described in 1.
  //                      - a string array that contains aliases to other labels
  const LABELS_SCHEMA = grunt.file.readJSON( path.dirname( __dirname ) + '/github-labels-schema.json';


  class Labeler {

  }

  return Labeler;
} )();