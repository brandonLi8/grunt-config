// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Grunt configuration file. For background, see https://gruntjs.com/getting-started.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

module.exports = grunt => {
  'use strict';

  // modules
  const Copyright = require( './src/Util/Copyright' );
  const Generator = require( './src/Util/Generator' );
  const Util = require( './src/util/Util' );
  const shell = require( 'shelljs' ); // eslint-disable-line require-statement-match

  // constants
  const PACKAGE_JSON = grunt.file.readJSON( 'package.json' ) || {};

  shell.config.silent = true;

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

  grunt.registerTask( 'hello',  Util.wrap( () => {
    // Copyright.updateAllCopyrights( './' );
//     const execSh = require( 'exec-sh' );
// // run interactive bash shell
// execSh("echo lorem && bash", { cwd: "/home" }, function(err){
//   console.log( '')
//   if (err) {
//     console.log('erehrh')
//     console.log("Exit code: ", err.code);
//     return;
//   }

//   // collect streams output
//   var child = execSh(["bash -c id", "echo lorem >&2"], true,
//     function(err, stdout, stderr){
//       console.log( 'erer')
//       console.log("error: ", err);
//       console.log("stdout: ", stdout);
//       console.log("stderr: ", stderr);
//     });
// });


  } ) );
};