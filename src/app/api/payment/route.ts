import { NextResponse } from 'next/server';
import Iyzipay from 'iyzipay';

// Initialize Iyzipay with configuration
const iyzipay = new Iyzipay({
  apiKey: process.env.IYZIPAY_API_KEY || 'your_api_key',
  secretKey: process.env.IYZIPAY_SECRET_KEY || 'your_secret_key',
  uri: process.env.NODE_ENV === 'production' 
    ? 'https://api.iyzipay.com' 
    : 'https://sandbox-api.iyzipay.com'
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      ticketInfo, 
      userInfo,
      eventInfo,
      locale = 'tr'
    } = body;

    if (!ticketInfo || !userInfo || !eventInfo) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }

    // Create a unique payment conversation ID
    const conversationId = `padok_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // Calculate the total price
    const totalPrice = ticketInfo.quantity * ticketInfo.price;
    
    // Format price for Iyzipay (requires string with 2 decimal places)
    const formattedPrice = totalPrice.toFixed(2);
    
    // Create payment request
    const request = {
      locale: locale === 'en' ? Iyzipay.LOCALE.EN : Iyzipay.LOCALE.TR,
      conversationId: conversationId,
      price: formattedPrice,
      paidPrice: formattedPrice,
      currency: Iyzipay.CURRENCY.TRY,
      basketId: `basket_${eventInfo.id}_${Date.now()}`,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/payment/callback`,
      
      buyer: {
        id: userInfo.id || `guest_${Date.now()}`,
        name: userInfo.firstName,
        surname: userInfo.lastName,
        gsmNumber: userInfo.phone,
        email: userInfo.email,
        identityNumber: userInfo.identityNumber || '11111111111', // Required for Turkish regulations
        registrationAddress: userInfo.address,
        ip: userInfo.ip || request.ip || '127.0.0.1',
        city: userInfo.city,
        country: userInfo.country || 'Turkey',
        zipCode: userInfo.zipCode || '34000'
      },
      
      shippingAddress: {
        contactName: `${userInfo.firstName} ${userInfo.lastName}`,
        city: userInfo.city,
        country: userInfo.country || 'Turkey',
        address: userInfo.address,
        zipCode: userInfo.zipCode || '34000'
      },
      
      billingAddress: {
        contactName: `${userInfo.firstName} ${userInfo.lastName}`,
        city: userInfo.city,
        country: userInfo.country || 'Turkey',
        address: userInfo.address,
        zipCode: userInfo.zipCode || '34000'
      },
      
      basketItems: [
        {
          id: ticketInfo.id,
          name: `${eventInfo.title} - ${ticketInfo.type}`,
          category1: 'Etkinlik Bileti',
          category2: eventInfo.category,
          itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
          price: (ticketInfo.price * ticketInfo.quantity).toFixed(2)
        }
      ]
    };

    // Create a new checkout form for redirect
    return new Promise((resolve) => {
      iyzipay.checkoutFormInitialize.create(request, function (err, result) {
        if (err) {
          console.error('Iyzipay error:', err);
          resolve(NextResponse.json(
            { error: 'Payment initialization failed', details: err },
            { status: 500 }
          ));
        } else {
          // Return the checkout form content and payment page URL
          resolve(NextResponse.json({
            status: result.status,
            token: result.token,
            checkoutFormContent: result.checkoutFormContent,
            paymentPageUrl: result.paymentPageUrl
          }));
        }
      });
    });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing payment' },
      { status: 500 }
    );
  }
}