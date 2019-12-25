// Copyright © 2019 Brandon Li. All rights reserved.

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
  const Generator = require( './Generator' );
  const githubLabelSync = require( 'github-label-sync' ); // eslint-disable-line require-statement-match
  const grunt = require( 'grunt' );
  const path = require( 'path' );
  const Util = require( './Util' );

  // constants
  const GITHUB_URL = 'https://github.com/';
  // Object literal that describes the GitHub issue labels that should be added. Each key is the name of the GitHub
  // issue label and correlates to one of the two values stated below:
  // 1. String - The color of the GitHub label as it appears in the issue. The label is assumed to have no aliases.
  // 2. Object Literal - an object literal with:
  //                      - a color key that correlates to a color string as described in 1.
  //                      - a string array that contains aliases to other labels
  const LABELS_SCHEMA = grunt.file.readJSON( path.dirname( __dirname ) + '/github-labels-schema.json' );

  class Labeler {

    /**
     *
     */
    static async generateLabels( dryRun = true ) {

      // Assert that the GITHUB_ACCESS_TOKEN node environment variable exists
      Util.assert( process.env.GITHUB_ACCESS_TOKEN, `Could not retrieve the GITHUB_ACCESS_TOKEN environment variable.
Labeler requires a GITHUB_ACCESS_TOKEN node environment variable for access to fetch and update labels.
The token must have permission to write to the repository. See https://github.com/settings/tokens
on how to create this token. The token GITHUB_ACCESS_TOKEN can be passed in the command line:\n
$ GITHUB_ACCESS_TOKEN=xxxxxxxx grunt generate-labels\n
or defined in ~/.profile (see https://help.ubuntu.com/community/EnvironmentVariables#A.2BAH4-.2F.profile).` );

      // Parse the GitHub repository url. The url is parsed from the git-remote in package.json by Generator.
      const gitRemote = Generator.getReplacementValuesMapping().GIT_REMOTE;

      // If the url isn't a GitHub url an error is thrown.
      Util.assert( gitRemote.includes( GITHUB_URL ), `Cannot generate labels with non GitHub remote: ${ gitRemote }` );

      // Get the repository in terms of user-name/repo or organization/repo
      const repo = gitRemote.replace( '.git', '' ).replace( GITHUB_URL, '' );

      grunt.log.writeln( `Generating labels for ${ GITHUB_URL }${ repo } ...`  );

      // githubLabelSync label schema format is slightly different from .../github-labels-schema.json, so convert over
      const labels = [];
      Util.iterate( LABELS_SCHEMA, ( labelName, schema ) => {
        labels.push( {
          name: labelName,
          color: typeof schema === 'string' ? schema : schema.color,
          aliases: typeof schema === 'string' ? null : schema.aliases
        } );
      } );

      const results = await githubLabelSync( {
        repo: repo,
        labels: labels,
        dryRun: dryRun,
        accessToken: process.env.GITHUB_ACCESS_TOKEN
      } );

      const createdLabels = results.filter( result => result.actual === null );
      const deletedLabels = results.filter( result => result.expected === null );

      if ( createdLabels.length ) {
        !dryRun && grunt.log.writeln( '\nSuccess!' );
        grunt.log.writeln( `${ dryRun ? '\nWould create' : 'Created' } ${ createdLabels.length } new label${ createdLabels.length > 1 ? 's': '' }:` );
        createdLabels.forEach( label => {
          grunt.log.writeln( `  ${ label.name }: #${ label.expected.color }` );
        } );
      }
      if ( deletedLabels.length ) {
        !dryRun && grunt.log.writeln( '\nSuccess!' );
        grunt.log.writeln( `${ dryRun ? '\nWould delete' : 'deleted' } ${ deletedLabels.length } label${ deletedLabels.length > 1 ? 's': '' }:` );
        deletedLabels.forEach( label => {
          grunt.log.writeln( `  ${ label.name }: #${ label.actual.color }` );
        } );
      }

      if ( !createdLabels.length && !deletedLabels.length ) {
        grunt.log.writeln( '\nIssues already up to date!' );
      }

    }
  }

  return Labeler;
} )();