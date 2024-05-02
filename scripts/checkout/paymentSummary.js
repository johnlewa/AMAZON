import { cart } from "../../data/cart.js";
import { getProduct } from "../../data/products.js";
import { getDeliveryOption } from "../../data/deliveryOptions.js";
import { formatCurrency } from "../utils/money.js";

let totalCents = 0;

export function renderPaymentSummary() {
  let productPriceCents = 0;
  let shippingPriceCents = 0;


  cart.forEach((cartItem) => {
    const product = getProduct(cartItem.productId);
    productPriceCents += product.priceCents * cartItem.quantity;

    const deliveryOption =  getDeliveryOption(cartItem.deliveryOptionId);
    shippingPriceCents += deliveryOption.priceCents;
  });

  const totalBeforeTaxCents = productPriceCents + shippingPriceCents;
  const taxCents = totalBeforeTaxCents * 0.1;
  totalCents = totalBeforeTaxCents + taxCents;

  const paymentSummaryHTML = `
    <div class="payment-summary-title">
      Order Summary
    </div>

    <div class="payment-summary-row">
      <div>Items (3):</div>
      <div class="payment-summary-money">
        $${formatCurrency(productPriceCents)}
      </div>
    </div>

    <div class="payment-summary-row">
      <div>Shipping &amp; handling:</div>
      <div class="payment-summary-money">
        $${formatCurrency(shippingPriceCents)}
      </div>
    </div>

    <div class="payment-summary-row subtotal-row">
      <div>Total before tax:</div>
      <div class="payment-summary-money">
        $${formatCurrency(totalBeforeTaxCents)}
      </div>
    </div>

    <div class="payment-summary-row">
      <div>Estimated tax (10%):</div>
      <div class="payment-summary-money">
        $${formatCurrency(taxCents)}
      </div>
    </div>

    <div class="payment-summary-row total-row">
      <div>Order total:</div>
      <div class="payment-summary-money">
        $${formatCurrency(totalCents)}
      </div>
    </div>

    <div class="place-order-button paypal-button-container pay-your-order-button button-primary">
      
    </div>
    

  `;
  
document.querySelector('.js-payment-summary')
  .innerHTML = paymentSummaryHTML;


}


document.addEventListener('DOMContentLoaded', function() {
  // Your JavaScript code here
  document.querySelector('.pay-your-order-button').addEventListener('click', () => {
      // Call a function to render the PayPal button
      initiatePayPalPayment();
  });
});



function initiatePayPalPayment() {
  paypal.Buttons({
      createOrder: function(data, actions) {
          // This function sets up the details of the transaction.
          return actions.order.create({
              purchase_units: [{
                  amount: {
                      value: formatCurrency(totalCents), // Use the totalCents calculated in your payment summary
                      currency_code: 'USD'
                  }
              }]
          });
      },
      onApprove: function(data, actions) {
          // This function captures the funds from the transaction.
          return actions.order.capture().then(function(details) {
              // Call your server to save the transaction details and fulfill the order
              // You may want to redirect the user to a confirmation page here
              console.log('Transaction completed by ' + details.payer.name.given_name);
          });
      }
  }).render('.paypal-button-container'); // Render the PayPal button inside a container element
}

initiatePayPalPayment();


