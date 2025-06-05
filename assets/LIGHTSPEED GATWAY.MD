callbacks v1.md
 2024-10-19
 LightSpeedPay Payment Gateway API Callback
 Documentation
 This documentation provides an overview of the callback structure and status flow for transactions. The
 callbacks are triggered at various stages during the lifecycle of a transaction, from initiation to completion
 or failure. Developers can use this guide to handle transaction events and integrate them into their
 systems.
 Table of Contents
 1. Overview
 2. Transaction Statuses
 INITIATE
 IN PROGRESS
 FAILED / COMPLETED
 3. Callback Structure
 Fields
 Example Payloads
 4. Callback Flow
 5. Handling Callbacks
 Overview
 The Payment Gateway API provides a callback mechanism that notifies merchants when the status of a
 transaction changes. These callbacks contain essential details of the transaction, such as the transaction ID,
 amount, status, and method.
 Callbacks occur at key points:
 1. When the transaction is initiated.
 2. When the user opens the payment page.
 3. When the transaction is either successful (COMPLETED) or unsuccessful (FAILED).
 Transaction Statuses
 Each transaction passes through different stages, and the status reflects the current phase of the
 transaction.
 1. INITIATE:
 This status indicates that the transaction has been initiated but not yet processed. No payment method has
 been selected, and the transaction has not yet been directed to the payment page.
 1 / 5
 2. IN PROGRESS:
callbacks v1.md 2024-10-19
 2 / 5
 Once the payment page is opened, the transaction moves to an "in progress" state. This status indicates
 that the user is on the payment page and has the option to complete or cancel the transaction.
 3. FAILED / COMPLETED:
 After the payment is processed, the transaction moves to either a FAILED or COMPLETED state.
 FAILED: The transaction could not be completed due to insufficient funds, a canceled operation, or
 an error.
 COMPLETED: The transaction was successfully processed, and payment has been received.
 Callback Structure
 The API sends transaction details via a POST request in JSON format to the merchant's callback URL. Below
 is the structure and a detailed explanation of the fields present in the callback payload.
 Fields
 Field Type Description
 transactionId String Unique identifier for the transaction.
 billId String Unique identifier for the bill or invoice.
 status String Current status of the transaction (INITIATE, REQUESTED(Qr),
 FAILED, COMPLETED).
 customerName String (Optional) Name of the customer, if provided.
 merchant_id String ID of the merchant involved in the transaction.
 method String Payment method used (e.g., QR Shared, unknown).
 description String (Optional) Description of the transaction.
 amount Number Total amount for the transaction.
 vpaId String Virtual Payment Address (VPA), if applicable.
 psp String Payment service provider responsible for the transaction.
 isVerified Boolean Whether the transaction is verified (for initiate status).
 reason String (Optional) Reason for failure, if the transaction failed.
 apiKeyUsed String API key used to initiate the transaction.
 fees Number Fees applicable to the transaction.
 createdAt String Timestamp of when the transaction was initiated.
 updatedAt String Timestamp of the last update to the transaction.
 paymentTime String (Optional) Time of successful payment (for completed status).
