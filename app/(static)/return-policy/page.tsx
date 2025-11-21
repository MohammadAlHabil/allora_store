export default function ReturnPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Return Policy</h1>

      <div className="space-y-6 text-base leading-relaxed">
        <p>
          We want you to be completely satisfied with your purchase. If for any reason you&apos;re
          not happy with your order, we&apos;re here to help.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">30-Day Return Window</h2>
        <p>
          You have 30 days from the date of delivery to return most items for a full refund. The
          item must be unused, in its original condition, and in its original packaging with all
          tags attached.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Non-Returnable Items</h2>
        <p>The following items cannot be returned:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Final sale items (marked as such on the product page)</li>
          <li>Intimate apparel and swimwear (for hygiene reasons)</li>
          <li>Personalized or custom-made items</li>
          <li>Beauty products that have been opened or used</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">How to Return an Item</h2>
        <ol className="list-decimal list-inside space-y-2 ml-4">
          <li>Contact us at support@allorastore.com with your order number</li>
          <li>We&apos;ll send you a return authorization and instructions</li>
          <li>Pack the item securely in its original packaging</li>
          <li>Ship it back to us using the provided return label (if applicable)</li>
        </ol>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Refunds</h2>
        <p>
          Once we receive and inspect your return, we&apos;ll process your refund within 5-7
          business days. The refund will be issued to your original payment method. Please note that
          it may take additional time for the refund to appear on your statement, depending on your
          bank or credit card company.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Exchanges</h2>
        <p>
          We currently don&apos;t offer direct exchanges. If you need a different size or color,
          please return the original item for a refund and place a new order for the item you want.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Return Shipping Costs</h2>
        <p>
          Return shipping is free for defective or incorrect items. For all other returns,
          you&apos;ll be responsible for the return shipping cost. We recommend using a trackable
          shipping service.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Questions?</h2>
        <p>
          If you have any questions about our return policy, please{" "}
          <a href="/contact" className="text-primary hover:underline">
            contact us
          </a>
          . We&apos;re happy to help!
        </p>
      </div>
    </div>
  );
}
