// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Grunt configuration file. For background, see https://gruntjs.com/getting-started.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

module.exports = grunt => {
  'use strict';

  // modules
  const Util = require( './src/util/Util' );
  const Generator = require( './src/Util/Generator' );

  // constants
  const PACKAGE_JSON = grunt.file.readJSON( 'package.json' ) || {};

  //----------------------------------------------------------------------------------------
  // The following commands generate files.
  //----------------------------------------------------------------------------------------

  /**
   * Generates a README.md file (in the root directory) based on the template in './templates/readme-template.md'
   * @usage: `grunt generate-readme` || `grunt generate-readme --test`
   *
   * @option '--test' - generates a readme test file in './tests/readme-test.md' instead, but uses the same template.
   */
  // grunt.registerTask( 'generate-readme', 'Generates a README.md file', Util.wrap( () => {

  //   // flag that indicates where to generate the file to.
  //   const generatePath = grunt.option( 'test' ) === true ? 'tests/readme-test.md' : 'README.md';

  //   generate( PACKAGE_JSON, 'templates/readme-template.md', relativePath, generatePath );
  // } ) );

  // grunt.registerTask( 'hello', () => {

  // } );


  /**
   * Generates a README.md file (in the root directory) based on the template in './templates/readme-template.md'
   * @usage: `grunt generate-readme` || `grunt generate-readme --test`
   *
   * @option '--test' - generates a readme test file in './tests/readme-test.md' instead, but uses the same template.
   */
  grunt.registerTask( 'generate-readme',  Util.wrap( () => {

    // flag that indicates where to generate the file to.
    const generatePath = 'README.md';

    Generator.generateFile( 'templates/readme-template.md', generatePath );
  } ) );

};