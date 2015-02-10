/*

  node-vsphere-soap

  client.js

  This file creates the Client class

  - when the class is instantiated, a connection will be made to the ESXi/vCenter server to verify that the creds are good
  - upon a bad login, the connnection will be terminated

*/

var EventEmitter = require('events').EventEmitter,
  util = require('util'),
  soap = require('soap'),
  cookie = require('soap-cookie'),   // required for session persistence
  constants = require('constants'),
  _ = require('lodash');

function Client( vCenterHostname, username, password, sslVerify) {

  this.status = 'disconnected';

  sslVerify = typeof sslVerify !== 'undefined' ? sslVerify : false;

  var self = this;

  EventEmitter.call( this );

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

  this._loginArgs = {
    userName: this.connectionInfo.user,
    password: this.connectionInfo.password,
  };

  this._vcUrl = 'https://' + this.connectionInfo.host + '/sdk/vimService.wsdl';

  this.on('connect', this._connect );
  this.emit('connect');

  return this;

};

util.inherits(Client, EventEmitter);

Client.prototype.runCommand = function(command, arguments) {

  var self = this;
  var cmdargs;
  if(!arguments || arguments == null) {
    cmdargs = {};
  } else {
    cmdargs = arguments;
  }

  var cmdExec = new _commandExecutor(self);
  //console.log('arguments for command ' + command + ' : ' + cmdargs);

  cmdExec.runCommand(command, cmdargs);

  return cmdExec;

};

Client.prototype._connect = function() {

  var self = this;

  soap.createClient(this._vcUrl, this.clientopts, function(err, client) {
    if( err ) { 
      self.emit('error',err);
      self.status = disconnected;
      throw err;
    }

    self.client = client; // save client for later use

    client.RetrieveServiceContent( { _this: 'ServiceInstance'}, function( err, result, raw, soapHeader){
      if( err ) { 
        self.emit('error',err);
        self.status = disconnected;
        throw err;
      }

      self.serviceContent = result.returnval;
      var sessionManager = result.returnval.sessionManager;

      var loginArgs = _.assign({ _this: sessionManager }, self._loginArgs);
      
      client.Login( loginArgs , function( err, result, raw, soapHeader){
        if( err ) { 
          self.emit('error',err);
          self.status = 'disconnected';
          throw err;         
        }

        // store authentication cookie for later use
        self.authCookie = new cookie(client.lastResponseHeaders);

        client.setSecurity(self.authCookie); // needed since vSphere SOAP WS uses cookies
        self.userName = result.returnval.userName;
        self.fullName = result.returnval.fullName;

        self.status = 'ready';
        self.emit('ready');

      });
    });

  }, this._vcUrl);

};

// internal _commandExecutor class
// inherits from EventEmitter
// possible events: error, result

function _commandExecutor(parent) {

  var self = this;

  EventEmitter.call( this );

  this._parent = parent;

};

util.inherits( _commandExecutor, EventEmitter);

_commandExecutor.prototype.runCommand = function(command, arguments) {

  var self = this;

  self._parent.client[command]( arguments, function( err, result, raw, soapHeader) {
    if( err ) { 
      //console.log('--- ' + command + ' error -------------------');
      //console.log( 'Error - status code: ' + err.response.statusCode);
      //console.log( 'Error - response body: ' + err.response.body);
      //console.log('----------------------');
      self.emit('error',err);
      throw err;
    }

    //console.log('ran command ' + command);
    self.emit('result', result, raw, soapHeader);

  }); 

};


// end
exports.Client = Client;


