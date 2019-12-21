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

  grunt.registerTask( 'hello',  Util.wrap( () => {
    // Copyright.updateCopyrightFile( 'Gruntfile.js' );
    console.log( Copyright.getCopyrightString( 'js', 2000 ) )

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