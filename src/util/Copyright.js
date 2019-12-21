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
  const fs = require( 'fs' );
  const Generator = require( './Generator' );
  const grunt = require( 'grunt' );
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

      return this.getCopyrightString( Util.getExtension( filePath ), Number.parseInt( startYear ), endYear );
    }

    static updateCopyrightFile( filePath ) {
      Util.assert( shell.which( 'git' ), 'you must have git installed to update a copyright' );

      // https://stackoverflow.com/questions/2390199/finding-the-date-time-a-file-was-first-added-to-a-git-repository
      const startDate = shell.exec( `git log --diff-filter=A --follow --date=short --format=%cd -1 -- ${ filePath }` )
        .trim().split( '-' )[ 0 ] || Util.CURRENT_YEAR;

      const endDate = Util.CURRENT_YEAR;

      // Create the single date or date range to use in the copyright statement
      const dateString = startDate === endDate ? startDate : `${ startDate }-${ endDate }`;

      const fileText = fs.readFileSync( filePath, 'utf8' );

      // Infer the line separator for the platform
      const firstR = fileText.indexOf( '\r' );
      const firstN = fileText.indexOf( '\n' );
      const lineSeparator = firstR >= 0 && firstR < firstN ? '\r' : '\n';

      // Parse by line separator
      const fileLines = fileText.split( lineSeparator ); // splits using both unix and windows newlines

      const replacementValues = Generator.getReplacementValuesMapping();

      // Check if the first line is already correct
      const firstLine = fileLines[ 0 ];
      const copyrightLine = path.extname( filePath ) === '.js' ?
        `// Copyright © ${ dateString } ${ replacementValues.AUTHOR }. All rights reserved.`:
        `<!-- Copyright © ${ dateString } ${ replacementValues.AUTHOR }. All rights reserved. -->`;

      // Update the line
      if ( firstLine.indexOf( 'Copyright' ) >= 0 || firstLine.indexOf( 'copyright' ) >= 0 ) {
        const concatted = [ copyrightLine ].concat( fileLines.slice( 1 ) );
        const newFileContents = concatted.join( lineSeparator );
        fs.writeFileSync( filePath, newFileContents );
        grunt.verbose.writeln( `Verbose: ${ filePath } updated with ${ copyrightLine }` );
      }
      else {
        Util.throw( `${ filePath } did not have a valid copyright statement on the first line: \n${ firstLine }` );
      }

    }
  }

  return Copyright;
} )();