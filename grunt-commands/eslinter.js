// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Lints the javascript files using eslint.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

// modules
const assert = require( './helpers/assert' );
const eslint = require( 'eslint' );
const grunt = require( 'grunt' );
const md5 = require( 'md5' );
const path = require( 'path' );

/**
 * @public
 *
 * @param {string} repo
 * @param {boolean} useCache
 * @param {object} packageObject
 * @returns {Object} - ESLint report object.
 */
module.exports = ( repo, useCache, packageObject ) => {
  'use strict';


  // Check package.json was implemented correctly.
  assert( packageObject && packageObject.eslintConfig && packageObject.eslintConfig.extends !== null,
      'package.json either doesn\'t exist or doesn\'t have a eslintConfig - extends path.'
      + '\n\nSee https://github.com/brandonLi8/grunt-config#readme for installation instructions.' );

  //----------------------------------------------------------------------------------------

  const pathToRules = process.cwd()
                      + '/'
                      + path.dirname( packageObject.eslintConfig.extends )
                      + '/rules';

  const cli = new eslint.CLIEngine( {

    cwd: path.dirname( process.cwd() ),

    cache: useCache,

    rulePaths: [ pathToRules ],

    cacheFile: `${ pathToRules }/../cache/${ md5( [ repo ].join( ',' ) ) }.eslintcache`,

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
};