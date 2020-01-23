// Copyright © 2020 Brandon Li. All rights reserved.

/**
 * ESlint configuration file. See https://eslint.org/docs/user-guide/configuring for documentation of implementing
 * the .eslintrc file.
 *
 * Values for the rules:
 * 0 - no error
 * 1 - warn
 * 2 - error
 *
 * See https://eslint.org/docs/rules for documentation on rules.
 *
 * @author Brandon Li <brandon.li820@gmail.com>
 */

'use strict';

module.exports = {

  // Extend the default configuration.
  extends: 'eslint:recommended',
  root: true,

  // Override the default configuration.
  rules: {

    //----------------------------------------------------------------------------------------
    // Enforce correct spacing. See https://eslint.org/docs/rules/#stylistic-issues for documentation.
    //----------------------------------------------------------------------------------------
    'array-bracket-spacing': [ 2, 'always' ],                            // use [ 5, 6 ] instead of [5, 6]
    'block-spacing': [ 2, 'always' ],                                    // use { bar(); } instead of {bar();}
    'comma-spacing': [ 2, { 'before': false, 'after': true } ],          // use [ 5, 6, 7 ] instead of [ 5 ,6,7 ]
    'computed-property-spacing': [ 2, 'always' ],                        // use obj[ foo ] instead of obj[foo]
    'func-call-spacing': [ 2, 'never' ],                                 // use bar() instead of bar () when calling.
    'key-spacing': 2,                                                    // use { foo: 5 } instead of { foo:5 }
    'keyword-spacing': [ 2, { overrides: { catch: { after: !!0 } } } ],  // use while ( foo ) instead of while( foo )
    'no-multi-spaces': [ 2, { 'ignoreEOLComments': true } ],
    'object-curly-spacing': [ 2, 'always' ],
    'space-before-blocks': 2,
    'space-before-function-paren': [ 2, { asyncArrow: 'always', named: 'never', anonymous: 'never' } ],
    'space-in-parens': [ 2, 'always' ],
    'spaced-comment': [ 2, 'always', { exceptions: [ '-', '*', '=' ] } ],
    'func-call-spacing': [ 2, 'never' ], // Should never have a space (e.g. foo ( args ) should be foo( args ))
    'template-curly-spacing': [ 2, 'always' ],
    'semi-spacing': 2,

    'brace-style': [ 2, 'stroustrup',  { 'allowSingleLine': true } ], // See https://eslint.org/docs/rules/brace-style

    // enforce a max line length of 120 characters, ignoring require statements, urls, and regular expression literals.
    'max-len': [ 2, {
      code: 120,
      tabWidth: 2,
      ignoreUrls: true,
      ignoreRegExpLiterals: true,
      ignorePattern: '^\\s*const\\s.+=\\s*require\\s*\\('
    } ],


    'no-trailing-spaces': 2,
    'no-unused-vars': [ 2, { args: 'none' } ],
    'require-statement-match': 2,



    // Error on 'console.log'. Should be removed when pushing (when you should lint), but can be used in development.
    'no-console': 2,

    // Only allow single quotes
    quotes: [ 2, 'single' ],

    // No dangling commas (unneeded commas on arrays/objects)
    'comma-dangle': 2,

    // Always require a semi-colon. Avoid javascript ASI.
    semi: [ 2, 'always' ],



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

    'sort-require-statements': 2


  },
  env: {
    browser: true,
    es6: true,
    node: true
  },
  parserOptions: {
    ecmaVersion: 9
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