const crypto = require('crypto');

const FORM_URL = process.env.ESEWA_BASE_URL;
const STATUS_CHECK_URL = process.env.ESEWA_STATUS_CHECK_URL;

const sign = (message) => crypto.createHmac('sha256', process.env.ESEWA_SECRET_KEY).update(message).digest('base64');

const buildSignedMessage = (fields, signedFieldNames) =>
  signedFieldNames.map((name) => `${name}=${fields[name]}`).join(',');

const buildPaymentPayload = ({
  amount,
  taxAmount,
  serviceCharge,
  deliveryCharge,
  totalAmount,
  transactionUuid,
  successUrl,
  failureUrl,
}) => {
  const signedFieldNames = ['total_amount', 'transaction_uuid', 'product_code'];

  const fields = {
    amount: String(amount),
    tax_amount: String(taxAmount),
    total_amount: String(totalAmount),
    transaction_uuid: transactionUuid,
    product_code: process.env.ESEWA_MERCHANT_CODE,
    product_service_charge: String(serviceCharge),
    product_delivery_charge: String(deliveryCharge),
    success_url: successUrl,
    failure_url: failureUrl,
  };

  const signature = sign(buildSignedMessage(fields, signedFieldNames));

  return {
    formUrl: FORM_URL,
    fields: {
      ...fields,
      signed_field_names: signedFieldNames.join(','),
      signature,
    },
  };
};

const decodeCallbackData = (base64Data) => JSON.parse(Buffer.from(base64Data, 'base64').toString('utf-8'));

const verifyResponseSignature = (decoded) => {
  const signedFieldNames = decoded.signed_field_names.split(',');
  const expected = sign(buildSignedMessage(decoded, signedFieldNames));
  return expected === decoded.signature;
};

const checkTransactionStatus = async ({ productCode, totalAmount, transactionUuid }) => {
  const url = `${STATUS_CHECK_URL}?product_code=${encodeURIComponent(productCode)}&total_amount=${encodeURIComponent(totalAmount)}&transaction_uuid=${encodeURIComponent(transactionUuid)}`;
  const response = await fetch(url);
  if (!response.ok) {
    const err = new Error('Could not reach eSewa to verify this payment');
    err.statusCode = 502;
    throw err;
  }
  return response.json();
};

module.exports = {
  buildPaymentPayload,
  decodeCallbackData,
  verifyResponseSignature,
  checkTransactionStatus,
};