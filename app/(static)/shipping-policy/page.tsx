export default function ShippingPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Shipping Policy</h1>

      <div className="space-y-6 text-base leading-relaxed">
        <p>
          At Allora Store, we strive to deliver your orders quickly and efficiently. Here&apos;s
          everything you need to know about our shipping process.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Shipping Options</h2>
        <p>We offer several shipping options to suit your needs:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>
            <strong>Standard Shipping (5-7 business days)</strong>: Free on orders over $50
          </li>
          <li>
            <strong>Express Shipping (2-3 business days)</strong>: $12.99 flat rate
          </li>
          <li>
            <strong>Overnight Shipping (1 business day)</strong>: $24.99 flat rate
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Processing Time</h2>
        <p>
          Orders are typically processed and shipped within 1-2 business days. Please note that
          business days are Monday through Friday, excluding holidays. Orders placed on weekends or
          holidays will be processed on the next business day.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Shipping Destinations</h2>
        <p>
          We currently ship to addresses within the United States and select international
          destinations. International shipping rates and delivery times vary by location.
          You&apos;ll see the exact cost and estimated delivery time at checkout.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Order Tracking</h2>
        <p>
          Once your order ships, you&apos;ll receive a confirmation email with a tracking number.
          You can use this number to track your package&apos;s journey to your doorstep. If you
          don&apos;t receive a tracking number within 3 business days of placing your order, please
          contact us.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Delivery Issues</h2>
        <p>
          If your package is marked as delivered but you haven&apos;t received it, please check with
          neighbors or your building&apos;s management. If you still can&apos;t locate your package,
          contact us within 48 hours and we&apos;ll help resolve the issue.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Questions?</h2>
        <p>
          If you have any questions about shipping, please don&apos;t hesitate to{" "}
          <a href="/contact" className="text-primary hover:underline">
            contact us
          </a>
          . We&apos;re here to help!
        </p>
      </div>
    </div>
  );
}
