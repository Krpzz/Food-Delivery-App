const { test, describe, before } = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');

before(() => {
  process.env.ESEWA_MERCHANT_CODE = 'EPAYTEST';
  process.env.ESEWA_SECRET_KEY = '8gBm/:&EnhH.1/q';
  process.env.ESEWA_BASE_URL = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
  process.env.ESEWA_STATUS_CHECK_URL = 'https://uat.esewa.com.np/api/epay/transaction/status/';
});

const esewaService = require('../../services/esewaService');

describe('esewaService', () => {
  test('buildPaymentPayload reads product_code and formUrl from environment variables', () => {
    const payload = esewaService.buildPaymentPayload({
      amount: 656,
      taxAmount: 85,
      serviceCharge: 13,
      deliveryCharge: 60,
      totalAmount: 814,
      transactionUuid: 'ORD-TEST-ABCD1234',
      successUrl: 'http://localhost:5173/payment/esewa/success',
      failureUrl: 'http://localhost:5173/payment/esewa/failure',
    });

    assert.strictEqual(payload.formUrl, 'https://rc-epay.esewa.com.np/api/epay/main/v2/form');
    assert.strictEqual(payload.fields.product_code, 'EPAYTEST');
    assert.strictEqual(payload.fields.signed_field_names, 'total_amount,transaction_uuid,product_code');
  });

  test('total_amount always equals amount + tax_amount + service_charge + delivery_charge, as eSewa requires', () => {
    const payload = esewaService.buildPaymentPayload({
      amount: 656,
      taxAmount: 85,
      serviceCharge: 13,
      deliveryCharge: 60,
      totalAmount: 814,
      transactionUuid: 'ORD-TEST-ABCD1234',
      successUrl: 'http://localhost:5173/payment/esewa/success',
      failureUrl: 'http://localhost:5173/payment/esewa/failure',
    });

    const sum =
      Number(payload.fields.amount) +
      Number(payload.fields.tax_amount) +
      Number(payload.fields.product_service_charge) +
      Number(payload.fields.product_delivery_charge);
    assert.strictEqual(sum, Number(payload.fields.total_amount));
  });

  test('a correctly-signed callback response verifies as authentic', () => {
    const response = {
      status: 'COMPLETE',
      transaction_code: '0004T5I',
      total_amount: 814,
      transaction_uuid: 'ORD-TEST-ABCD1234',
      product_code: 'EPAYTEST',
      signed_field_names: 'transaction_code,status,total_amount,transaction_uuid,product_code,signed_field_names',
    };
    const message = response.signed_field_names
      .split(',')
      .map((name) => `${name}=${response[name]}`)
      .join(',');
    response.signature = crypto.createHmac('sha256', process.env.ESEWA_SECRET_KEY).update(message).digest('base64');

    assert.strictEqual(esewaService.verifyResponseSignature(response), true);
  });

  test('tampering with a signed field after signing is caught by verification', () => {
    const response = {
      status: 'COMPLETE',
      transaction_code: '0004T5I',
      total_amount: 814,
      transaction_uuid: 'ORD-TEST-ABCD1234',
      product_code: 'EPAYTEST',
      signed_field_names: 'transaction_code,status,total_amount,transaction_uuid,product_code,signed_field_names',
    };
    const message = response.signed_field_names
      .split(',')
      .map((name) => `${name}=${response[name]}`)
      .join(',');
    response.signature = crypto.createHmac('sha256', process.env.ESEWA_SECRET_KEY).update(message).digest('base64');

    const tampered = { ...response, total_amount: 999999 };
    assert.strictEqual(esewaService.verifyResponseSignature(tampered), false);
  });

  test('decodeCallbackData round-trips base64 -> JSON correctly', () => {
    const original = { status: 'COMPLETE', transaction_uuid: 'ORD-TEST-ABCD1234' };
    const encoded = Buffer.from(JSON.stringify(original)).toString('base64');
    const decoded = esewaService.decodeCallbackData(encoded);
    assert.deepStrictEqual(decoded, original);
  });
});
