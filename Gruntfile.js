// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Grunt configuration file for the project.
 *
 * This file should generally stay the same, as the configurations for specific tasks are not found here.
 * This file is rather of a gathering of tasks.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

// modules
const assert = require( './grunt-commands/helpers/assert' );
const createTask = require( './grunt-commands/helpers/createTask' );
const eslinter = require( './grunt-commands/eslinter' );
const generateTravis = require( './grunt-commands/generateTravis' );
const generateReadme = require( './grunt-commands/generateReadme' );


module.exports = grunt => {
  'use strict';

  // Convenience reference
  const packageObject = grunt.file.readJSON( 'package.json' );

  //

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
  // `grunt generate-readme` - generates a README.md file in the toot directory.
  //========================================================================================
  grunt.registerTask( 'generate-readme', 'Generates a travis.yml file', createTask( () => {
    generateReadme( packageObject );
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