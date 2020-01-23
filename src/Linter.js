// Copyright © 2019-2020 Brandon Li. All rights reserved.

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
 * The configuration for ESlint can be found in ./eslint/.eslintrc.js (relative to this file). It uses some default
 * rules (see https://eslint.org/docs/rules/) but also implements custom rules (see ./eslint/custom-rules).
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

module.exports = ( () => {
  'use strict';

  // modules
  const eslint = require( 'eslint' );
  const grunt = require( 'grunt' );
  const path = require( 'path' );
  const Util = require( './Util' );

  class Linter {

    /**
     * Lints the entire root directory that invoked the command, using the ESlint configuration defined in
     * ./eslint/.eslintrc.js (relative to this file). Uses some custom rules (see ./eslint/custom-rules).
     * @public
     *
     * @param {boolean} useCache - indicates if the ESlint cache should be used. Caching doesn't re-lint files that
     *                             haven't changed.
     */
    static eslint( useCache ) {
      Util.assert( typeof useCache === 'boolean', `invalid useCache: ${ useCache }` );

      // Use the Node.js ESLint API. See https://eslint.org/docs/developer-guide/nodejs-api.
      const linter = new eslint.CLIEngine( {

        // Use the ESlint configuration defined in ./eslint/.eslintrc.js
        baseConfig: {
          extends: [ `${ Util.GRUNT_CONFIG_PATH }/src/eslint/.eslintrc.js` ]
        },

        // Current working directory - Lints the entire root directory that invoked the command
        cwd: Util.REPO_PATH,

        // Caching checks changed files or when the list of rules is changed. Changing the implementation of
        // a custom rule does not invalidate the cache.
        cache: useCache,

        // Indicates where to store the target-specific cache file. This path is relative to the root directory of which
        // the command was invoked, so we use the Util.REPO_PATH to find the correct path inside of the repo.
        cacheFile: `${ Util.REPO_PATH }/.eslintcache`,

        // Indicates where the custom rules are. This path is relative to grunt-config, so we use
        // Util.GRUNT_CONFIG_PATH to find the correct rules path located inside of grunt-config
        rulePaths: [ `${ Util.GRUNT_CONFIG_PATH }/src/eslint/custom-rules` ],

        // Files and directories to skip when linting.
        ignorePattern: Util.IGNORE_PATTERN
      } );

      //----------------------------------------------------------------------------------------
      // Log results
      Util.logln( `Linting ${ Util.toRepoPath( './' ) } ...` );

      // Run the ESlint step
      const report = linter.executeOnFiles( Util.REPO_PATH );

      // Pretty print results to console if any
      ( report.warningCount || report.errorCount ) && grunt.log.write( linter.getFormatter()( report.results ) );
      report.warningCount && grunt.fail.warn( report.warningCount + ' Lint Warnings' );
      report.errorCount && grunt.fail.fatal( report.errorCount + ' Lint Errors' );
    }
  }

  return Linter;
} )();