callbacks v1.md
 2024-10-19
 Example Payloads
 1. Initiate Transaction
 When a transaction is initiated, the system sends the following payload:
 { 
} 
"customerName": "recharge for 8986194738", 
"merchant_id": "6687b019834e7c9b318e8683", 
"status": "initiate", 
"method": "unknown", 
"description": "Recharge", 
"amount": 11, 
"billId": "ABC123456789", 
"vpaId": "-", 
"psp": "Others", 
"isVerified": false, 
"apiKeyUsed": "2247bbb4-3995-424b-ba45-08162191181d", 
"fees": 0, 
"createdAt": "2024-10-19T05:56:33.828Z", 
"updatedAt": "2024-10-19T05:56:33.828Z" 
2. In Progress (Payment Page Opened)
 When the user opens the payment page, the following payload is sent:
 { 
} 
"transactionId": "67134a113deac68758a5998b", 
"billId": "ABC123456789", 
"status": "REQUESTED(Qr)", 
"psp": "Others", 
"amount": 11, 
"method": "QR Shared" 
3. Failed Transaction
 In the event of a failed transaction, this payload is sent:
 { 
"transactionId": "67134a113deac68758a5998b", 
"status": "FAILED", 
"vpaId": "-", 
"psp": "Others", 
"amount": 11, 
3 / 5
callbacks v1.md
 "billId": "ABC123456789" 
} 
4. Completed Transaction
 When a transaction is successfully completed, the following payload is sent:
 { 
} 
"transactionId": "67134a113deac68758a5998b", 
"status": "COMPLETED", 
"vpaId": "-", 
"psp": "Others", 
"amount": 11, 
"billId": "ABC123456789", 
"paymentTime": "2024-10-19T12:45:30Z" 
Callback Flow
 1. Transaction Initiation:
 2024-10-19
 The transaction is initiated when the customer starts the process, but no payment details are
 provided at this stage.
 Status: INITIATE.
 2. Payment Page Opened:
 Once the user opens the payment page to proceed with the transaction, the status changes to
 "in progress."
 Status: REQUESTED(Qr).
 3. Transaction Completion:
 After the user completes the payment, the status will either change to COMPLETED for a
 successful payment or FAILED if the payment was not successful.
 Handling Callbacks
 To handle the callbacks properly, follow these steps:
 1. Set up a Callback Endpoint:
 Create an endpoint on your server that can receive HTTP POST requests.
 Ensure that your endpoint processes incoming JSON payloads.
 2. Verify Transaction Status:
 4 / 5
callbacks v1.md
 2024-10-19
 Each callback payload contains a status field. Use this to determine the current state of the
 transaction (INITIATE, REQUESTED(Qr), FAILED, COMPLETED).
 3. Update Merchant's System:
 Based on the transaction status, update your system records:
 For INITIATE, start a new transaction entry.
 For REQUESTED(Qr), mark the transaction as in progress.
 For FAILED, mark the transaction as failed and handle any user notifications or retries.
 For COMPLETED, mark the transaction as successful and finalize any order or service.
 4. Error Handling:
 In case of failure to process the callback, log the error and attempt to retry processing.
 Use the reason field (if present) for debugging in the case of failed transactions.
 5. Security Considerations:
 Always verify the source of the callback by checking the apiKeyUsed or using a signature
 validation method.
 Ensure the callback payload is securely transmitted (via HTTPS) to prevent tampering.
 Conclusion
 The Payment Gateway API uses a reliable callback system to notify merchants of transaction status
 changes. Merchants and developers should handle these callbacks carefully to ensure proper tracking of
 transactions and a seamless customer experience.
 5 / 5

 �
