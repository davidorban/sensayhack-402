// Configure chai
const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');

// Apply plugins to chai
chai.use(sinonChai.default || sinonChai);
chai.use(chaiAsPromised.default || chaiAsPromised);

// Make expect and sinon available globally
global.expect = chai.expect;
global.sinon = sinon;

// Configure test environment
process.env.NODE_ENV = 'test';
