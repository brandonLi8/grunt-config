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
const path = require( 'path' );
const eslinter = require( './eslint/eslinter' );

module.exports = grunt => {
  'use strict';

  // Convenience reference
  const packageObject = grunt.file.readJSON( 'package.json' );


  //========================================================================================
  // ES-LINT - linting JS files
  //
  // Uses a cache by default (i.e. if a file doesn't change, no need to re-lint)
  // Use `grunt eslint --no-cache` to ignore the cache
  //========================================================================================
  grunt.registerTask( 'eslint', 'lint all js files specific to the repo', () => {

    const useCache = !grunt.option( 'no-cache' );

    // Check package.json was implemented correctly.
    assert( packageObject && packageObject.eslintConfig && packageObject.eslintConfig.extends !== null,
      'package.json either doesn\'t exist or doesn\'t have a eslintConfig - extends path.'
      + '\n\nSee https://github.com/brandonLi8/grunt-config#readme for installation instructions.' );

    //----------------------------------------------------------------------------------------
    handleTask( () => {

      const pathToRules = process.cwd()
                          + '/'
                          + path.dirname( packageObject.eslintConfig.extends )
                          + '/rules';
      eslinter( packageObject.name, useCache, pathToRules );
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


  /**
   * Grunt specific assertion.
   *
   * @param {boolean} value
   * @param {string} message
   */
  function assert( value, message ) {
    if ( value === false ) {
      grunt.fail.fatal( message || 'assertion failed' );
    }
    else if ( value !== true ) {
      grunt.fail.fatal( `invalid value ${ value }. Must be a boolean.` );
    }
  }

};