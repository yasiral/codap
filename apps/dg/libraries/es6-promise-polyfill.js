// Polyfill the Promise object.
sc_require('libraries/es6-promise-2.0.1.js');
window.Promise = window.Promise || ES6Promise.Promise;
