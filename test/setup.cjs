// Test setup file
const chai = require('chai');
const sinonChai = require('sinon-chai');
const sinon = require('sinon');
const chaiAsPromised = require('chai-as-promised');

// Configure chai
chai.use(sinonChai);
chai.use(chaiAsPromised);

// Global test hooks
beforeEach(function() {
  // Initialize test doubles
  this.sandbox = sinon.createSandbox();
});

afterEach(function() {
  // Restore all stubs, spies, and mocks
  this.sandbox.restore();
});

// Make expect available globally
const { expect } = chai;
global.expect = expect;
global.sinon = sinon;
