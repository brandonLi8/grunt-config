// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Copyright utility encapsulation for retrieving, validating, and/or modifying copyright statements correctly.
 *
 * The copyright statement is a commented line at the very top of files. The general format of a copyright statement
 * is one of two following forms:
 *   1. `{{START_COMMENT}} Copyright © {{YEAR} {{AUTHOR}}. All rights reserved. {{END_COMMENT}}`
 *   2, `{{START_COMMENT}} Copyright © {{YEAR1-YEAR2}} {{AUTHOR}}. All rights reserved. {{END_COMMENT}}`
 *
 * The START_COMMENT and END_COMMENT are comment delimiter placeholders that depend on the language the file is in.
 * For instance, for javascript, a copyright statement might be: `// Copyright © 2019 Brandon Li. All rights reserved.`
 * While in a .html file, it would look like: `<!-- Copyright © 2019 Brandon Li. All rights reserved. -->`.
 *
 * See EXTENSION_COMMENT_PARSER_MAP for full documentation of supported extensions and their correlated parsers one-line
 * comment parsers.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

module.exports = ( () => {
  'use strict';

  // modules
  const _ = require( 'lodash' ); // eslint-disable-line require-statement-match
  const fs = require( 'fs' );
  const Generator = require( './Generator' );
  const grunt = require( 'grunt' );
  const ignore = require( 'ignore' );
  const shell = require( 'shelljs' ); // eslint-disable-line require-statement-match
  const Util = require( './Util' );

  // constants
  // Retrieves the validated and parsed generator replacement values (see Generator.js for more documentation).
  const GENERATOR_VALUES = Generator.getReplacementValuesMapping();

  // Object literal that correlates an extension (without the .) to a parser function such that the parser returns a
  // correct one-line comment in the respective language.
  const EXTENSION_COMMENT_PARSER_MAP = {
    js: copyrightContent => `// ${ copyrightContent }`,
    md: copyrightContent => `<!-- ${ copyrightContent } -->`,
    yml: copyrightContent => `# ${ copyrightContent }`,
    gitignore: copyrightContent => `# ${ copyrightContent }`,
    html: copyrightContent => `<!-- ${ copyrightContent } -->`,
    css: copyrightContent => `/* ${ copyrightContent } */`
  };

  // Files and directories to ignore when updating copyright statements of a directory. See updateAllCopyrights().
  const IGNORE_PATTERN = ignore().add( [ '**/.git', '**/node_modules', '**/templates', '**/dist', '**/build' ] );

  class Copyright {

    /**
     * Utility method to get a copyright string (including the comment delimiters described at the top of this file).
     * If the endYear isn't provided, the copyright is assumed to have one year (as described at the top)
     * @public
     *
     * @param {String} fileExtension - file extension of the file the copyright statement belongs in, without the '.'
     * @param {number} startYear - the starting year of the copyright.
     * @param {number} [endYear] - the ending year of the copyright. If not provided, it is assumed to be the same as
     *                             the startYear (which will format as described at the top of the file).
     * @returns {String} - the full copyright string, including the comment delimiters described at the top of this file
     */
    static getCopyrightString( fileExtension, startYear, endYear ) {
      Util.assert( typeof fileExtension === 'string', `invalid fileExtension: ${ fileExtension }` );
      Util.assert( typeof startYear === 'number', `invalid startYear: ${ startYear }` );
      Util.assert( !endYear || typeof endYear === 'number', `invalid endYear: ${ endYear }` );
      Util.assert( fileExtension in EXTENSION_COMMENT_PARSER_MAP, `invalid fileExtension: ${ fileExtension }` );

      // Create the single date or the date range to use in the copyright statement
      const dateString = ( !endYear || startYear === endYear ) ? startYear : `${ startYear }-${ endYear }`;

      // Create the copyright line without the commend delimiters first. Then return the parsed value.
      const copyrightContent = `Copyright © ${ dateString } ${ GENERATOR_VALUES.AUTHOR }. All rights reserved.`;

      return EXTENSION_COMMENT_PARSER_MAP[ fileExtension ]( copyrightContent );
    }

    /**
     * Utility method to get a copyright string from a file. The start year is computed from git and the end year is
     * assumed to be the current year.
     * @public
     *
     * @param {String} filePath - path of the file, relative to the root of the project (where the command was invoked)
     * @returns {String} - the full copyright string, including the comment delimiters described at the top of this file
     */
    static getFileCopyright( filePath ) {
      Util.assert( typeof filePath === 'string', `invalid filePath: ${ filePath }` );
      Util.assert( shell.which( 'git' ), 'git must be installed.' );
      Util.assert( grunt.file.exists( filePath ), `filePath ${ filePath } is not a real file.` );

      // Compute the start year of the file from git. If it hasn't been checked into git yet, the start year is the
      // current year. Solution from:
      // https://stackoverflow.com/questions/2390199/finding-the-date-time-a-file-was-first-added-to-a-git-repository
      const startYear = shell.exec( `git log --diff-filter=A --follow --date=short --format=%cd -1 -- ${ filePath }` )
        .trim().split( '-' )[ 0 ] || Util.CURRENT_YEAR;

      const endYear = Util.CURRENT_YEAR;

      return this.getCopyrightString( Util.getExtension( filePath ), _.parseInt( startYear ), endYear );
    }

    /**
     * Updates the copyright statement of a file. This is usually called to automate the updating of copyright
     * statements at the start of each year. The copyright statement is assumed to be at the start of the file.
     * If it isn't there (checked by checking if the word "copyright" is in the first line), this will error out.
     * However, passing forceWrite = true will replace the first line with a correct copyright statement no regardless
     * or its content.
     * @public
     *
     * @param {String} filePath - path of the file, relative to the root of the project (where the command was invoked)
     * @param {boolean} [forceWrite] - if true, this will rewrite the first line regardless of it was already a
     *                                 copyright statement of not.
     */
    static updateFileCopyright( filePath, forceWrite = false ) {
      Util.assert( typeof filePath === 'string', `invalid filePath: ${ filePath }` );
      Util.assert( typeof forceWrite === 'boolean', `invalid forceWrite: ${ forceWrite }` );
      Util.assert( grunt.file.exists( filePath ), `filePath ${ filePath } is not a file.` );

      // Read the file first
      const fileContent = grunt.file.read( filePath );

      // Parse by line separator
      const fileLines = fileContent.split( /\r?\n/ ); // splits for both unix and windows newlines

      // Reference the correct copyright statement,
      const copyrightStatement = this.getFileCopyright( filePath );

      // no-op if the first line is already correct.
      if ( fileLines[ 0 ] === copyrightStatement ) return;

      // Only replace the first line if it was already a copyright statement by checking if the word "copyright" is in
      // the first line or if forceWrite is true
      if ( forceWrite || fileLines[ 0 ].toLowerCase().indexOf( 'copyright' ) >= 0 ) {
        const newFileContents = [ copyrightStatement, ...fileLines.slice( 1 ) ].join( '\r\n' );
        fs.writeFileSync( filePath, newFileContents );
        grunt.verbose.writeln( `Verbose: ${ filePath } updated with ${ copyrightStatement }` );
      }
      else {
        Util.throw( `${ filePath } did not have a valid copyright statement on the first line: \n${ fileLines[ 0 ] }` );
      }
    }

    /**
     * Updates the copyright statements of all supported files in a directory. If no directory is provided,
     * the directory is assumed to be the root of the project (where the command was invoked), such that all files in
     * the project will be updated.
     * @public
     *
     * @param {String} [directory] - directory to update all copyright statements in, relative to the root of the
     *                               project. If not provided, all files in the project will be updated.
     * @param {boolean} [forceWrite] - if true, this will rewrite the first line regardless of it was already a
     *                                 copyright statement of not.
     */
    static updateAllCopyrights( directory, forceWrite = false ) {
      Util.assert( !directory || typeof directory === 'string', `invalid directory: ${ directory }` );
      Util.assert( typeof forceWrite === 'boolean', `invalid forceWrite: ${ forceWrite }` );
      Util.assert( !directory || grunt.file.isDir( directory ), `directory ${ directory } is not a directory.` );

      // Recurse through the directory with grunt API. See https://gruntjs.com/api/grunt.file#grunt.file.recurse
      grunt.file.recurse( directory || '.', ( abspath, rootdir, subdir, filename ) => {

        // Only update the copyright statement if it's a supported file type and if it's not in the ignore pattern.
        if ( !IGNORE_PATTERN.ignores( abspath ) && Util.getExtension( filename ) in EXTENSION_COMMENT_PARSER_MAP ) {

          // update the copyright statement
          this.updateFileCopyright( abspath, forceWrite );
        }
      } );
    }
  }

  return Copyright;
} )();