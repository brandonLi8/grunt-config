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
  const packageObject = grunt.file.readJSON( 'package.json' ) || {};


  const relativePath = packageObject[ 'grunt-config' ];

  if ( !relativePath ) {
    assert( false, `

package.json was not implemented correctly for generating files via grunt-config.
"grunt-config": ./node_modules/@brandonli8/grunt-config" // this path be different for your project` );
  }

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

    generate( packageObject, 'templates/readme-template.md', relativePath, generatePath );
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

    generate( packageObject, 'templates/travis-template.yml', relativePath, generatePath );
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

    generate( packageObject, 'templates/gitignore-template.gitignore', relativePath, generatePath );
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

  grunt.registerTask( 'build', 'Generates Build', createTask( ( src, buildLocation ) => {

    var Terser = require( "terser" );
    const path = require('path');

    grunt.file.delete( './dist' );
    grunt.file.mkdir( './dist' );
    var fs = require("fs"); //Load the filesystem module

    function callback( abspath, rootdir, subdir, filename)  {

      const code = grunt.file.read( abspath );
      var options = {
        compress: {
            global_defs: {
              require: false,
            },
            passes: 2,
            drop_console: false,
        },
        mangle: {
          reserved: [ 'require' ],
        },
        output: {
          beautify: false,
          preamble: "/* minified */"
        }
      };
      const minify = Terser.minify( code, options );
      const nameNoExtension = path.parse(filename).name;
      const extension = path.parse(filename).ext;;

      grunt.log.writeln( fs.statSync( abspath).size )
      grunt.file.write( './dist' + ( subdir ? `/${subdir}/` : '/' ) + nameNoExtension + extension, minify.code );

    }

    grunt.file.recurse(src, callback)

  } ) );

  //========================================================================================
  // ES-LINT - linting JS files (`grunt eslint`)
  //
  // Uses a cache by default (i.e. if a file doesn't change, no need to re-lint)
  // Use `grunt eslint --no-cache` to ignore the cache
  //========================================================================================
  grunt.registerTask( 'eslint', 'lint all js files specific to the repo', createTask( () => {
    eslinter( packageObject.name.split( '/' )[ 1 ], !grunt.option( 'no-cache' ), relativePath, packageObject );
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