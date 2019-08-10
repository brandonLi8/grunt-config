// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Lints the javascript files using eslint.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

'use strict';

// modules
const eslint = require( 'eslint' );
const fs = require( 'fs' );
const grunt = require( 'grunt' );
const md5 = require( 'md5' );
const path = require( 'path' );
const child_process = require( 'child_process' );

/**
 * @public
 *
 * @param {string} repo
 * @param {boolean} useCache
 * @param {string} rulePath
 * @returns {Object} - ESLint report object.
 */
module.exports = function( repo, useCache, rulePath ) {

  const cli = new eslint.CLIEngine( {

    cwd: path.dirname( process.cwd() ),

    cache: useCache,

    rulePaths: [ rulePath ],

    cacheFile: `eslint/cache/${md5( [ repo ].join( ',' ) )}.eslintcache`,

    ignorePattern: [
      '**/.git',
      '**/node_modules',
      '**/third-party'
    ]
  } );

  grunt.verbose.writeln( 'linting: ' + [ repo ].join( ', ' ) );

  // run the eslint step
  const report = cli.executeOnFiles( [ repo ] );

  // pretty print results to console if any
  ( report.warningCount || report.errorCount ) && grunt.log.write( cli.getFormatter()( report.results ) );

  report.warningCount && grunt.fail.warn( report.warningCount + ' Lint Warnings' );
  report.errorCount && grunt.fail.fatal( report.errorCount + ' Lint Errors' );

  return report;
};