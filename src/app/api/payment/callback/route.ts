import { NextResponse, NextRequest } from 'next/server';
import Iyzipay from 'iyzipay';
import { redirect } from 'next/navigation';

// Use a conditional to delay Iyzipay initialization until runtime
// This prevents build-time errors with resource paths
const getIyzipay = () => {
  return new Iyzipay({
    apiKey: process.env.IYZIPAY_API_KEY || 'your_api_key',
    secretKey: process.env.IYZIPAY_SECRET_KEY || 'your_secret_key',
    uri: process.env.NODE_ENV === 'production' 
      ? 'https://api.iyzipay.com' 
      : 'https://sandbox-api.iyzipay.com'
  });
};

export async function POST(request: NextRequest) {
  try {
    // Get form data from the request
    const formData = await request.formData();
    const token = formData.get('token') as string;
    
    if (!token) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/error?message=Invalid_token`
      );
    }

    // Get Iyzipay instance at runtime
    const iyzipay = getIyzipay();

    // Create request object for retrieving payment result
    const retrieveRequest = {
      locale: 'tr',
      conversationId: `retrieve_${Date.now()}`,
      token: token
    };

    // Retrieve payment result from Iyzipay
    return new Promise((resolve) => {
      iyzipay.checkoutForm.retrieve(retrieveRequest, function (err, result) {
        if (err) {
          console.error('Iyzipay retrieval error:', err);
          resolve(NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/error?message=Retrieval_failed`
          ));
        } else {
          // Check if payment was successful
          if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
            // Extract payment details
            const paymentId = result.paymentId;
            const paymentAmount = result.paidPrice;
            const currency = result.currency;
            const basketId = result.basketId;

            // Here you would typically:
            // 1. Save the payment information to your database
            // 2. Update order/ticket status to completed
            // 3. Send confirmation email to the user

            // Redirect to success page with transaction details
            resolve(NextResponse.redirect(
              `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success?paymentId=${paymentId}&amount=${paymentAmount}&currency=${currency}&basketId=${basketId}`
            ));
          } else {
            // Payment failed or was declined
            const errorMessage = result.errorMessage || 'Payment_declined';
            const errorCode = result.errorCode || '0';
            
            resolve(NextResponse.redirect(
              `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/error?message=${errorMessage}&code=${errorCode}`
            ));
          }
        }
      });
    });
  } catch (error) {
    console.error('Callback processing error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/error?message=Server_error`
    );
  }
}