�LightspeedPay Payment Gateway API 
Integration Guide 
This document contains step-by-step instructions and API specifications to integrate with the 
LightspeedPay payment gateway. 
�
�Authentication 
All API calls must be authenticated using: 
●  apiKey 
●  apiSecret 
Ensure these are passed in every relevant request. 
�
�Step 1: Initiate Transaction 
Endpoint: 
POST 
https://api.lightspeedpay.in/api/v1/transaction/initiate-transaction 
Request Payload 
{ 
"vpaId": " 6355962752@payu.in ", 
"amount": 4.00, 
"method": "Qr", 
"apiKey": "c8922232-f6e2-4936-90ac-678186124c4f", 
"billId": "P2503181820238497785", 
"description": "Payment for Order 
#P2503181820238497785", "apiSecret": 
"ijSAMbKn9DEeuLbEZIaufgQZemakFtJJ", "type": "live", 
"customerName": "Alice", 
"status": "success" 
} 
Response Example 
{ 
"status": "success", 
"code": 200, 
"message": "Transaction initiated", 
"data": { 
"_id": "6830111b65f098d2e02ffd26", 
"billId": "P25031818202384971211", 
"paymentOperator": "icici", 
"amount": 1, 
"status": "initiate", 
"customerName": "Alice1211" 
}, 
"paymentLink": 
"https://pay.lightspeedpay.in/payment.php?txn=6830111b65f098d2e02ffd26&key=c8922232-f6e 
2-4936-90ac-678186124c4f&secret=ijSAMbKn9DEeuLbEZIaufgQZemakFtJJ" 
} 
�
�Step 2: Seamless Transaction Request 
This allows you to generate UPI links for  QR-based  or  VPA intent-based  payments. 
Endpoint: 
POST 
https://api.lightspeedpay.in/api/v1/transaction/request-transaction/ 
A)  QR/App Flow 
Request 
{ 
} 
"transactionId": "6830111b65f098d2e02ffd26", 
"method": "qr", 
"app": "Others" 
Response 
{ 
"status": "success", 
"result": { 
"status": "success", 
"upiString": "upi://pay?pa=dagazinfotech.esbz@icici&pn=DAGAZ 
INFOTECH&tr=EZV...&am=1.00&cu=INR&tn=Pay" 
} 
} 
B)  UPI Intent (Direct Pay via UPI App) 
Request 
{ 
} 
"transactionId": "6830123065f098d2e02ffe0b", 
"method": "vpa", 
"app": "Others", 
"vpa": "vpa/upiId" 
Response 
{ 
} 
"status": "success", 
"result": { 
"status": "success" 
} 
�
�Step 3: Check Transaction Status 
Endpoint: 
GET 
https://api.lightspeedpay.in/api/v1/transaction/redirect/status-of-tra 
nsaction/{txn_id}?apiKey={api_key}&apiSecret={api_secret} 
Example: 
GET 
https://api.lightspeedpay.in/api/v1/transaction/redirect/status-of-transaction/6830111b65f098d2e 
02ffd26?apiKey=c8922232-f6e2-4936-90ac-678186124c4f&apiSecret=ijSAMbKn9DEeuLbEZIa 
ufgQZemakFtJJ 
Response 
{ 
} 
"status": "success", 
"code": 200, 
"message": "Redirect URL fetched successfully", 
"data": { 
"customerName": "Alice1211", 
"status": "REQUESTED(Qr)", 
"amount": 1, 
"vpaId": "-", 
"paymentMethod": "vpa" 
} 
Status Notes: 
●  ✅
  COMPLETED  : Payment success → Redirect to  Success  Page 
●  ❌
  FAILED  : Payment failed → Redirect to  Failure Page 
�
�Step 4: Get Single Transaction Details 
Endpoint: 
GET 
https://api.lightspeedpay.in/api/v1/transaction/get-single-transaction 
/{transactionId} 
Example 
GET 
https://api.lightspeedpay.in/api/v1/transaction/get-single-transaction/6830123065f098d2e02ffe0b 
Response 
{ 
"status": "success", 
"result": { 
"_id": "6830123065f098d2e02ffe0b", 
"customerName": "Alice1211", 
"merchant_id": "67a5d07f68c7dbcbb66566be", 
"status": "initiate", 
"method": "unknown", 
"description": "Payment for Order #P2503181820238497784", 
"amount": 1, 
"paymentOperator": "icici", "createdAt": 
"2025-05-23T06:14:08.682Z", 
"merchantDetails": { 
"name": "Dagaz", 
"email": " dagazinfotech@gmail.com ", 
"company": "Dagaz Infotech (OPC) Private Limited" 
} 
} 
} 
�
�Tips for Integration 
●  Always validate response status before proceeding to next step. 
●  Save transaction IDs for status checks. 

