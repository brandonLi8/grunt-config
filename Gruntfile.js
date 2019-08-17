// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Grunt configuration file. For more context, see https://gruntjs.com/getting-started
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

module.exports = grunt => {
  'use strict';

  // modules
  const assert = require( './grunt-commands/helpers/assert' );
  const createTask = require( './grunt-commands/helpers/createTask' );
  const eslinter = require( './grunt-commands/eslinter' );
  const generate = require( './grunt-commands/generate' );

  // Convenience reference
  const packageObject = grunt.file.readJSON( 'package.json' );


  //========================================================================================
  // The following commands generate files
  //========================================================================================

  /**
   * Generates a README.md file (in the root directory) based on the template in './tests/readme-test.md'
   * @usage: `grunt generate-readme` || `grunt eslint --test`
   *
   * @option '--test' - generates a readme.test file in ./tests/readme-test.md instead, but uses the same template.
   */
  grunt.registerTask( 'generate-readme', 'Generates a README.md file', createTask( () => {

    // flag that indicates where to generate the file to.
    const generatePath = grunt.option( 'test' ) === true ? 'tests/readme-test.md' : 'README.md';

    // generate the file using the template
    generate( packageObject, 'templates/readme-template.md', generatePath );

  } ) );








  //========================================================================================
  // ES-LINT - linting JS files (`grunt eslint`)
  //
  // Uses a cache by default (i.e. if a file doesn't change, no need to re-lint)
  // Use `grunt eslint --no-cache` to ignore the cache
  //========================================================================================
  grunt.registerTask( 'eslint', 'lint all js files specific to the repo', createTask( () => {
    eslinter( packageObject.name, !grunt.option( 'no-cache' ), packageObject );
  } ) );


  //========================================================================================
  // GENERATE-TRAVIS - generates a .travis.yml file in the Root directory.
  //
  // Uses a cache by default (i.e. if a file doesn't change, no need to re-lint)
  // Use `grunt eslint --no-cache` to ignore the cache
  //========================================================================================
  grunt.registerTask( 'generate-travis', 'Generates a travis.yml file', createTask( () => {
    generateTravis( packageObject );
  } ) );





  //========================================================================================
  // CAN-BUILD - lints html, css, and javascript which effectively checks if the repo is in a
  // state to be built/compiled.
  //
  // Usage: 'grunt can-build'
  // Will automatically not use cache
  //========================================================================================
  grunt.registerTask( 'can-build', [
    'eslint', // lint javascript (no cache) TODO add linters for html, css, etc
    'generate-travis'
  ] );

};