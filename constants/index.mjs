export const EMAIL_TEMPLATE = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Order Confirmation</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f6f9fc;
        color: #333;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        margin: auto;
        background-color: #ffffff;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0,0,0,0.05);
      }
      .header {
        text-align: center;
        margin-bottom: 30px;
      }
      .header h1 {
        color: #2d3748;
      }
      .details {
        margin-top: 20px;
      }
      .details p {
        margin: 5px 0;
      }
      .tracking {
        background-color: #edf2f7;
        padding: 15px;
        border-radius: 6px;
        margin-top: 20px;
        text-align: center;
        font-weight: bold;
        color: #2b6cb0;
        letter-spacing: 1px;
      }
      .footer {
        margin-top: 30px;
        font-size: 14px;
        color: #666;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Order Confirmed</h1>
        <p>Thank you for your purchase!</p>
      </div>

      <p>Hi <strong>{{customerName}}</strong>,</p>

      <p>Your order <strong>#{{orderId}}</strong> placed on <strong>{{orderDate}}</strong> has been successfully processed.</p>

       <h3>Items Ordered:</h3>
      <table width="100%" cellpadding="10" cellspacing="0" style="border-collapse: collapse;">
        <thead>
          <tr>
            <th align="left">Item</th>
            <th align="center">Qty</th>
            <th align="right">Price</th>
          </tr>
        </thead>
        <tbody>
          {{items}}
        </tbody>
      </table>

      <div class="tracking">
        TRACKING NUMBER: {{trackingNumber}}
      </div>

      <div class="details">
        <p><strong>Shipping Address:</strong> {{shippingAddress}}</p>
        <p><strong>Estimated Delivery:</strong> {{deliveryDate}}</p>
      </div>

      <p>If you have any questions, feel free to reply to this email or contact our support team at <a href="mailto:support@scentsbyjojo.com">support@scentsbyjojo.com</a>.</p>

      <div class="footer">
        &copy; {{currentYear}} Scent's by Jojo. All rights reserved.
      </div>
    </div>
  </body>
</html>
`;
