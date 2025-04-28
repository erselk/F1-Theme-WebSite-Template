import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const paymentData = await req.json();
    const {
      orderId,
      amount,
      fullName,
      email,
      phone,
      eventId,
      eventTitle,
      tickets,
      locale
    } = paymentData;

    // Validate required fields
    if (!orderId || !amount || !fullName || !email || !eventId) {
      return NextResponse.json(
        { error: "Missing required payment information" },
        { status: 400 }
      );
    }

    // Get customer's IP address
    const customerIp = req.headers.get('x-forwarded-for') || 
                      req.headers.get('x-real-ip') || 
                      '127.0.0.1';

    // Garanti payment gateway parameters
    const terminalId = "30691297";
    const merchantId = "7000679";
    const storeKey = "12345678"; // This should be stored in environment variables in production
    const provisionPassword = "123qweASD/"; // This should be stored in environment variables in production

    // Construct URLs for success and error cases
    const successUrl = `${req.headers.get('origin')}/api/payment/success`;
    const errorUrl = `${req.headers.get('origin')}/api/payment/error`;

    // Transaction details
    const installmentCount = ""; // No installment
    const currencyCode = "949"; // TRY (Turkish Lira)
    const txnType = "sales";
    
    // Convert amount to the format expected by the bank (without decimal point)
    const amountValue = parseInt(amount.toString());

    // Calculate hashedPassword using SHA1 as per Garanti documentation
    // hashedPassword = SHA1(provisionPassword + "0" + terminalId)
    const hashedPassword = crypto
      .createHash("sha1")
      .update(provisionPassword + "0" + terminalId)
      .digest("hex")
      .toUpperCase();
      
    // Create hash string for secure3dhash according to Garanti's format
    // SHA512(terminalId + orderId + amount + currencyCode + successUrl + errorUrl + type + installmentCount + storeKey + hashedPassword)
    const hashStr = terminalId + 
                    orderId + 
                    amountValue + 
                    currencyCode + 
                    successUrl + 
                    errorUrl + 
                    txnType + 
                    installmentCount + 
                    storeKey + 
                    hashedPassword;

    // Calculate SHA512 hash for secure3dhash
    const secure3dhash = crypto
      .createHash("sha512")
      .update(hashStr)
      .digest("hex")
      .toUpperCase();

    // Save payment information to database (optional)
    // This would typically include saving the order details, customer info, and payment status
    // await db.savePaymentInfo({ orderId, amount, fullName, email, phone, eventId, eventTitle, tickets });

    // Return the secure hash to the client
    return NextResponse.json({
      secure3dhash,
      orderId,
      status: "success"
    });
  } catch (error) {
    console.error("Payment initiation error:", error);
    
    return NextResponse.json(
      { error: "An error occurred while initiating payment" },
      { status: 500 }
    );
  }
}