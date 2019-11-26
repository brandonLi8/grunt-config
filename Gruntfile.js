// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Grunt configuration file. For more context, see https://gruntjs.com/getting-started
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

module.exports = grunt => {
  'use strict';


  grunt.registerTask( 'test', () => {

    const Util = require( './src/Util' );

    grunt.log.writeln( Util.toTitleCase( 'foo-bar' ) );

  } );





};