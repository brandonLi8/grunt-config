// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * Linting utility for running specified linting rules.
 *
 * ## Background
 *  - Linting is process that checks static source code before it is built and ran. Ran through the command line (cli),
 *    linting checks for programmatic and stylistic consistency errors. This helps identify common and uncommon
 *    that are made while modifying the source code.
 *
 * Currently only lints javascript files using ESlint (see https://eslint.org/). However, there are plans to
 * support different file types in the future.
 *
 * The configuration for ESlint can be found ../eslint/.eslintrc.js (relative to this file). It uses some default rules
 * (see documentation: https://eslint.org/docs/rules/) but also implements custom rules (see ../eslint/rules).
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

module.exports = ( () => {
  'use strict';

  // modules
  const eslint = require( 'eslint' );
  const grunt = require( 'grunt' );
  const md5 = require( 'md5' );
  const path = require( 'path' );
  const Util = require( './Util' );

  // constants
  // Files and directories to ignore when linting.
  const IGNORE_PATTERN = [ '**/.git', '**/node_modules', '**/third-party', '**/dist', '**/build' ];

  class Linter {


  }

  return Linter;
} )();