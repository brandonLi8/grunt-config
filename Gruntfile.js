// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * Grunt configuration file. For background, see https://gruntjs.com/getting-started.
 * Run `grunt --help` to see an overview of the tasks defined below.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

module.exports = grunt => {
  'use strict';

  // modules
  const Copyright = require( './src/Copyright' );
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
    'grunt-config/eslint/.eslintrc.js. Run with --no-cache to lint without using a ESLint cache.\n',
    Util.wrap( () => { Linter.eslint( !grunt.option( 'no-cache' ) ); } )
  );

  /**
   * Synchronizes GitHub issue/pull request labels with the schema defined in grunt-config/github-labels-schema.json.
   * See grunt-config/src/Labeler for more information.
   *
   * Requires the GITHUB_ACCESS_TOKEN node environment variable for access to fetch and update labels.
   * The token must have permission to write to the repository. See https://github.com/settings/tokens on how to
   * create this token. The token GITHUB_ACCESS_TOKEN can be passed in the command line or defined in
   * ~/.profile (see https://help.ubuntu.com/community/EnvironmentVariables#A.2BAH4-.2F.profile).
   *
   * Run with '--dry-run' to not actually write to the labels but simulate results.
   * Run with '--extend' to keep the current GitHub labels that aren't apart of the schema. With this flag, no labels
   * will be deleted.
   */
  grunt.registerTask( 'generate-labels',
    'Synchronizes GitHub issue/pull request labels with the schema defined in github-labels-schema.json. See ' +
    'grunt-config/src/Labeler for more information.\nRequires the GITHUB_ACCESS_TOKEN node environment variable.\n\n' +
    'Run with `--dry-run` to not actually write to the labels and simulate results.\n\nRun with `--extend` to keep ' +
    'the current GitHub labels that aren\'t apart of the schema. With this flag, no labels will be deleted.\n',
    Util.wrapAsync( async () => { await Labeler.generate( !!grunt.option( 'dry-run' ), !!grunt.option( 'extend' ) ); } )
  );

  /**
   * Updates the copyright of either a file or a directory, depending on what is passed in. If no argument is provided,
   * ALL copyrights in the root directory of the project will be updated (where the command was invoked), such that all
   * files in the project will have update copyright dates. If the given path doesn't exist, an error is thrown.
   *
   * @param {String} [path] - either a file or directory to update copyrights in. If not provided, all files in
   *                          the project will be updated.
   *
   * The copyright statement is assumed to be at the start of the file.
   * If it isn't there (checked by checking if the word "copyright" is in the first line), this will error out.
   *
   * Run with '--force-write' to replace the first line with a correct copyright statement no regardless
   * of its content.
   */
  grunt.registerTask( 'update-copyright',
    'Updates the copyright of either a file or a directory, depending on what is passed in. If no argument is ' +
    'provided, ALL copyrights in the root directory of the repository that invoked this command will be updated.\n\n' +
    'Will only replace the first line of each file if it contains the word "copyright".\n\nRun with `--force-write` ' +
    ' to replace the first line with a correct copyright statement no regardless of its content.\n',
    Util.wrap( path => { Copyright.updateCopyright( path || './', grunt.option( 'force-write' ) ); } )
  );

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
    'the file in \'tests/README-test.md\' instead.\n',
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
    'output the file in \'tests/.travis-test.yml\' instead.\n',
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
    'output the file in \'tests/.gitignore-test.gitignore\' instead.\n',
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
    '--test to output the file in \'tests/deploy-heroku-test.yml\' instead.\n',
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
    'output the file in \'tests/.wercker-test.yml\' instead.\n',
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
    'output the file in \'tests/index-test.html\' instead.\n',
    Util.wrap( () => {
      const path = grunt.option( 'test' ) ? 'tests/index-test.html' : 'index.html';
      Generator.generateFile( 'templates/index-template.html', path );
    } ) );

  /**
   * Generates a build-check.yml Github Action file in the root directory that invoked this command based on the
   * template in 'grunt-config/templates/build-check-template.yml'.
   *
   * Run with '--test' to output the file in 'tests/build-check-test.yml' instead (relative to the root directory).
   */
  grunt.registerTask( 'generate-build-check',
    'Generates a build-check.yml Github Action file in the root directory that invoked this command. Run with ' +
    '--test to output the file in \'tests/build-check-test.yml\' instead.\n',
    Util.wrap( () => {
      const path = grunt.option( 'test' ) ? 'tests/build-check-test.yml' : '.github/workflows/build-check.yml';
      Generator.generateFile( 'templates/build-check-template.yml', path );
    } ) );
};