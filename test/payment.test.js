// Test dependencies
const { expect } = require('chai');
const sinon = require('sinon');

// Import the actual modules
const { coinbaseService } = require('../src/backend/services/coinbase-service.js');
const { sessionStore } = require('../src/backend/services/session-store.js');
const { PaymentController } = require('../src/backend/controllers/payment-controller.js');

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
  });

  describe('verifyPayment', () => {
    it('should return 400 if no proof is provided', async () => {
      await PaymentController.verifyPayment(req, res);
      
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal('error');
      expect(response.error).to.equal('Payment proof is required');
    });

    it('should return 402 for invalid proof', async () => {
      req.body = { proof: 'invalid-proof' };
      sandbox.stub(coinbaseService, 'validateUserPayment').resolves(false);
      
      await PaymentController.verifyPayment(req, res);
      
      expect(res.status.calledWith(402)).to.be.true;
      expect(coinbaseService.validateUserPayment.calledOnce).to.be.true;
      
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
      sandbox.stub(coinbaseService, 'validateUserPayment').resolves(true);
      sessionStore.updatePaymentInfo('test-user-123', {
        ...testPaymentInfo,
        proof: 'valid-proof'
      });
      
      await PaymentController.verifyPayment(req, res);
      
      expect(res.status.called).to.be.false; // Default status is 200
      expect(res.json.calledOnce).to.be.true;
      
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal('success');
      expect(response.paymentId).to.equal(testPaymentInfo.invoiceId);
      expect(response.amount).to.equal(testPaymentInfo.amount);
      expect(response.asset).to.equal(testPaymentInfo.asset);
    });
  });

  describe('checkPaymentStatus', () => {
    it('should return 400 if no user ID is provided', () => {
      // Clear user ID without using delete
      req.session = {};
      
      PaymentController.checkPaymentStatus(req, res);
      
      expect(res.status.calledWith(400)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal('error');
      expect(response.error).to.equal('User ID is required');
    });

    it('should return 404 if no payment info exists', () => {
      PaymentController.checkPaymentStatus(req, res);
      
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.json.calledOnce).to.be.true;
      
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal('not_found');
      expect(response.message).to.equal('No payment information found for this user');
    });

    it('should return payment status if payment info exists', () => {
      const testPaymentInfo = {
        invoiceId: 'test-invoice-123',
        amount: '0.01',
        asset: 'usdc',
        status: 'paid',
        paidAt: new Date().toISOString(),
        proof: 'test-proof',
        updatedAt: new Date().toISOString()
      };
      
      sessionStore.updatePaymentInfo('test-user-123', testPaymentInfo);
      
      PaymentController.checkPaymentStatus(req, res);
      
      expect(res.status.called).to.be.false; // Default status is 200
      expect(res.json.calledOnce).to.be.true;
      
      const response = res.json.getCall(0).args[0];
      expect(response.status).to.equal('success');
      expect(response.payment.status).to.equal('paid');
      expect(response.payment.invoiceId).to.equal(testPaymentInfo.invoiceId);
      expect(response.payment.amount).to.equal(testPaymentInfo.amount);
      expect(response.payment.asset).to.equal(testPaymentInfo.asset);
      expect(response.payment.paidAt).to.equal(testPaymentInfo.paidAt);
      expect(response.payment.proof).to.equal('***REDACTED***');
      expect(response.metadata.userId).to.equal('test-user-123');
    });
  });
});
