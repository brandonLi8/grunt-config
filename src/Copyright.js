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
     * Checks that the first line of a file is a correct copyright statement (including dates).
     * If shouldThrow = true, this will throw an error if the first line was not a correct copyright statement.
     * Otherwise, this will return a boolean indicating if the first line was a correct copyright statement.
     * @public
     *
     * @param {String} filePath - path of the file, relative to the root directory that invoked the command.
     * @param {boolean} shouldThrow - indicates if an error should be thrown if the copyright statement is incorrect.
     * @returns {null|boolean} - if shouldThrow = false, will return a boolean indicating if the copyright was correct.
     */
    static checkFileCopyright( filePath, shouldThrow = true ) {
      Util.assert( typeof filePath === 'string' && grunt.file.isFile( filePath ), `invalid filePath: ${ filePath }` );
      Util.assert( typeof shouldThrow === 'boolean', `invalid shouldThrow: ${ shouldThrow }` );

      // Get the first line of the file.
      const firstLine = Util.getFileLines( filePath )[ 0 ];
      grunt.verbose.writeln( `Verbose: checking copyright statement of ${ Util.toRepoPath( filePath ) }.` );

      if ( shouldThrow ) {
        // Assert (will throw an error if false) by comparing the first line with a correctly generated file.
        Util.assert( firstLine === this.generateCopyrightStatement( filePath ), chalk.red( 'incorrect copyright ' +
          `statement in ${ Util.toRepoPath( filePath ) }:\n${ firstLine }\n\nA correct ` +
          `copyright statement would be:\n${ chalk.reset.dim( this.generateCopyrightStatement( filePath ) ) }` ) );
      }
      else {
        return firstLine === this.generateCopyrightStatement( filePath );
      }
    }

    /**
     * Updates the copyright statement(s) of either a file or all files of a directory, depending on what is passed in.
     * If the given path isn't a real file or directory, an error will be thrown. If the path is a directory, only files
     * that don't fall into the IGNORE_PATTERN and have an extension in EXTENSION_COMMENT_PARSER_MAP will be updated.
     * @public
     *
     * @param {String} path - either a file or directory to update copyright statement(s).
     */
    static updateCopyright( path ) {
      Util.assert( grunt.file.exists( path ), `path doesn't exist: ${ Util.toRepoPath( path ) }` );

      // If the given path is a file, use updateFileCopyright to update the file.
      if ( grunt.file.isFile( path ) ) this.updateFileCopyright( path );

      // If the given path is a directory, update the copyright statement of all files.
      if ( grunt.file.isDir( path ) ) {

        // Recurse through the directory with grunt API. See https://gruntjs.com/api/grunt.file#grunt.file.recurse
        grunt.file.recurse( path, filePath => {

          // Only update the copyright statement if it's a supported file type and if it's not in the ignore pattern.
          if ( !IGNORE_PATTERN.ignores( filePath ) && Util.getExtension( filePath ) in EXTENSION_COMMENT_PARSER_MAP ) {

            // update the copyright statement
            this.updateFileCopyright( filePath );
          }
        } );
      }
    }

    /**
     * Checks the copyright statement(s) of either a file or all files of a directory, depending on what is passed in.
     * If the given path isn't a real file or directory, an error will be thrown. If the path is a directory, only files
     * that don't fall into the IGNORE_PATTERN and have an extension in EXTENSION_COMMENT_PARSER_MAP will be checked.
     * If any of the checks fail, an error will be thrown.
     * @public
     *
     * @param {String} path - either a file or directory to check copyright statement(s).
     */
    static checkCopyright( path ) {
      Util.assert( grunt.file.exists( path ), `path doesn't exist: ${ Util.toRepoPath( path ) }` );

      // If the given path is a file, use checkFileCopyright to check the file.
      if ( grunt.file.isFile( path ) ) this.updateFileCopyright( path );

      // If the given path is a directory, check the copyright statement of all files.
      if ( grunt.file.isDir( path ) ) {

        // Recurse through the directory with grunt API. See https://gruntjs.com/api/grunt.file#grunt.file.recurse
        grunt.file.recurse( path, filePath => {

          // Only check the copyright statement if it's a supported file type and if it's not in the ignore pattern.
          if ( !IGNORE_PATTERN.ignores( filePath ) && Util.getExtension( filePath ) in EXTENSION_COMMENT_PARSER_MAP ) {

            // Check the copyright statement
            this.checkFileCopyright( filePath );
          }
        } );
      }
    }
  }

  return Copyright;
} )();