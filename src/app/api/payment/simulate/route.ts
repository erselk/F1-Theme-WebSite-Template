import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Get payment data from the request
    const paymentData = await req.json();
    
    // We're just returning a simple response with a script to show the alert
    // In a real implementation, this would process the payment with a provider
    
    // Create a simple HTML page with JavaScript to show the alert
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ödeme Simülasyonu | Payment Simulation</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              background-color: #f9f9f9;
              margin: 0;
              padding: 20px;
              text-align: center;
            }
            .container {
              max-width: 500px;
              padding: 30px;
              background-color: white;
              border-radius: 10px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }
            h1 {
              color: #333;
              margin-bottom: 20px;
            }
            .buttons {
              display: flex;
              justify-content: center;
              gap: 12px;
              margin-top: 30px;
            }
            button {
              padding: 12px 24px;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-weight: bold;
              transition: background-color 0.2s;
            }
            .confirm {
              background-color: #4caf50;
              color: white;
            }
            .confirm:hover {
              background-color: #45a049;
            }
            .cancel {
              background-color: #f44336;
              color: white;
            }
            .cancel:hover {
              background-color: #d32f2f;
            }
            .details {
              background-color: #f5f5f5;
              padding: 15px;
              border-radius: 5px;
              margin-top: 20px;
              text-align: left;
            }
            .details p {
              margin: 5px 0;
              display: flex;
              justify-content: space-between;
            }
            .total {
              font-weight: bold;
              margin-top: 10px;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Ödeme Onayı / Payment Confirmation</h1>
            <p>Bu bir ödeme simülasyon ekranıdır. Gerçek bir ödeme işlemi gerçekleştirilmeyecektir.</p>
            <p>This is a payment simulation screen. No actual payment will be processed.</p>
            
            <div class="details">
              <p><span>Sipariş ID:</span> <span>${paymentData.orderId || "ORDER-"+Date.now()}</span></p>
              <p><span>Ödeme Tutarı:</span> <span>${(paymentData.amount/100).toFixed(2)} TL</span></p>
              <p class="total"><span>Toplam:</span> <span>${(paymentData.amount/100).toFixed(2)} TL</span></p>
            </div>
            
            <div class="buttons">
              <button class="confirm" onclick="confirmPayment()">Onayla / Confirm</button>
              <button class="cancel" onclick="cancelPayment()">Reddet / Cancel</button>
            </div>
          </div>

          <script>
            function confirmPayment() {
              // In a real implementation, this would process the payment
              // Here we just show an alert and redirect back
              alert('Ödeme onaylandı! / Payment confirmed!');
              window.opener && window.opener.postMessage({ status: 'success', orderId: '${paymentData.orderId || "ORDER-"+Date.now()}' }, '*');
              // Close this window/redirect back
              setTimeout(() => {
                if (window.opener) window.close();
                else window.location.href = '/events';
              }, 500);
            }

            function cancelPayment() {
              // Inform the parent window and close
              alert('Ödeme reddedildi! / Payment rejected!');
              window.opener && window.opener.postMessage({ status: 'cancelled', message: 'Payment was rejected' }, '*');
              // Close this window/redirect back
              setTimeout(() => {
                if (window.opener) window.close();
                else window.location.href = '/events';
              }, 500);
            }
          </script>
        </body>
      </html>
    `;

    // Return HTML response
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Ödeme simülasyonu hatası' },
      { status: 500 }
    );
  }
}