api v3.md
 2024-09-20
 API Documentation for Merchant Integration
 Welcome to the LightSpeedPay API integration guide, designed to enable seamless payment processing
 on your e-commerce platform. This documentation provides detailed information on the prerequisites, API
 endpoints, request/response formats, and workflows to help you integrate LightSpeedPay’s payment
 gateway efficiently.
 1. Prerequisites for Integration
 Before initiating transactions via LightSpeedPay, you must complete the following setup:
 1.1 IP Whitelisting
 Sandbox Mode: IP whitelisting is optional for testing purposes in the sandbox environment. You can
 freely test APIs without needing to whitelist IPs.
 Live Mode: For the production environment, IP whitelisting is mandatory. Only whitelisted IPs are
 authorized to initiate transactions via the API. Contact support to add your server's IP to the whitelist
 before going live.
 1.2 Webhook Configuration
 Webhook URL: You must provide a Webhook URL for asynchronous notifications. This URL will be
 used by LightSpeedPay to send transaction status updates, ensuring that your system receives the
 latest payment information in real time.
 Security: For enhanced security, we recommend the use of a Bearer Token in your webhook setup.
 This token is used to verify the authenticity of the server-to-server (S2S) communication, ensuring
 that only trusted requests are accepted by your system.
 1.3 Redirect URLs
 Success URL: This is the URL where the customer will be redirected after a successful payment. It
 should display a confirmation message to the customer.
 Fail URL: This is the URL where the customer will be redirected in case the payment fails. It should
 notify the customer of the failure and provide steps for retrying the payment.
 2. API Key Generation
 Once the prerequisites are configured (IP whitelisting, Webhook URL, Redirect URLs, etc.), you can
 generate your API Key and API Secret. These credentials are crucial for authenticating API requests and
 are only valid when initiated from whitelisted IPs.
 API Key: Unique identifier for your account, used for API authentication.
 API Secret: Secret token used to secure the communication between your server and the
 LightSpeedPay server.
 1 / 5
api v3.md
 2024-09-20
 3. API Integration Workflow
 3.1 Steps to Integrate LightSpeedPay
 1. Configure IP Whitelisting: Ensure that your server IPs are whitelisted for the Live environment.
 2. Generate API Credentials: Get your API Key and API Secret from the LightSpeedPay dashboard.
 3. Set Webhook and Redirect URLs: Define and secure your Webhook URL for transaction status
 updates. Also, configure the Success and Fail URLs for user redirection.
 4. Initiate a Payment: Make an API call from the whitelisted server to initiate the transaction.
 5. Redirect Customer to Payment Page: Use the payment link received in the API response to redirect
 the customer to LightSpeedPay’s hosted payment page.
 6. Receive Webhook Notifications: After the payment is processed, a Webhook notification will be
 sent to your server to confirm the payment status.
 7. Redirect Customer Based on Outcome: After the transaction is completed, LightSpeedPay will
 redirect the customer to the provided Success or Fail URL.
 4. API Details
 4.1 Endpoints
 The LightSpeedPay API supports both Sandbox and Live environments. Ensure you're using the correct
 endpoint based on your environment.
 Sandbox Environment (For Testing):
 POST https://api.lightspeedpay.in/api/v1/transaction/sandbox/initiate
transaction
 Live Environment (For Production):
 POST https://api.lightspeedpay.in/api/v1/transaction/initiate-transaction
 4.2 HTTP Method
 POST: Transactions are initiated using a POST request.
 4.3 Request Headers
 The request must contain the following header to specify the format of the data being sent:
 Content-Type: application/json 
