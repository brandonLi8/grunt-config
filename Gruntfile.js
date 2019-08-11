// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Grunt configuration file for the project.
 *
 * This file should generally stay the same, as the configurations for specific tasks are not found here.
 * This file is more of a gathering of tasks.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

// modules
const assert = require( './grunt-commands/helpers/assert' );
const eslinter = require( './grunt-commands/eslinter' );
const generateTravis = require( './grunt-commands/generateTravis' );

module.exports = grunt => {
  'use strict';

  // Convenience reference
  const packageObject = grunt.file.readJSON( 'package.json' );


  //========================================================================================
  // ES-LINT - linting JS files (`grunt eslint`)
  //
  // Uses a cache by default (i.e. if a file doesn't change, no need to re-lint)
  // Use `grunt eslint --no-cache` to ignore the cache
  //========================================================================================
  grunt.registerTask( 'eslint', 'lint all js files specific to the repo', () => {

    const useCache = !grunt.option( 'no-cache' );
    handleTask( () => {
      eslinter( packageObject.name, useCache, packageObject );
    } );
  } );

  //========================================================================================
  // CAN-BUILD - lints html, css, and javascript which effectively checks if the repo is in a
  // state to be built/compiled.
  //
  // Usage: 'grunt can-build'
  // Will automatically not use cache
  //========================================================================================
  grunt.registerTask( 'can-build', 'checks to makes sure the repo is linted correctly', [
    'eslint' // lint javascript (no cache)
  ] );


  //========================================================================================
  // GENERATE-TRAVIS - generates a .travis.yml file in the Root directory.
  //
  // Uses a cache by default (i.e. if a file doesn't change, no need to re-lint)
  // Use `grunt eslint --no-cache` to ignore the cache
  //========================================================================================
  grunt.registerTask( 'generate-travis', 'Generates a travis.yml file', () => {
    handleTask( () => {
      generateTravis( packageObject );
    } );
  } );


  //========================================================================================
  // Helper functions
  //========================================================================================

  /**
   * Custom handling of a grunt task. Ensures that if a failure happens, a full stack trace is provided, regardless of
   * whether --stack was provided.
   *
   * @param {function} task
   */
  function handleTask( task ) {
    assert( typeof task === 'function', `invalid task: ${task}` );
    try {
      task();
    }
    catch( error ) {
      assert( false, `Task failed:\n${ error.stack || error }` );
    }
  }

};