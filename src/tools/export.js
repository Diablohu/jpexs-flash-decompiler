'use strict';

var fs = require( 'fs' );
var async = require( 'async' );
var spawn = require( 'child_process' ).spawn;

var buildParameters = function( options ) {
  var params = [ '-jar', './src/jpexs/ffdec.jar' ];

  if ( options.formats && options.formats.length ) {
    params.push( '-format' );
    params.push( options.formats.join( ',' ) );
  }

  if ( options.items && options.items.length ) {
    params.push( '-export' );
    params.push( options.items.join( ',' ) );
  }

  params.push( options.output );
  params.push( options.file );

  return params;
};

module.exports = function( options, done ) {
  async.waterfall( [
    function( done ) {
      if ( !!options ) {
        done();
      } else {
        done( {
          message: 'No any arguments found, required options missed'
        } );
      }
    },
    function( done ) {
      fs.exists( options.file, ( exists ) => {
        if ( exists ) {
          done();
        } else {
          done( {
            message: 'File "' + options.file + '" not found, field "file" has incorrect value'
          } );
        }
      } );
    },
    function( done ) {
      fs.exists( options.output, ( exists ) => {
        if ( exists ) {
          done();
        } else {
          done( {
            message: 'Folder "' + options.output + '" not found, field "output" has incorrect value'
          } );
        }
      } );
    },
    function( done ) {
      var extr = spawn( 'java', buildParameters( options ) );
      var outputMsg = '';
      var errMsg = '';

      extr.stdout.on( 'data', ( data ) => {
        outputMsg += data.toString( 'utf8' );
      } );

      extr.stderr.on( 'data', ( data ) => {
        errMsg += data.toString( 'utf8' );
      } );

      extr.on( 'close', ( code ) => {
        if ( errMsg === '' ) {
          console.log( outputMsg );
          done();
        } else {
          console.log( errMsg );
          done( {
            message: errMsg
          } );
        }
      } );
    }
  ],
    function( err ) {
      console.log( err );
      done( err );
    }
  );
};