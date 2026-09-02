const crypto = require('crypto');

const generateEsewaSignature = (
    totalAmount,
    transactionUuid,
    productCode
) => {
    const message =
        `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;

    return crypto
        .createHmac(
            "sha256",
            process.env.ESEWA_SECRET_KEY
        )
        .update(message)
        .digest("base64");
};

const esewaSuccess = async (req, res) => {
    try {
        console.log("eSewa success response:", req.body);

        res.json({
            message: "eSewa payment successful",
            data: req.body
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const esewaFailure = async (req, res) => {
    try {
        console.log("eSewa payment failed:", req.body);

        res.json({
            message: "eSewa payment failed",
            data: req.body
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const initiateEsewaPayment = async (req, res) => {
    try {
        const { amount } = req.body;

        const transactionUuid =
            `BITE24-${Date.now()}`;

        const productCode =
            process.env.ESEWA_MERCHANT_CODE;

        const totalAmount = Number(amount);

        const signature =
            generateEsewaSignature(
                totalAmount,
                transactionUuid,
                productCode
            );

        res.json({
            amount: totalAmount,
            tax_amount: 0,
            total_amount: totalAmount,

            transaction_uuid: transactionUuid,

            product_code: productCode,

            product_service_charge: 0,
            product_delivery_charge: 0,

            signed_field_names:
                "total_amount,transaction_uuid,product_code",

            signature,

            success_url:
                "http://localhost:5000/api/payment/esewa/success",

            failure_url:
                "http://localhost:5000/api/payment/esewa/failure"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    esewaSuccess,
    esewaFailure,
    initiateEsewaPayment
};