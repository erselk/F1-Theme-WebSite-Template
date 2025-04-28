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

    // Log the error response for debugging
    console.error("Payment error response received", responseData);

    // Get the hash and hashparams from the response for validation
    const responseHash = responseData.hash;
    const responseHashparams = responseData.hashparams;

    // Validate hash if available to ensure response is from Garanti
    if (responseHash && responseHashparams) {
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
        console.error("Invalid hash in error response, possible tampering");
        return redirect("/payment/failed?reason=invalid_hash");
      }
    }
    
    // Extract error information
    const errorMsg = responseData.errmsg || responseData.mderrormessage || "Unknown error";
    const errorCode = responseData.procreturncode || "unknown";
    const mdStatus = responseData.mdstatus || "unknown";
    const orderId = responseData.orderid || "";
    
    // Update database with the failed payment information
    // await db.updatePaymentStatus(orderId, "failed", { errorMsg, errorCode, mdStatus });
    
    // Redirect to error page with informative error message
    return redirect(`/payment/failed?reason=${encodeURIComponent(errorMsg)}&code=${errorCode}`);
  } catch (error) {
    console.error("Error processing payment error response:", error);
    return redirect("/payment/failed?reason=processing_error");
  }
}