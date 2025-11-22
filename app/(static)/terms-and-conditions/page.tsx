export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Terms and Conditions</h1>

      <div className="space-y-6 text-base leading-relaxed">
        <p className="text-sm text-muted-foreground">
          <strong>Last Updated:</strong> January 1, 2024
        </p>

        <p>
          Welcome to Allora Store. By accessing or using our website, you agree to be bound by these
          Terms and Conditions. Please read them carefully.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Use of Our Website</h2>
        <p>
          By using our website, you agree to use it only for lawful purposes and in accordance with
          these Terms. You agree not to:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Violate any applicable laws or regulations</li>
          <li>Infringe upon the rights of others</li>
          <li>Transmit harmful code or malware</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Engage in any fraudulent activity</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Account Registration</h2>
        <p>
          To make a purchase, you may need to create an account. You are responsible for maintaining
          the confidentiality of your account credentials and for all activities that occur under
          your account.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Product Information</h2>
        <p>
          We strive to provide accurate product descriptions, images, and pricing. However, we do
          not warrant that product descriptions or other content is accurate, complete, or
          error-free. We reserve the right to correct errors and update information at any time
          without prior notice.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Pricing and Payment</h2>
        <p>
          All prices are in USD and are subject to change without notice. We reserve the right to
          refuse or cancel any order for any reason, including pricing errors. Payment must be
          received before orders are processed.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Shipping and Delivery</h2>
        <p>
          We aim to ship orders promptly, but delivery times are estimates only. We are not liable
          for delays caused by shipping carriers or circumstances beyond our control. Risk of loss
          passes to you upon delivery to the carrier.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Returns and Refunds</h2>
        <p>
          Our return policy is outlined on our{" "}
          <a href="/return-policy" className="text-primary hover:underline">
            Return Policy page
          </a>
          . By making a purchase, you agree to our return policy.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Intellectual Property</h2>
        <p>
          All content on our website, including text, images, logos, and designs, is the property of
          Allora Store or our licensors and is protected by copyright and other intellectual
          property laws. You may not use our content without our written permission.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, Allora Store shall not be liable for any indirect,
          incidental, special, or consequential damages arising from your use of our website or
          products. Our total liability shall not exceed the amount you paid for the product in
          question.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">9. Indemnification</h2>
        <p>
          You agree to indemnify and hold harmless Allora Store and its employees from any claims,
          losses, or damages arising from your violation of these Terms or your use of our website.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">10. Governing Law</h2>
        <p>
          These Terms are governed by the laws of the United States. Any disputes shall be resolved
          in the courts of New York, NY.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">11. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. Changes will be effective
          immediately upon posting. Your continued use of the website constitutes acceptance of the
          updated Terms.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">12. Contact Information</h2>
        <p>
          If you have any questions about these Terms, please{" "}
          <a href="/contact" className="text-primary hover:underline">
            contact us
          </a>
          .
        </p>
      </div>
    </div>
  );
}
