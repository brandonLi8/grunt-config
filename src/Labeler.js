// Copyright © 2019-2020 Brandon Li. All rights reserved.

/**
 * GitHub issue/pull request label generator that synchronizes labels with the schema defined in
 * .../github-labels-schema.json.
 *
 * Determines the GitHub repository from the package.json in the root directory that invoked the command.
 * The url is parsed from the git-remote in packageObj.repository.url by Generator. If the url isn't a GitHub url,
 * an error is thrown.
 *
 * Currently uses https://www.npmjs.com/package/github-label-sync as a dependency to synchronize GitHub labels to
 * the repository. Github-Label-Sync has a Node.js API. However, their label schema format is slightly different
 * from .../github-labels-schema.json, so Labeler will need to convert over.
 *
 * Labeler will require a GITHUB_ACCESS_TOKEN node environment variable for access to fetch and update labels.
 * The token must have permission to write to the repository. See https://github.com/settings/tokens on how to
 * create this token. The token GITHUB_ACCESS_TOKEN can be passed in the command line or defined in
 * ~/.profile (see https://help.ubuntu.com/community/EnvironmentVariables#A.2BAH4-.2F.profile).
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

module.exports = ( () => {
  'use strict';

  // modules
  const chalk = require( 'chalk' );
  const Generator = require( './Generator' );
  const githubLabelSync = require( 'github-label-sync' ); // eslint-disable-line require-statement-match
  const grunt = require( 'grunt' );
  const path = require( 'path' );
  const Util = require( './Util' );

  // constants
  const GITHUB_URL = 'https://github.com/';

  // Object literal that describes the GitHub labels that should be added. Each key is the name of the GitHub
  // label and correlates to one of the two values stated below:
  // 1. String - The color of the GitHub label as it appears in the issue/pr. The label is assumed to have no aliases.
  // 2. Object Literal - an object literal with:
  //                      - a color key that correlates to a color string as described in 1.
  //                      - a string array that contains aliases to other labels.
  const LABELS_SCHEMA = grunt.file.readJSON( path.dirname( __dirname ) + '/github-labels-schema.json' );

  //----------------------------------------------------------------------------------------

  class Labeler {

    /**
     * GitHub issue/pull request label generator that synchronizes labels with LABELS_SCHEMA.
     * Requires GITHUB_ACCESS_TOKEN node environment variable for access to fetch and update labels (see top of file).
     * @public
     *
     * @param {boolean} dryRun - indicates if Labeler should write to the GitHub issues. If true, the results that
     *                           would happen if it weren't true will be logged as output.
     * @param {boolean} allowAddedLabels - indicates if Labeler should keep the previous GitHub labels that aren't
     *                                     apart of LABELS_SCHEMA or remove them.
     */
    static async generate( dryRun, allowAddedLabels ) {
      Util.assert( typeof dryRun === 'boolean', `invalid dryRun: ${ dryRun }` );
      Util.assert( typeof allowAddedLabels === 'boolean', `invalid allowAddedLabels: ${ allowAddedLabels }` );

      // Assert that the GITHUB_ACCESS_TOKEN node environment variable exists (see top of file for more documentation).
      Util.assert( process.env.GITHUB_ACCESS_TOKEN, `Could not retrieve the GITHUB_ACCESS_TOKEN environment variable.
Labeler requires a GITHUB_ACCESS_TOKEN node environment variable for access to fetch and update labels.
The token must have permission to write to the repository. See https://github.com/settings/tokens
on how to create this token. The token GITHUB_ACCESS_TOKEN can be passed in the command line:\n
$ GITHUB_ACCESS_TOKEN=xxxxxxxx grunt generate-labels\n
or defined in ~/.profile for permanent use (see https://help.ubuntu.com/community/EnvironmentVariables#profile).` );

      // Parse the GitHub repository url. The url is parsed from the git-remote in package.json by Generator.
      // It should be of the form https://github.com/organization/repository_name.git
      const gitRemote = Generator.getReplacementValuesMapping().GIT_REMOTE;

      // If the url isn't a GitHub url an error is thrown.
      Util.assert( gitRemote.includes( GITHUB_URL ), `Cannot generate labels with non-github remote: ${ gitRemote }` );

      // Get the repository in terms of user-name/repo or organization/repo
      const repo = gitRemote.replace( '.git', '' ).replace( GITHUB_URL, '' );

      Util.logln( `Generating labels for ${ GITHUB_URL }${ repo } ...` );

      // GithubLabelSync label schema format is slightly different from .../github-labels-schema.json.
      // Convert over to an array of Object literals that look like:
      // {
      //    name: 'example',
      //    color: '333333',
      //    aliases: [ 'label' ]
      // }
      const labels = [];
      Util.iterate( LABELS_SCHEMA, ( labelName, schema ) => {
        labels.push( {
          name: labelName,

          // Two different types of schema. See LABELS_SCHEMA for documentation.
          color: typeof schema === 'string' ? schema : schema.color,
          aliases: typeof schema === 'string' ? null : schema.aliases
        } );
      } );

      let results; // reference the ending results
      try {
        results = await githubLabelSync( {
          repo,
          labels,
          dryRun,
          allowAddedLabels,
          accessToken: process.env.GITHUB_ACCESS_TOKEN
        } );
      }
      catch( error ) {
        // Inform user of bad credentials.
        Util.throw( `${ error.message } with GITHUB_ACCESS_TOKEN: ${ process.env.GITHUB_ACCESS_TOKEN }` );
      }

      //----------------------------------------------------------------------------------------
      // Log the results to the terminal. GithubLabelSync outputs an array of Object literals. See
      // https://www.npmjs.com/package/github-label-sync for documentation.

      // If the length of the results is 0, then no issues were changed. Return to stop further execution.
      if ( !results.length ) return Util.log( chalk.white( '\nIssues already up to date!' ) );

      // Log Success if it isn't a dry run.
      Util.logln( chalk.hex( '046200' )( dryRun ? '' : '\nSuccess!\n' ) );

      // Reference the newly created labels and the previous deleted labels.
      const createdLabels = results.filter( result => result.actual === null );
      const deletedLabels = results.filter( result => result.expected === null );

      Util.logln( `${ dryRun ? 'Would create' : 'Created' } ${ Util.pluralize( 'label', createdLabels.length ) }.` );
      Util.logln( `${ dryRun ? 'Would delete' : 'Deleted' } ${ Util.pluralize( 'label', deletedLabels.length ) }.` );

      !dryRun && Util.log( `\nSee ${ chalk.underline( gitRemote.replace( '.git', '/labels' ) ) } for results.` );
    }
  }

  return Labeler;
} )();