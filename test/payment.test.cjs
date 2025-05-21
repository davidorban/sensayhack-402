// Test dependencies
require('./test-helper.cjs');
const chai = require('chai');
const sinon = require('sinon');
const { coinbaseService, CoinbaseService } = require('../src/backend/services/coinbase-service.js');
const { sessionStore } = require('../src/backend/services/session-store.js');
const { PaymentController } = require('../src/backend/controllers/payment-controller.js');
const { config } = require('../src/backend/utils/config.js');
const { logger } = require('../src/backend/utils/logger.js');

const { expect } = chai;
const { assert } = chai;

// Test variables
let sandbox;
let req;
let res;
let next;

// Mock request ID generator
const mockRequestId = 'test-request-123';
const mockUserId = 'test-user-123';
const mockProof = 'test-proof-123';
const mockInvoiceId = 'test-invoice-123';

// Test data
const TEST_PAYMENT = {
  invoiceId: 'test-invoice-123',
  amount: '0.01',
  asset: 'usdc',
  status: 'paid',
  paidAt: new Date().toISOString(),
  proof: 'test-proof',
  updatedAt: new Date().toISOString()
};

// Mock the session store for testing
const mockSessionStore = {
  activeSessions: new Map(),
  paymentProofs: new Map(),
  receiptCache: new Map(),
  pendingPayments: new Map(),
  
  getSession(userId) {
    return this.activeSessions.get(userId);
  },
  
  setSession(userId, sessionData) {
    this.activeSessions.set(userId, { ...sessionData });
  },
  
  deleteSession(userId) {
    this.activeSessions.delete(userId);
  },
  
  getPaymentInfo(userId) {
    const session = this.getSession(userId);
    return session?.paymentInfo || null;
  },
  
  updatePaymentInfo(userId, paymentInfo) {
    const session = this.getSession(userId) || {};
    session.paymentInfo = {
      ...session.paymentInfo,
      ...paymentInfo,
      updatedAt: new Date().toISOString()
    };
    this.setSession(userId, session);
    return session.paymentInfo;
  },
  
  getSessionCount() {
    return this.activeSessions.size;
  },
  
  // Add a method to clear all data for testing
  clearAll() {
    this.activeSessions.clear();
    this.paymentProofs.clear();
    this.receiptCache.clear();
    this.pendingPayments.clear();
  }
};

// Replace the actual session store with our mock
Object.assign(sessionStore, mockSessionStore);

// Make sure the session store is properly initialized before tests
beforeEach(() => {
  // Clear the session store before each test
  sessionStore.clearAll();
});

