export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>

      <div className="space-y-6 text-base leading-relaxed">
        <p className="text-sm text-muted-foreground">
          <strong>Effective Date:</strong> January 1, 2024
        </p>

        <p>
          At Allora Store, we are committed to protecting your privacy. This Privacy Policy explains
          how we collect, use, disclose, and safeguard your information when you visit our website
          or make a purchase from us.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
        <p>We collect information that you provide directly to us, including:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Name, email address, and contact information</li>
          <li>Billing and shipping addresses</li>
          <li>Payment information (processed securely through our payment providers)</li>
          <li>Order history and preferences</li>
          <li>Communications with our customer service team</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Process and fulfill your orders</li>
          <li>Send order confirmations and shipping updates</li>
          <li>Respond to your questions and provide customer support</li>
          <li>Send you marketing communications (with your consent)</li>
          <li>Improve our website and services</li>
          <li>Detect and prevent fraud</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Information Sharing</h2>
        <p>
          We do not sell your personal information. We may share your information with trusted third
          parties who help us operate our business, such as:
        </p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Payment processors</li>
          <li>Shipping carriers</li>
          <li>Email service providers</li>
          <li>Analytics providers</li>
        </ul>
        <p className="mt-2">
          These third parties are contractually obligated to keep your information secure and use it
          only for the purposes we specify.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Data Security</h2>
        <p>
          We implement industry-standard security measures to protect your personal information.
          However, no method of transmission over the Internet is 100% secure, and we cannot
          guarantee absolute security.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Your Rights</h2>
        <p>You have the right to:</p>
        <ul className="list-disc list-inside space-y-2 ml-4">
          <li>Access the personal information we hold about you</li>
          <li>Request corrections to your information</li>
          <li>Request deletion of your information</li>
          <li>Opt out of marketing communications</li>
          <li>Object to certain processing of your information</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Cookies</h2>
        <p>
          We use cookies and similar technologies to improve your browsing experience, analyze site
          traffic, and personalize content. You can control cookies through your browser settings.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Children&apos;s Privacy</h2>
        <p>
          Our website is not intended for children under 13 years of age. We do not knowingly
          collect personal information from children under 13.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any significant
          changes by posting the new policy on this page and updating the effective date.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please{" "}
          <a href="/contact" className="text-primary hover:underline">
            contact us
          </a>
          .
        </p>
      </div>
    </div>
  );
}
