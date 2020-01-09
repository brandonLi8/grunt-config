// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * Copyright utility encapsulation for retrieving, validating, and/or modifying copyright statements correctly.
 *
 * The copyright statement is a commented line at the very top of files. The general format of a copyright statement
 * is one of two following forms:
 *   1. `{{START_COMMENT}} Copyright © {{YEAR} {{AUTHOR}}. All rights reserved. {{END_COMMENT}}`
 *   2, `{{START_COMMENT}} Copyright © {{YEAR1-YEAR2}} {{AUTHOR}}. All rights reserved. {{END_COMMENT}}`
 *
 * The START_COMMENT and END_COMMENT are placeholders comment delimiters that depend on the language the file is in.
 * For instance, in javascript, a copyright statement might be: `// Copyright © 2019 John Doe. All rights reserved.`
 * While in a .html file, it would look like: `<!-- Copyright © 2019 John Doe. All rights reserved. -->`.
 *
 * See EXTENSION_COMMENT_PARSER_MAP for full documentation of supported extensions and their correlated one-line
 * comment parsers (which insert the comment delimiters).
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

module.exports = ( () => {
  'use strict';

  // modules
  const chalk = require( 'chalk' );
  const fs = require( 'fs' );
  const Generator = require( './Generator' );
  const grunt = require( 'grunt' );
  const ignore = require( 'ignore' );
  const os = require( 'os' );
  const shell = require( 'shelljs' ); // eslint-disable-line require-statement-match
  const Util = require( './Util' );
  const path = require( 'path' );

  // constants
  // Reference to the validated and parsed generator replacement values (see ./Generator.js for more documentation).
  const GENERATOR_VALUES = Generator.getReplacementValuesMapping();

  // Object literal that maps an extension key (without the .) to a parser function such that the parser returns a
  // correct one-line comment with comment delimiters in the respective language.
  const EXTENSION_COMMENT_PARSER_MAP = {
    js: copyrightContent => `// ${ copyrightContent }`,
    css: copyrightContent => `/* ${ copyrightContent } */`,
    html: copyrightContent => `<!-- ${ copyrightContent } -->`,
    md: copyrightContent => `<!-- ${ copyrightContent } -->`,
    yml: copyrightContent => `# ${ copyrightContent }`,
    gitignore: copyrightContent => `# ${ copyrightContent }`
  };

  // Files and directories to ignore when updating copyright statements of a directory. See updateAllCopyrights().
  const IGNORE_PATTERN = ignore().add( [ '**/.git', '**/node_modules', '**/templates', '**/dist', '**/build' ] );

  class Copyright {

    /**
     * Utility method to generate a copyright statement for a file. The start year is computed from when the file was
     * checked into git or the current year if it hasn't been checked-in yet. The end year is assumed to be the current
     * year. Result includes the correct comment delimiters and follows the format described at the top of this file.
     * @public
     *
     * @param {String} filePath - path of the file, relative to the root directory that invoked the command.
     * @returns {String} - a correct copyright string as described at the top of this file.
     */
    static generateCopyrightStatement( filePath ) {
      Util.assert( shell.which( 'git' ), 'git must be installed.' );
      Util.assert( typeof filePath === 'string' && grunt.file.isFile( filePath ), `invalid filePath: ${ filePath }` );
      Util.assert( Util.getExtension( filePath ) in EXTENSION_COMMENT_PARSER_MAP,
        `${ filePath } is not supported for copyright statements.` );

      // Compute the year the file was checked into git as the start year. If it hasn't been checked into git yet, the
      // start year is the current year. Solution from:
      // https://stackoverflow.com/questions/2390199/finding-the-date-time-a-file-was-first-added-to-a-git-repository
      const startYear = shell.exec( `git log --follow --format=%aI -- ${ filePath } | tail -1`, { silent: true } )
        .trim().split( '-' )[ 0 ] || Util.CURRENT_YEAR;

      const endYear = Util.CURRENT_YEAR; // The end year is assumed to be the current year.

      // Create the year string or the year range string to use in the copyright statement.
      const yearsString = ( parseInt( startYear, 10 ) === endYear ) ? startYear : `${ startYear }-${ endYear }`;

      // Create the copyright line without the comment delimiters first. Then return the parsed value.
      const copyrightContent = `Copyright © ${ yearsString } ${ GENERATOR_VALUES.AUTHOR }. All rights reserved.`;
      return EXTENSION_COMMENT_PARSER_MAP[ Util.getExtension( filePath ) ]( copyrightContent );
    }

    /**
     * Updates the copyright statement of a file with a freshly generated copyright statement. The copyright statement
     * is assumed to be the first line of the file. If it isn't there (checked by checking if the word "copyright" is in
     * the first line), this will instead prepend a new correct copyright statement at the start of the file.
     * @public
     *
     * @param {String} filePath - path of the file, relative to the root directory that invoked the command.
     */
    static updateFileCopyright( filePath ) {
      Util.assert( typeof filePath === 'string' && grunt.file.isFile( filePath ), `invalid filePath: ${ filePath }` );

      // Get the lines of the file in an array representation.
      const fileLines = Util.getFileLines( filePath );

      // Generate a correct copyright statement.
      const copyrightStatement = this.generateCopyrightStatement( filePath );

      // If the first line is already a correct copyright statement, do nothing.
      if ( fileLines[ 0 ] === copyrightStatement ) return;

      // If the first line of the file was a copyright statement (checked by checking if the word "copyright"
      // is in the first line), replace it with a correct copyright statement.
      if ( fileLines[ 0 ].toLowerCase().indexOf( 'copyright' ) >= 0 ) {
        fs.writeFileSync( filePath, [ copyrightStatement, ...fileLines.slice( 1 ) ].join( os.EOL ) );
        grunt.verbose.writeln( `Verbose: ${ filePath } updated with ${ copyrightStatement }` );
      }
      else {
        // If the file did not contain a copyright statement to update, prepend a correct copyright statement at the
        // start of the file.
        fs.writeFileSync( filePath, [ copyrightStatement, ...fileLines ].join( os.EOL ) );
        grunt.verbose.writeln( `Verbose: ${ filePath } prepended with ${ copyrightStatement }` );
      }
    }

    /**
     * Checks that the copyright statement of a file is correct. The copyright statement is assumed to be at the start
     * of the file. If shouldThrow is true, this will throw an error if the copyright statement of the file is
     * incorrect. Otherwise, this will return a boolean indicating if the copyright was correct.
     * @public
     *
     * @param {String} filePath - path of the file, relative to the root directory that invoked the command
     * @param {boolean} shouldThrow - indicates if an error should be thrown if the copyright statement is incorrect.
     * @returns {null|boolean} - if shouldThrow = false, will return a boolean indicating if the copyright was correct.
     */
    static checkFileCopyright( filePath, shouldThrow = true ) {
      Util.assert( typeof filePath === 'string' && grunt.file.isFile( filePath ), `invalid filePath: ${ filePath }` );
      Util.assert( typeof shouldThrow === 'boolean', `invalid shouldThrow: ${ shouldThrow }` );

      // Get the first line of the file.
      const firstLine = Util.getFileLines( filePath )[ 0 ];

      grunt.verbose.writeln( `Verbose: checking copyright statement of ${ filePath }.` );

      if ( shouldThrow ) {
        // Compare the first line with a correctly generated file.
        Util.assert( firstLine === this.generateCopyrightStatement( filePath ), chalk.red( 'invalid copyright ' +
          `statement in ${ filePath }:\n${ chalk.reset.dim( firstLine ) }\n\nA correct copyright statement would be:` +
          `\n${ chalk.reset.dim( this.generateCopyrightStatement( filePath ) ) }` ) );
      }
      else {
        return firstLine === this.generateCopyrightStatement( filePath );
      }
    }

    /**
     * Updates the copyright statements of ALL supported files in a given directory (uses updateFileCopyright()).
     * If the given directory (relative to the root directory that invoked the command) isn't a real directory,
     * an error will be thrown. See EXTENSION_COMMENT_PARSER_MAP for documentation of supported files. No-op for
     * files that fall into the IGNORE_PATTERN.
     * @public
     *
     * @param {String} directory - directory to update all copyright statements in, relative to the root directory
     *                             that invoked the command.
     * @param {boolean} [forceWrite] - if true, this will rewrite the first line of each file regardless of whether or
     *                                 not the first line is a copyright statement.
     */
    static updateAllCopyrights( directory, forceWrite = false ) {
      Util.assert( typeof directory === 'string', `invalid directory: ${ directory }` );
      Util.assert( grunt.file.isDir( directory ), `directory ${ directory } is not a directory.` );
      Util.assert( typeof forceWrite === 'boolean', `invalid forceWrite: ${ forceWrite }` );

      // Recurse through the directory with grunt API. See https://gruntjs.com/api/grunt.file#grunt.file.recurse
      grunt.file.recurse( directory, ( abspath, rootdir, subdir, filename ) => {

        // Only update the copyright statement if it's a supported file type and if it's not in the ignore pattern.
        if ( !IGNORE_PATTERN.ignores( abspath ) && Util.getExtension( filename ) in EXTENSION_COMMENT_PARSER_MAP ) {

          // update the copyright statement
          this.updateFileCopyright( abspath, forceWrite );
        }
      } );
    }

    /**
     * Checks the copyright statements of ALL supported files in a given directory (uses checkFileCopyright()).
     * If the given directory (relative to the root directory that invoked the command) isn't a real directory,
     * an error will be thrown. Throws an error if any of the copyright statements aren't correct.
     * Will not error for files in EXTENSION_COMMENT_PARSER_MAP or for files that fall into the IGNORE_PATTERN.
     * @public
     *
     * @param {String} directory - directory to check all copyright statements in, relative to the root directory
     *                             that invoked the command.
     */
    static checkAllCopyrights( directory ) {
      Util.assert( typeof directory === 'string', `invalid directory: ${ directory }` );
      Util.assert( grunt.file.isDir( directory ), `directory ${ directory } is not a real directory.` );

      // Recurse through the directory with grunt API. See https://gruntjs.com/api/grunt.file#grunt.file.recurse
      grunt.file.recurse( directory, ( abspath, rootdir, subdir, filename ) => {

        // Only check the copyright statement if it's a supported file type and if it's not in the ignore pattern.
        if ( !IGNORE_PATTERN.ignores( abspath ) && Util.getExtension( filename ) in EXTENSION_COMMENT_PARSER_MAP ) {

          // check the copyright statement
          this.checkFileCopyright( abspath );
        }
      } );
    }

    /**
     * Convenience method to update the copyright statement(s) of either a file or a directory, depending on what is.
     * passed in If no argument is provided, ALL copyrights in the root directory of the project will be updated
     * (where the command was invoked), such that all files in the project will have updated copyright dates.
     * See updateAllCopyrights() if passing a directory and updateFileCopyright() if passing a file path.
     * @public
     *
     * @param {String} [path] - either a file or directory to update copyrights in. If not provided, all files in
     *                          the project will be updated.
     * @param {boolean} [forceWrite] - if true, this will rewrite the first line of each file regardless of whether or
     *                                 not the first line is a copyright statement.
     */
    static updateCopyright( path, forceWrite = false ) {
      Util.assert( typeof path === 'string' && grunt.file.exists( path ), `invalid path: ${ path }` );
      Util.assert( typeof forceWrite === 'boolean', `invalid forceWrite: ${ forceWrite }` );

      if ( grunt.file.isFile( path ) ) this.updateFileCopyright( path, forceWrite );
      if ( grunt.file.isDir( path ) ) this.updateAllCopyrights( path, forceWrite );
    }

    /**
     * Convenience method to check the copyright statement(s) of either a file or a directory, depending on what is
     * passed in. If no argument is provided, ALL copyrights in the root directory of the project will be checked
     * (where the command was invoked), such that all files in the project will have checked copyright dates.
     * See checkAllCopyrights() if passing a directory and checkFileCopyright() if passing a file path.
     * @public
     *
     * @param {String} [path] - either a file or directory to check copyrights in. If not provided, all files in
     *                          the project will be checked.
     */
    static checkCopyright( path ) {
      Util.assert( typeof path === 'string' && grunt.file.exists( path ), `invalid path: ${ path }` );

      if ( grunt.file.isFile( path ) ) {
        this.checkFileCopyright( path );
        Util.log( chalk.green( `\nCopyright statement in ${ chalk.white.dim( path ) } was correct!` ) );
      }
      if ( grunt.file.isDir( path ) ) {
        this.checkAllCopyrights( path );
        Util.log( chalk.green( `\nAll copyright statements in ${ chalk.white.dim( path ) } were correct!` ) );
      }
    }
  }

  return Copyright;
} )();