describe('Payment Controller', () => {
  let req;
  let res;
  let next;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    
    req = {
      body: {},
      params: {},
      query: {},
      session: {
        userId: 'test-user-123'
      },
      id: 'test-request-123'
    };

    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
      set: sinon.stub().returnsThis()
    };

    next = sinon.stub();
  });

  afterEach(() => {
    sandbox.restore();
    sessionStore.clearAll(); // Clear session store between tests
    
    // Reset all stubs and mocks
    if (res.status) res.status.resetHistory();
    if (res.json) res.json.resetHistory();
    if (res.set) res.set.resetHistory();
    if (next) next.resetHistory();
  });
  
  describe('verifyPayment', function() {
    // Increase timeout for async tests
    this.timeout(10000);
    
    let clock;
    
    // Stub references
    let validateStub;
    let generateUrlStub;
    let verifyProofStub;
    let getPaymentInfoStub;
    let updatePaymentInfoStub;
    let getSessionStub;
    
    beforeEach(() => {
      // Create a fresh sandbox for each test
      sandbox = sinon.createSandbox();
      
      // Stub the CoinbaseService methods
      generateUrlStub = sandbox.stub(CoinbaseService, 'generatePaymentUrl')
        .resolves('https://payment.example.com');
        
      validateStub = sandbox.stub(CoinbaseService, 'validateUserPayment')
        .resolves(true);
        
      verifyProofStub = sandbox.stub(CoinbaseService, 'verifyPaymentProof')
        .resolves({
          valid: true,
          invoice_id: mockInvoiceId,
          amount: '0.01',
          asset: 'usdc'
        });
      
      // Stub the session store
      getPaymentInfoStub = sandbox.stub(sessionStore, 'getPaymentInfo')
        .returns(null);
        
      updatePaymentInfoStub = sandbox.stub(sessionStore, 'updatePaymentInfo');
      
      getSessionStub = sandbox.stub(sessionStore, 'getSession')
        .returns({ paymentInfo: null });
      
      // Stub the logger
      sandbox.stub(logger, 'info');
      sandbox.stub(logger, 'error');
      sandbox.stub(logger, 'debug');
      sandbox.stub(logger, 'warn');
      
      // Reset request object
      req = {
        session: { userId: mockUserId },
        params: { userId: mockUserId },
        headers: {},
        body: {
          proof: mockProof,
          userId: mockUserId
        },
        id: mockRequestId
      };
      
      // Reset response object
      res = {
        status: sandbox.stub().returnsThis(),
        json: sandbox.stub().returnsThis(),
        set: sandbox.stub().returnsThis()
      };
      
      // Create a fake clock - using sandbox to ensure proper cleanup
      clock = sandbox.useFakeTimers({
        now: new Date(2023, 0, 1, 12, 0, 0),
        shouldAdvanceTime: true
      });
    });
    
    afterEach(() => {
      // Restore the sandbox (this also restores the clock)
      sandbox.restore();
    });
    
    it('should return 400 if no proof is provided', async () => {
      // Arrange
      req.body.proof = '';
      
      // Act & Assert
      try {
        await PaymentController.verifyPayment(req, res);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.message).to.equal('Payment proof is required');
        expect(error.statusCode).to.equal(400);
      }
    });
    
    it('should return 400 if no user ID is provided', async () => {
      // Arrange
      req.session = {};
      req.body.userId = '';
      
      // Act & Assert
      try {
        await PaymentController.verifyPayment(req, res);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).to.be.an('error');
        expect(error.message).to.equal('User ID is required');
        expect(error.statusCode).to.equal(400);
      }
    });
    
    it('should validate payment with Coinbase', async () => {
      // Arrange
      const paymentInfo = {
        invoiceId: mockInvoiceId,
        status: 'paid',
        amount: '0.01',
        asset: 'usdc',
        paidAt: new Date().toISOString()
      };
      
      validateStub.resolves(true);
      getPaymentInfoStub.returns(paymentInfo);
      
      // Act
      await PaymentController.verifyPayment(req, res);
      
      // Assert
      expect(validateStub.called).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal('success');
      expect(response.payment).to.deep.include({
        status: 'paid'
      });
    });
    
    it('should return 402 for invalid payment proof', async () => {
      // Arrange
      const error = new Error('Invalid or expired payment proof');
      error.statusCode = 402;
      error.suggestion = 'Please initiate a new payment request.';
      
      validateStub.rejects(error);
      
      // Act
      await PaymentController.verifyPayment(req, res);
      
      // Assert
      expect(res.status.calledWith(402)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal('error');
      expect(response.error).to.include('Invalid or expired payment proof');
    });
    
    it('should handle Coinbase API errors', async () => {
      // Arrange
      const error = new Error('Coinbase API error');
      error.statusCode = 500;
      validateStub.rejects(error);
      
      // Act
      await PaymentController.verifyPayment(req, res);
      
      // Assert
      expect(res.status.calledWith(502)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal('error');
      expect(response.error).to.include('Payment verification service unavailable');
    });
    
    it('should handle transient failures', async () => {
      // Arrange
      const transientError = new Error('Temporary failure');
      transientError.statusCode = 503;
      
      validateStub.rejects(transientError);
      
      // Act
      await PaymentController.verifyPayment(req, res);
      
      // Assert
      expect(res.status.calledWith(502)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal('error');
      expect(response.error).to.include('Payment verification service unavailable');
    });
    
    it('should retry validation on transient failures', async () => {
      // Arrange
      const transientError = new Error('Temporary failure');
      const paymentInfo = {
        invoiceId: mockInvoiceId,
        status: 'paid',
        amount: '0.01',
        asset: 'usdc',
        paidAt: new Date().toISOString()
      };
      
      validateStub
        .onFirstCall().rejects(transientError)
        .onSecondCall().resolves(true);
      
      getPaymentInfoStub.returns(paymentInfo);
      
      // Act
      const paymentPromise = PaymentController.verifyPayment(req, res);
      
      // Advance time to trigger retry
      await clock.tickAsync(1000);
      await paymentPromise;
      
      // Assert
      sinon.assert.calledTwice(validateStub);
      sinon.assert.calledWith(res.status, 200);
      
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal('success');
      
      // Verify warning was logged for the retry
      sinon.assert.calledWith(
        logger.warn,
        'Retriable error during payment validation',
        sinon.match({
          requestId: mockRequestId,
          userId: mockUserId,
          error: transientError.message,
          attempt: 1
        })
      );
    });

  describe('Edge case handling', function() {
    it('should handle missing request ID gracefully', async () => {
      // Create a new request object without the id property
      const { id, ...reqWithoutId } = req;
      
      reqWithoutId.body = { proof: 'test-proof' };
      // We already stubbed validateUserPayment in beforeEach
      
      await PaymentController.verifyPayment(reqWithoutId, res);
      
      expect(res.json.calledOnce).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal('success');
    });

    it('should handle Coinbase API errors gracefully', async () => {
      req.body = { proof: 'test-proof' };
      const error = new Error('Coinbase API error');
      error.statusCode = 500;
      // Reset the stub and configure it to reject with our error
      validateStub.reset();
      validateStub.rejects(error);
      
      await PaymentController.verifyPayment(req, res);
      
      expect(res.status.calledWith(502)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal('error');
      expect(response.error).to.include('Payment verification service unavailable');
    });

    it('should handle expired payment proof', async () => {
      req.body = { proof: 'expired-proof' };
      // Reset the stub and configure it to resolve with false
      validateStub.reset();
      validateStub.resolves(false);
      
      await PaymentController.verifyPayment(req, res);
      
      expect(res.status.calledWith(402)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal('error');
      expect(response.error).to.include('Invalid or expired payment proof');
    });
  });

  it('should handle concurrent payment verification', async () => {
    req.body = { proof: 'concurrent-proof' };
    // We're already stubbing validateUserPayment in beforeEach, 
    // just reset and reconfigure it
    validateStub.reset();
    validateStub.resolves(true);
    
    // Simulate concurrent requests
    const results = await Promise.all([
      PaymentController.verifyPayment({ ...req }, { ...res, json: sinon.stub() }),
      PaymentController.verifyPayment({ ...req }, { ...res, json: sinon.stub() })
    ]);
    
    // In a real implementation with caching, this might be called once,
    // but with isolated test stubs it will be called for each request
    expect(validateStub.called).to.be.true;
  });

  it('should return 402 for invalid proof', async () => {
    req.body = { proof: 'invalid-proof' };
    // Reset and reconfigure the existing stub
    validateStub.reset();
    validateStub.resolves(false);
    
    await PaymentController.verifyPayment(req, res);
    
    expect(res.status.calledWith(402)).to.be.true;
    expect(validateStub.calledOnce).to.be.true;
    
    const response = res.json.getCall(0).args[0];
    expect(response.status).to.equal('error');
    expect(response.error).to.equal('Invalid or expired payment proof');
  });

  it('should return 200 and payment info for valid proof', async () => {
    const testPaymentInfo = {
      invoiceId: 'test-invoice-123',
      amount: '0.01',
      asset: 'usdc',
      paidAt: new Date().toISOString(),
      status: 'paid'
    };
    
    req.body = { proof: 'valid-proof' };
    // Reset and reconfigure the existing stub
    validateStub.reset();
    validateStub.resolves(true);
    
    // Configure the session store to return the payment info
    getPaymentInfoStub.returns({
      ...testPaymentInfo,
      proof: 'valid-proof'
    });
    
    await PaymentController.verifyPayment(req, res);
    
    expect(res.status.called).to.be.false; // Default status is 200
    expect(res.json.calledOnce).to.be.true;
    
    const response = res.json.getCall(0).args[0];
    expect(response.status).to.equal('success');
    expect(response.payment.invoiceId).to.equal(testPaymentInfo.invoiceId);
    expect(response.payment.amount).to.equal(testPaymentInfo.amount);
    expect(response.payment.asset).to.equal(testPaymentInfo.asset);
  });
});

describe('checkPaymentStatus', function() {
  let sandbox;
  
  beforeEach(() => {
    // Create a fresh sandbox for each test
    sandbox = sinon.createSandbox();
    
    // Stub the session store
    sandbox.stub(sessionStore, 'getPaymentInfo');
    
    // Stub the logger
    sandbox.stub(logger, 'info');
    sandbox.stub(logger, 'error');
    sandbox.stub(logger, 'debug');
    sandbox.stub(logger, 'warn');
    
    // Reset request and response objects
    req = {
      session: { userId: mockUserId },
      params: { userId: mockUserId },
      query: {},
      id: mockRequestId
    };
    
    res = {
      status: sandbox.stub().returnsThis(),
      json: sandbox.stub().returnsThis()
    };
  });
  
  afterEach(() => {
    sandbox.restore();
  });

  it('should return 400 if no user ID is provided', () => {
    // Arrange
    req.session = {}; // Clear session
    req.params = {};  // Clear params
    
    // Act
    PaymentController.checkPaymentStatus(req, res);
    
    // Assert
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    
    const response = res.json.getCall(0).args[0];
    expect(response.status).to.equal('error');
    expect(response.error).to.equal('User ID is required');
  });
  
  it('should return 404 if no payment info exists', () => {
    // Arrange
    sessionStore.getPaymentInfo.returns(null);
    
    // Act
    PaymentController.checkPaymentStatus(req, res);
    
    // Assert
    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    
    const response = res.json.getCall(0).args[0];
    expect(response.status).to.equal('not_found');
    expect(response.message).to.equal('No payment information found for this user');
  });

  it('should return payment status if payment info exists', () => {
    // Arrange
    const paymentInfo = {
      invoiceId: 'test-invoice-123',
      status: 'paid',
      amount: '0.01',
      asset: 'usdc',
      paidAt: new Date().toISOString(),
      proof: 'test-proof',
      updatedAt: new Date().toISOString()
    };
    
    sessionStore.getPaymentInfo.returns(paymentInfo);
    
    // Act
    PaymentController.checkPaymentStatus(req, res);
    
    // Assert
    expect(res.json.calledOnce).to.be.true;
    
    const response = res.json.getCall(0).args[0];
    expect(response.status).to.equal('success');
    expect(response.payment.status).to.equal('paid');
    expect(response.payment.invoiceId).to.equal(paymentInfo.invoiceId);
    expect(response.payment.amount).to.equal(paymentInfo.amount);
    expect(response.payment.asset).to.equal(paymentInfo.asset);
    expect(response.payment.proof).to.equal('***REDACTED***'); // Proof should be redacted
  });
});
});
