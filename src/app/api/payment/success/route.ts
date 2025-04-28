import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { redirect } from "next/navigation";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Convert formData to a regular object for easier handling
    const responseData: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      responseData[key] = value;
    }

    // Get the hash and hashparams from the response
    const responseHash = responseData.hash;
    const responseHashparams = responseData.hashparams;

    if (!responseHash || !responseHashparams) {
      console.error("Missing hash or hashparams in response");
      return redirect("/payment/failed?reason=invalid_response");
    }

    // Store key for validation (should be in environment variables in production)
    const storeKey = "12345678";
    
    // Create digest data from the hashparams list
    let digestData = "";
    const paramList = responseHashparams.split(":");
    
    for (const param of paramList) {
      digestData += responseData[param] || "";
    }
    
    // Add store key to digest data
    digestData += storeKey;
    
    // Calculate the SHA512 hash
    const calculatedHash = crypto
      .createHash("sha512")
      .update(digestData, "utf8")
      .digest("hex")
      .toUpperCase();
    
    // Validate that the response is from Garanti
    const isValidHash = responseHash === calculatedHash;
    
    if (!isValidHash) {
      console.error("Invalid hash, response may be tampered");
      return redirect("/payment/failed?reason=invalid_hash");
    }
    
    // Check if payment was successful - Only "00" response is considered successful
    const procreturncode = responseData.procreturncode;
    const mdStatus = responseData.mdstatus;
    
    // Check if transaction is successful based on response and mdStatus
    const isSuccess = procreturncode === "00";
    
    if (isSuccess) {
      // Save transaction details to database
      // This would include order ID, transaction details, etc.
      // await db.updatePaymentStatus(responseData.orderid, "success", responseData);
      
      // Extract important information
      const orderId = responseData.orderid;
      const amount = responseData.txnamount / 100; // Convert back from cents
      
      // Redirect to a success page with relevant information
      return redirect(`/payment/success?orderId=${orderId}&amount=${amount}`);
    } else {
      // Log error details
      console.error("Payment failed", {
        procreturncode,
        mdStatus,
        errorMessage: responseData.errmsg || responseData.mderrormessage || "Unknown error"
      });
      
      // Redirect to error page with error message
      return redirect(`/payment/failed?reason=${responseData.errmsg || "payment_rejected"}`);
    }
  } catch (error) {
    console.error("Error processing payment response:", error);
    return redirect("/payment/failed?reason=processing_error");
  }
}