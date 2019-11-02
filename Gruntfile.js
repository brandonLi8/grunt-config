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
  const labels = require( './grunt-commands/labels' );
  const githubLabelSync = require( 'github-label-sync' );

  // Convenience reference
  const packageObject = grunt.file.readJSON( 'package.json' );


  //========================================================================================
  // The following commands "generate" files
  //========================================================================================

  /**
   * Generates a README.md file (in the root directory) based on the template in './templates/readme-template.md'
   * @usage: `grunt generate-readme` || `grunt generate-readme --test`
   *
   * @option '--test' - generates a readme test file in './tests/readme-test.md' instead, but uses the same template.
   */
  grunt.registerTask( 'generate-readme', 'Generates a README.md file', createTask( () => {

    // flag that indicates where to generate the file to.
    const generatePath = grunt.option( 'test' ) === true ? 'tests/readme-test.md' : 'README.md';

    generate( packageObject, 'templates/readme-template.md', generatePath );
  } ) );

  /**
   * Generates a .travis.yml file (in the root directory) based on the template in './templates/travis-template.yml'
   * @usage: `grunt generate-travis` || `grunt generate-travis --test`
   *
   * @option '--test' - generates a travis test file in ./tests/travis-test.md instead, but uses the same template.
   */
  grunt.registerTask( 'generate-travis', 'Generates a .travis.yml file', createTask( () => {

    // flag that indicates where to generate the file to.
    const generatePath = grunt.option( 'test' ) === true ? 'tests/travis-test.yml' : '.travis.yml';

    generate( packageObject, 'templates/travis-template.yml', generatePath );
  } ) );



  /**
   * Generates a .gitignore file (in the root directory) based on the template in
   * './templates/gitignore_template.gitignore'
   * @usage: `grunt generate-gitignore` || `grunt generate-gitignore --test`
   *
   * @option '--test' - generates a gitignore test file in ./tests/gitignore-test.md.
   */
  grunt.registerTask( 'generate-gitignore', 'Generates a .gitignore file', createTask( () => {

    // flag that indicates where to generate the file to.
    const generatePath = grunt.option( 'test' ) === true ? 'tests/gitignore-test.yml' : '.gitignore';

    generate( packageObject, 'templates/gitignore-template.gitignore', generatePath );
  } ) );


  grunt.registerTask( 'generate-labels', 'Generates github labels', ( accessToken, repo ) => {

    const done = grunt.task.current.async();

    grunt.log.writeln( 'Generating labels...\n' );

    githubLabelSync( { repo, labels, accessToken } ).catch( error => {
      assert( false, 'Something went wrong: ' + error )
    } ).then( () => {
      grunt.log.writeln( 'Successfully generated Github Labels.' );
      done();
    } );
  }  );


  //========================================================================================
  // ES-LINT - linting JS files (`grunt eslint`)
  //
  // Uses a cache by default (i.e. if a file doesn't change, no need to re-lint)
  // Use `grunt eslint --no-cache` to ignore the cache
  //========================================================================================
  grunt.registerTask( 'eslint', 'lint all js files specific to the repo', createTask( () => {
    eslinter( packageObject.name.split( '/' )[ 1 ], !grunt.option( 'no-cache' ), packageObject );
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