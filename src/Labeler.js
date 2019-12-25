// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * GitHub issue label generator that synchronizes labels with the schema defined in .../github-labels-schema.json.
 *
 * Determines the GitHub repository from the package.json in the root directory that invoked the command.
 * (parsed from the git-remote by Generator)
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
  const util = require( 'util' );

  // constants

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
    static generateLabels() {

      // assert that the GITHUB_ACCESS_TOKEN node environment variable exists
      Util.assert( process.env.GITHUB_ACCESS_TOKEN, `Could not retrieve the GITHUB_ACCESS_TOKEN environment variable. Labeler requires a GITHUB_ACCESS_TOKEN node environment variable for access to fetch and update labels. The token must have permission to write to the repository. See https://github.com/settings/tokens on how to create this token. The token GITHUB_ACCESS_TOKEN can be passed in the command line:

$ GITHUB_ACCESS_TOKEN=xxxxxxxx grunt generate-labels

or defined in ~/.profile (see https://help.ubuntu.com/community/EnvironmentVariables#A.2BAH4-.2F.profile).` );




    }
  }

  return Labeler;
} )();