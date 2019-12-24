// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Grunt configuration file. For background, see https://gruntjs.com/getting-started.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

module.exports = grunt => {
  'use strict';

  // modules
  const Generator = require( './src/Generator' );
  const Labeler = require( './src/Labeler' );
  const Linter = require( './src/Linter' );
  const shell = require( 'shelljs' ); // eslint-disable-line require-statement-match
  const Util = require( './src/Util' );

  shell.config.silent = true;


  /**
   * ESlints the entire root directory that invoked the command, using the ESlint configuration defined in
   * grunt-config/eslint/.eslintrc.js.
   *
   * Run with --no-cache to lint without using a ESLint cache.
   */
  grunt.registerTask( 'eslint',
    'ESlints the entire root directory that invoked the command, using the ESlint configuration defined in ' +
    'grunt-config/eslint/.eslintrc.js. Run with --no-cache to lint without using a ESLint cache.',
    Util.wrap( () => {
      Linter.eslint( !grunt.option( 'no-cache' ) );
    } ) );



  grunt.registerTask( 'generate-labels', 'Generates github labels', Util.wrap( () => {
    console.log( 'eherh')
  } ) );

  //----------------------------------------------------------------------------------------
  // The following commands generate files.
  //----------------------------------------------------------------------------------------

  /**
   * Generates a README.md file in the root directory that invoked this command based on the template in
   * 'grunt-config/templates/readme-template.md'.
   *
   * Run with '--test' to output the file in 'tests/README-test.md' instead (relative to the root directory).
   */
  grunt.registerTask( 'generate-readme',
    'Generates a README.md file in the root directory that invoked this command. Run with --test to output ' +
    'the file in \'tests/README-test.md\' instead.',
    Util.wrap( () => {
      const path = grunt.option( 'test' ) ? 'tests/README-test.md' : 'README.md';
      Generator.generateFile( 'templates/readme-template.md', path );
    } ) );

  /**
   * Generates a .travis.yml file in the root directory that invoked this command based on the template in
   * 'grunt-config/templates/travis-template.md'.
   *
   * Run with '--test' to output the file in 'tests/.travis-test.yml' instead (relative to the root directory).
   */
  grunt.registerTask( 'generate-travis',
    'Generates a .travis.yml file in the root directory that invoked this command. Run with --test to ' +
    'output the file in \'tests/.travis-test.yml\' instead.',
    Util.wrap( () => {
      const path = grunt.option( 'test' ) ? 'tests/.travis-test.yml' : '.travis.yml';
      Generator.generateFile( 'templates/travis-template.yml', path );
    } ) );

  /**
   * Generates a .gitignore file in the root directory that invoked this command based on the template in
   * 'grunt-config/templates/gitignore-template.md'.
   *
   * Run with '--test' to output the file in 'tests/.gitignore-test.yml' instead (relative to the root directory).
   */
  grunt.registerTask( 'generate-gitignore',
    'Generates a .gitignore file in the root directory that invoked this command. Run with --test to ' +
    'output the file in \'tests/.gitignore-test.gitignore\' instead.',
    Util.wrap( () => {
      const path = grunt.option( 'test' ) ? 'tests/.gitignore-test.gitignore' : '.gitignore';
      Generator.generateFile( 'templates/gitignore-template.gitignore', path );
    } ) );

  /**
   * Generates a deploy-heroku.yml Github Action file in the root directory that invoked this command based on the
   * template in 'grunt-config/templates/deploy-heroku-template.yml'.
   *
   * Run with '--test' to output the file in 'tests/deploy-heroku-test.yml' instead (relative to the root directory).
   */
  grunt.registerTask( 'generate-deploy-heroku',
    'Generates a deploy-heroku.yml Github Action file in the root directory that invoked this command. Run with ' +
    '--test to output the file in \'tests/deploy-heroku-test.yml\' instead.',
    Util.wrap( () => {
      const path = grunt.option( 'test' ) ? 'tests/deploy-heroku-test.yml' : '.github/workflows/deploy-heroku.yml';
      Generator.generateFile( 'templates/deploy-heroku-template.yml', path );
    } ) );

  /**
   * Generates a .wercker.yml file in the root directory that invoked this command based on the template in
   * 'grunt-config/templates/wercker-template.md'.
   *
   * Run with '--test' to output the file in 'tests/.wercker-test.yml' instead (relative to the root directory).
   */
  grunt.registerTask( 'generate-wercker',
    'Generates a .wercker.yml file in the root directory that invoked this command. Run with --test to ' +
    'output the file in \'tests/.wercker-test.yml\' instead.',
    Util.wrap( () => {
      const path = grunt.option( 'test' ) ? 'tests/.wercker-test.yml' : '.wercker.yml';
      Generator.generateFile( 'templates/wercker-template.yml', path );
    } ) );

  /**
   * Generates a index.html file in the root directory that invoked this command based on the template in
   * 'grunt-config/templates/index-template.html'.
   *
   * Run with '--test' to output the file in 'tests/index-test.html' instead (relative to the root directory).
   */
  grunt.registerTask( 'generate-index-html',
    'Generates a index.html file in the root directory that invoked this command. Run with --test to ' +
    'output the file in \'tests/index-test.html\' instead.',
    Util.wrap( () => {
      const path = grunt.option( 'test' ) ? 'tests/index-test.html' : 'index.html';
      Generator.generateFile( 'templates/index-template.html', path );
    } ) );


};