/*

  vCenterConnectionInstance.js

  This file creates the vCenterConnectionInstance class


  - when the class is instantiated, a connection will be made to the ESXi/vCenter server to verify that the creds are good
  - upon a bad login, the connnection will be terminated
  - for now every operation will cause the system to login and create a new session
   - this is because there is no easy way to access session cookies from the results provided by the server

*/


var EventEmitter = require('events').EventEmitter,
  util = require('util'),
  soap = require('soap'),
  constants = require('constants'),
  _ = require('lodash');

function vCenterConnectionInstance( vCenterHostname, username, password, sslVerify) {

  sslVerify = typeof sslVerify !== 'undefined' ? sslVerify : false;

  // sslVerify argument handling
  if(sslVerify) {
    this.clientopts = {};
  } else {
    this.clientopts = {
      rejectUnauthorized: false,
      strictSSL: false,
      secureOptions: constants.SSL_OP_NO_TLSv1_2 // likely needed for node >= 10.0
    }; // recommended options by node-soap authors
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // need for self-signed certs
  }

  this.connectionInfo = {
    'host' : vCenterHostname,
    'user' : username,
    'password' : password,
    'sslVerify' : sslVerify
  };

  this.loginArgs = {
    userName: this.connectionInfo.user,
    password: this.connectionInfo.password,
  };

  this.status = 'disconnected';

  // Call the super constructor so it has EventEmitter calls
  EventEmitter.call( this );

  this._vcUrl = 'https://' + this.connectionInfo.host + '/sdk/vimService.wsdl';

  // this does an initial connection upon instantiation to verify the connection/login information
  soap.createClient(this._vcUrl, this.clientopts, function(err, client) {
    if( err ) { 
      console.log(err);
      throw err;
    }

    client.RetrieveServiceContent( { _this: 'ServiceInstance'}, function( err, result, raw, soapHeader){
      if( err ) { 
        console.log( 'Error - status code: ' + err.response.statusCode);
        console.log( 'Error - response body: ' + err.response.body);
        console.log('----------------------');

        throw err;
      }

      var sessionManager = result.returnval.sessionManager;

      var loginArgs = _.assign({ _this: sessionManager }, this.loginArgs);
      
      client.Login( loginArgs , function( err, result, raw, soapHeader){
        if( err ) { 
          console.log( 'Error - status code: ' + err.response.statusCode);
          console.log( 'Error - response body: ' + err.response.body);
          console.log('----------------------');

          throw err;
          this.status = 'disconnected';
        }

        this.userName = result.returnval.userName;
        this.fullName = result.returnval.fullName;

        this.status = 'authenticated';

        client.Logout( {_this: sessionManager}, function( err, result, raw, soapHeader ){
          if( err ) { 
            console.log( 'Error - status code: ' + err.response.statusCode);
            console.log( 'Error - response body: ' + err.response.body);
            console.log('----------------------');

            throw err;
            this.status = 'disconnected';
          }

          if(result.returnval.statusCode == 200) {
            console.log('successfully logged out!');
          }

          console.log(JSON.stringify(result));
        });

        this.emit('authenticated');

      }.bind(this));
    }.bind(this));

  }.bind(this), this._vcUrl);

  return this;

};

util.inherits(vCenterConnectionInstance, EventEmitter);



vCenterConnectionInstance.prototype.powerOnVmByName = function(vmName) {





};


// end
exports.vCenterConnectionInstance = vCenterConnectionInstance;


