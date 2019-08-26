// Copyright © 2019 Brandon Li. All rights reserved.

/**
 * es-lint configuration file
 *
 * ## Context
 * 0 - no error
 * 1 - warn
 * 2 - error
 *
 * See https://eslint.org/docs/rules for documentation on rules.
 *
 * //----------------------------------------------------------------------------------------
 * This is free to change to your preferences! Feel free to modify/add rules on a fork!
 *
 * Some of the rules are custom (found in ./rules). Keep this file organized by putting custom rules at the bottom
 * of the file.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

'use strict';

module.exports = {

  // Extend the default configuration
  extends: 'eslint:recommended',
  root: true,

  // Override the default configuration
  rules: {

    // Code styling lint: arrays should have spacing within the brackets (like the declaration of this key-object)
    'array-bracket-spacing': [ 2, 'always' ],

    // Code styling lint: blocks should have spacing within the brackets
    'block-spacing': [ 2, 'always' ],

    // Code styling lint: see https://eslint.org/docs/rules/brace-style (stroustrup method)
    'brace-style': [ 2, 'stroustrup' ],

    // Enforces a max line length
    'max-len': [ 2, {
      code: 120,
      tabWidth: 2,
      ignoreUrls: true,
      ignoreRegExpLiterals: true,
      ignorePattern: '^\\s*var\\s.+=\\s*require\\s*\\('
    } ],

    // via code style guidline, always add parens
    'space-in-parens': [ 2, 'always' ],
    'array-bracket-spacing': [ 2, 'always' ],
    'no-multi-spaces': 2,

    'no-trailing-spaces': 2,
    'no-unused-vars': 2,
    'require-statement-match': 2,

    // Should never have a space (e.g. foo ( args ) should be foo( args ))
    'func-call-spacing': [ 2, 'never' ],

    // Error on 'console.log'. Should be removed when pushing (when you should lint), but can be used in development.
    'no-console': 2,

    // Only allow single quotes
    quotes: [ 2, 'single' ],

    // No dangling commas (unneeded commas on arrays/objects)
    'comma-dangle': 2,

    // Always require a semi-colon. Avoid javascript ASI.
    semi: [ 2, 'always' ],

    'template-curly-spacing': [ 2, 'always' ],

    // Variables that don't change should always use a const declaration
    'prefer-const': [ 2, {
      destructuring: 'any',
      ignoreReadBeforeAssign: false
    } ],

    // Must use === and !== See https://eslint.org/docs/rules/eqeqeq
    eqeqeq: 2,

    // Disallow use of arguments.caller or arguments.callee
    'no-caller': 2,

    // Disallow Function Constructor (no-new-func) (effectively an es6 rule)
    'no-new-func': 2,

    // Require or disallow strict mode directives (strict)
    strict: [ 2, 'function' ],

    // Encourages use of dot notation whenever possible (foo.bar, not foo[ 'bar' ] )
    'dot-notation': 2,

    // Es6 - no more var!
    'no-var': 2,

    // ${var} should only be inside of ``
    'no-template-curly-in-string': 2,

    // Disallow adding to native types
    'no-extend-native': 2,

    // Disallow use of assignment in return statement
    'no-return-assign': 2,

    // Disallow unnecessary .call() and .apply()
    'no-useless-call': 2,

    // Disallow use of undefined when initializing variables
    'no-undef-init': 2,

    // Only allow one var declaration per line
    'one-var': [ 2, 'never' ],

    // See https://eslint.org/docs/rules/radix
    radix: 2,

    // Require default case for switch statements
    'default-case': 2,

    // Consistently use 'self' as the alias for 'this'
    'consistent-this': [ 2, 'self' ],

    // Always require object shorthand
    'object-shorthand': 2,

    //========================================================================================
    // Custom Rules
    //========================================================================================

    // Custom rule for checking the copyright.
    copyright: 2,

    // Rule to disallow 'bad text'
    'bad-text': 2,

    // Require @public/@private for this.something = result;
    'property-visibility-annotation': 2,

    'sort-require-statements': 2


  },
  env: {
    browser: true,
    es6: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 8
  },
  globals: {

    // underscore, lodash
    _: false,

    // jQuery
    $: false,

    // require.js
    define: false,

    // require.js
    require: false,

    // built-in
    window: false,
    document: false,

    // as used in Gruntfile.js
    module: false,
    process: false
  }
};