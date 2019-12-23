// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Linting utility for running specified linting rules.
 *
 * ## Background
 *  - Linting is process that checks static source code before it is built and ran. Ran through the command line (cli),
 *    linting checks for programmatic and stylistic consistency errors. This helps identify common and uncommon
 *    that are made while modifying the source code.
 *
 * Currently only lints javascript files using ESlint (see https://eslint.org/). However, there are plans to
 * support different file types in the future.
 *
 * The configuration for ESlint can be found ../eslint/.eslintrc.js (relative to this file). It uses some default rules
 * (see documentation: https://eslint.org/docs/rules/) but also implements custom rules (see ../eslint/rules).
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

module.exports = ( () => {
  'use strict';

  // modules
  const eslint = require( 'eslint' );
  const Generator = require( './Generator' );
  const grunt = require( 'grunt' );
  const md5 = require( 'md5' );
  const path = require( 'path' );
  const Util = require( './Util' );

  // constants
  // Files and directories to ignore when linting.
  const IGNORE_PATTERN = [ '**/.git', '**/node_modules', '**/third-party', '**/dist', '**/build' ];

  class Linter {

    /**
     * Lints the entire root directory that invoked the command, using the ESlint configuration defined in
     * ../eslint/.eslintrc.js (relative to this file). Uses some custom rules (see ../eslint/rules).
     * @public
     *
     * @param {boolean} useCache - indicates if the ESlint cache should be used. Caching doesn't re-lint files that
     *                             haven't changed.
     * @returns {Object} - ESlint report object
     */
    static eslint( useCache ) {
      Util.assert( typeof useCache === 'boolean', `invalid useCache: ${ useCache }` );

      // The path to grunt-config relative to the root directory of which the command was invoked.
      const gruntConfigPath = path.dirname( __dirname );

      // The current working directory that is being linted, which is the root directory that invoked the command.
      const currentWorkingDirectory = path.dirname( process.cwd() );

      // Use the Node.js ESLint API. See https://eslint.org/docs/developer-guide/nodejs-api.
      const cli = new eslint.CLIEngine( {

        // Use the ESlint configuration defined in ../eslint/.eslintrc.js
        baseConfig: {
          extends: [ `${ gruntConfigPath }/eslint/.eslintrc.js` ]
        },

        // Current working directory - Lints the entire root directory that invoked the command
        cwd: currentWorkingDirectory,

        // Caching checks changed files or when the list of rules is changed. Changing the implementation of
        // a custom rule does not invalidate the cache. Caches are formated in .eslintcache files inside of
        // ../eslint/cache/**.eslintcache (relative to this file).
        cache: useCache,

        // Indicates where to store the target-specific cache file. Use md5 to hash the file name. This path is relative
        // to the root directory of which the command was invoked, so we use the gruntConfigPath to find the correct
        // path inside of grunt-config.
        cacheFile: `${ gruntConfigPath }/eslint/cache/${ md5( path.basename( process.cwd() ) ) }.eslintcache`,

        // Indicates where the custom rules are. This path is relative to the root directory of which the command was
        // invoked, so we use the gruntConfigPath to find the correct rules path located inside of grunt-config
        rulePaths: [ `${ gruntConfigPath }/eslint/rules` ],

        // Files and directories to skip when linting.
        ignorePattern: IGNORE_PATTERN
      } );

      //----------------------------------------------------------------------------------------
      // Log results
      grunt.log.writeln( `Linting ${ process.cwd() }...` );

      // Run the ESlint step
      const report = cli.executeOnFiles( path.basename( process.cwd() ) );

      // Pretty print results to console if any
      ( report.warningCount || report.errorCount ) && grunt.log.write( cli.getFormatter()( report.results ) );
      report.warningCount && grunt.fail.warn( report.warningCount + ' Lint Warnings' );
      report.errorCount && grunt.fail.fatal( report.errorCount + ' Lint Errors' );
    }
  }

  return Linter;
} )();