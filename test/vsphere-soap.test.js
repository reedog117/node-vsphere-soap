/*
  vsphere-soap.test.js

  tests for the vCenterConnectionInstance class
*/ 

var Code = require('code');
var Lab = require('lab');
var util = require('util');
var lab = exports.lab = Lab.script();
var vc = require('../lib/client');
var TestCreds = require('../config.js').vCenterTestCreds

var describe = lab.describe;
var it = lab.it;
var before = lab.before;
var after = lab.after;
var expect = Code.expect;

var VItest = new vc.Client(TestCreds.vCenterIP, TestCreds.vCenterUser, TestCreds.vCenterPassword, false);

describe('vCenterClient object initialization:', function(){

  it('provides a successful login', {timeout: 20000}, function(done) {
    
    VItest.on('ready', function() {
      expect(VItest.userName).to.exist();
      //console.log('logged in user : ' + VItest.userName);
      expect(VItest.fullName).to.exist();
      //console.log('logged in user fullname : ' + VItest.fullName);
      expect(VItest.serviceContent).to.exist();
      //console.log(VItest.serviceContent);
      done();
    });

    // if login works, can run the subsequent tests
  });

});

describe('v')

// these tests don't work yet
describe('vCenterConnectionInstance query commands:', function(){

  // make sure we have a successfully authenticated instance
  // before testing

  /*before( {timeout: 5000}, function(done){
    VItest.on('authenticated', function() {
      // get property collector
      propertyCollector = VItest.serviceContent.propertyCollector;
      // get view manager
      viewManager = VItest.serviceContent.viewManager;
      done();
    });
  });
  */

  it('retrieves current time', {timeout: 20000}, function(done){
    // get property collector
    //var propertyCollector = VItest.serviceContent.propertyCollector;
    // get view manager
    //var viewManager = VItest.serviceContent.viewManager;
    VItest.runCommand('CurrentTime', { _this: 'ServiceInstance'} )
      .on('result', function(result){
        //console.log('result retrieved : ' + util.inspect(result.returnval));
        expect(result.returnval).to.be.a.date();
        done();
    });
  }); 


  it('retrieves current time 2 (check for event clobbering)', {timeout: 20000}, function(done){
    // get property collector
    //var propertyCollector = VItest.serviceContent.propertyCollector;
    // get view manager
    //var viewManager = VItest.serviceContent.viewManager;
    VItest.runCommand('CurrentTime', { _this: 'ServiceInstance'} )
      .on('result', function(result){
        //console.log('result retrieved : ' + util.inspect(result.returnval));
        expect(result.returnval).to.be.a.date();
        done();
    });
  }); 

});
