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
  const path = require( 'path' );
  const shell = require( 'shelljs' ); // eslint-disable-line require-statement-match
  const Util = require( './Util' );

  // constants
  // Object literal that correlates an extension (without the .) to a parser function such that the parser returns a
  // correct one-line comment in the respective language.
  const EXTENSION_COMMENT_PARSER_MAP = {
    js: copyrightContent => `// ${ copyrightContent }`,
    md: copyrightContent => `<!-- ${ copyrightContent } -->`,
    yml: copyrightContent => `# ${ copyrightContent }`,
    gitignore: copyrightContent => `# ${ copyrightContent }`,
    html: copyrightContent => `<!-- ${ copyrightContent } -->`,
    css: copyrightContent => `/* ${ copyrightContentString } */`
  };

  class Copyright {

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