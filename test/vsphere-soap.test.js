/*
  vsphere-soap.test.js

  tests for the vCenterConnectionInstance class
*/ 

var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var vCenterConnectionInstance = require('../lib/vcenterconnectioninstance.js').vCenterConnectionInstance;

var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var after = lab.after;
var expect = Code.expect;


describe('vCenterConnectionInstance object initialization:', function(){

  var VItest = new vCenterConnectionInstance('192.168.103.160','root','h@x0r!n!t', false);

  it('provides a successful login', {timeout: 20000}, function(done) {
    
    VItest.on('authenticated', function() {
      expect(VItest.userName).to.exist();
      //console.log('logged in user : ' + VItest.userName);
      expect(VItest.fullName).to.exist();
      //console.log('logged in user fullname : ' + VItest.fullName);
      done();
    });

    // if login works, can run the subsequent tests

  });

});