4.4 Request Payload
 Below is an example of the JSON payload required to initiate a transaction:
 { 
"customerName": "John Doe", 
"status": "success", 
2 / 5
api v3.md
 "method": "Qr", 
"description": "Payment for Order #12345", 
"amount": 500, 
"billId": "ABC123456789", 
"vpaId": "johndoe@upi", 
"apiKey": "your_api_key", 
"apiSecret": "your_api_secret", 
"type": "sandbox" 
} 
4.4.1 Parameters Explained
 2024-09-20
 customerName: Name of the customer making the payment (string).
 status: Indicates the intended status of the payment initiation (set to "success" for initiating a
 successful transaction) (string).
 method: The payment method (e.g., "Qr" for UPI QR-based transactions) (string).
 description: A brief description of the transaction (string).
 amount: The total amount for the transaction in INR (integer).
 billId: A unique identifier for the bill or order (string).
 vpaId: UPI Virtual Payment Address (VPA) of the customer (string).
 apiKey: Your LightSpeedPay API Key (string).
 apiSecret: Your LightSpeedPay API Secret (string).
 type: Defines the environment type for the transaction ("sandbox" for testing or "live" for
 production) (string).
 5. API Response
 Upon successful initiation of a transaction, the API will return a JSON response with the transaction details
 and the payment link.
 5.1 Sample Response
 { 
"status": "success", 
"code": 200, 
"message": "Transaction initiated successfully", 
"data": { 
"_id": "649a2b5f8f9836df8d48dba1" 
  }, 
"paymentLink": "https://pay.lightspeedpay.in/?
 txn=649a2b5f8f9836df8d48dba1&key=your_api_key&secret=your_api_secret" 
} 
5.1.1 Response Fields
 status: Indicates the result of the transaction initiation (e.g., "success") (string).
 3 / 5
api v3.md
 2024-09-20
 code: HTTP status code of the response (integer).
 message: Description of the result (e.g., "Transaction initiated successfully") (string).
 data: Contains additional data related to the transaction:
 _id: Unique identifier for the initiated transaction (string).
 paymentLink: The link that the customer must use to complete the payment. This link can be used to
 redirect customers to the hosted payment page.
 6. Payment Flow
 6.1 Steps in the Payment Process
 1. Initiate Transaction: You initiate a transaction by making an API call with the required parameters.
 2. Get Payment Link: The API response will include a paymentLink that should be presented to the
 customer.
 3. Customer Completes Payment: The customer is redirected to the LightSpeedPay payment page via
 the payment link. Ensure the browser or WebView supports JavaScript and DOM storage.
 Note: In case you are using a WebView, ensure that JavaScript and DOM storage are enabled.
 Without these, the payment page will not function properly.
 4. Redirect to Success or Fail URL: Based on the outcome of the payment, the customer is redirected
 to either the success or fail URL.
 5. Receive Webhook Notification: Simultaneously, LightSpeedPay will send a webhook notification to
 your server with the final transaction status.
 7. Webhook Handling
 7.1 Webhook Request
 When the transaction is completed (successful or failed), LightSpeedPay will make a POST request to your
 configured Webhook URL. Ensure your server is ready to receive and validate this data.
 7.2 Webhook Security
 To secure your webhook, we recommend using a Bearer Token for authentication. The token will be
 included in the headers of the webhook request and should be verified by your server before processing
 the request.
 Authorization: Bearer <your_bearer_token> 
8. Testing in Sandbox Mode
 Before going live, you should thoroughly test your integration in the Sandbox environment. In sandbox
 mode, transactions are simulated, and IP whitelisting is not required. You can experiment with different
 payment scenarios to ensure your system handles all outcomes properly.
 4 / 5
api v3.md
 2024-09-20
 9. Going Live
 Once you are satisfied with your testing, contact LightSpeedPay to move your integration to Live Mode.
 Make sure you have completed the following steps before going live:
 IP Whitelisting: Ensure your production server's IPs are whitelisted.
 Webhook URL: Your production Webhook URL is configured and secured with a Bearer Token.
 Success & Fail URLs: Correct URLs for user redirection after payment completion are in place.
 10. Additional Considerations
 10.1 Security Best Practices
 Always use HTTPS to communicate with LightSpeedPay’s APIs.
 Ensure that your Webhook URL is secured and validates incoming requests properly.
 Use strong and unique API keys for each environment (sandbox/live).
 10.2 Error Handling
 Handle errors gracefully by capturing API response codes and messages. Display user-friendly
 messages in case of failures.
 In case of network issues, ensure your system can retry API requests or display
 appropriate information to the customer.
 For further assistance or queries, please contact our Technical Support Team. We are here to help ensure a
 smooth and successful integration. Write your queries on Whatsapp @ +91 84510 76632.
 End of Documentation.
 5 / 5