// Test dependencies
require('./test-helper.cjs');
const { expect } = require('chai');
const sinon = require('sinon');
const { CoinbaseService } = require('../src/backend/services/coinbase-service.js');
const { sessionStore } = require('../src/backend/services/session-store.js');
const { logger } = require('../src/backend/utils/logger.js');

// Load the middleware
const paymentModule = require('../src/backend/middleware/payment');
const requirePayment = paymentModule.requirePayment;

// Test variables
let sandbox;
let req, res, next;

// Test data
const TEST_PAYMENT = {
  invoiceId: 'test-invoice-123',
  paymentUrl: 'https://payment.example.com',
  status: 'pending',
  amount: '0.01',
  currency: 'USD',
  createdAt: Date.now(),
  validUntil: Date.now() + 3600000 // 1 hour from now
};

describe('Payment Middleware', () => {
  beforeEach(() => {
    // Create a fresh sandbox for each test
    sandbox = sinon.createSandbox();
    
    // Stub the CoinbaseService methods
    sandbox.stub(CoinbaseService, 'generatePaymentUrl').resolves('https://payment.example.com');
    sandbox.stub(CoinbaseService, 'validateUserPayment').resolves(true);
    
    // Stub the session store
    sandbox.stub(sessionStore, 'getPaymentInfo');
    sandbox.stub(sessionStore, 'updatePaymentInfo');
    
    // Stub the logger
    sandbox.stub(logger, 'info');
    sandbox.stub(logger, 'error');
    sandbox.stub(logger, 'debug');
    
    // Reset request object
    req = {
      session: { userId: 'test-user-123' },
      headers: {},
      body: { metadata: { messageId: 'test-message-123' } },
      id: 'test-request-123'
    };
    
    // Reset response object
    res = {
      status: sandbox.stub().returnsThis(),
      json: sandbox.stub().returnsThis(),
      set: sandbox.stub().returnsThis()
    };
    
    // Reset next function
    next = sandbox.stub();
  });
  
  afterEach(() => {
    // Restore the sandbox
    sandbox.restore();
  });
  
  describe('requirePayment', () => {
    it('should call next() if payment is already verified', async () => {
      // Arrange
      const paymentInfo = { 
        ...TEST_PAYMENT, 
        status: 'paid',
        validUntil: Date.now() + 3600000, // 1 hour from now
        proof: 'valid-proof-123'
      };
      
      sessionStore.getPaymentInfo.returns(paymentInfo);
      
      // Act
      await requirePayment(req, res, next);
      
      // Assert
      sinon.assert.calledOnce(next);
      sinon.assert.notCalled(res.status);
      sinon.assert.calledWith(sessionStore.getPaymentInfo, 'test-user-123');
    });
    
    it('should return 402 with payment URL if no payment proof is provided', async () => {
      // Arrange
      sessionStore.getPaymentInfo.returns(null);
      
      // Act
      await requirePayment(req, res, next);
      
      // Assert
      sinon.assert.calledWith(res.status, 402);
      sinon.assert.calledWith(res.set, 'Pay', 'https://payment.example.com');
      
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal('payment_required');
      expect(response.paymentUrl).to.equal('https://payment.example.com');
      
      sinon.assert.calledOnce(CoinbaseService.generatePaymentUrl);
      sinon.assert.calledWith(
        CoinbaseService.generatePaymentUrl,
        'test-user-123',
        'test-message-123'
      );
    });
    
    it('should validate payment proof if provided in headers', async () => {
      // Arrange
      const paymentProof = 'test-payment-proof';
      req.headers['pay-proof'] = paymentProof;
      
      const paymentInfo = {
        ...TEST_PAYMENT,
        status: 'paid',
        proof: paymentProof,
        validUntil: Date.now() + 3600000 // 1 hour from now
      };
      
      CoinbaseService.validateUserPayment.resolves(paymentInfo);
      
      // Act
      await requirePayment(req, res, next);
      
      // Assert
      sinon.assert.calledOnce(CoinbaseService.validateUserPayment);
      sinon.assert.calledWith(
        CoinbaseService.validateUserPayment,
        'test-user-123',
        paymentProof
      );
      
      sinon.assert.calledOnce(next);
      sinon.assert.calledWith(sessionStore.updatePaymentInfo, 'test-user-123', paymentInfo);
    });
    
    it('should return 402 for invalid payment proof', async () => {
      // Arrange
      const invalidProof = 'invalid-proof';
      req.headers['pay-proof'] = invalidProof;
      
      CoinbaseService.validateUserPayment.resolves({
        ...TEST_PAYMENT,
        status: 'failed',
        error: 'Invalid proof'
      });
      
      // Act
      await requirePayment(req, res, next);
      
      // Assert
      sinon.assert.calledWith(res.status, 402);
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal('payment_invalid');
      expect(response.message).to.include('Invalid or expired payment proof');
      
      sinon.assert.calledWith(
        CoinbaseService.validateUserPayment,
        'test-user-123',
        invalidProof
      );
    });
    
    it('should handle session store errors', async () => {
      // Arrange
      const error = new Error('Session store error');
      sessionStore.getPaymentInfo.throws(error);
      
      // Act
      await requirePayment(req, res, next);
      
      // Assert
      expect(res.status.calledWith(500)).to.be.true;
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal('error');
      expect(response.message).to.include('An error occurred while processing your payment');
      
      expect(logger.error.calledOnce).to.be.true;
      expect(logger.error.firstCall.args[0]).to.include('Error in payment middleware');
    });
  });
});
