export default function PrivacyPage() {
  return (
    <div className="py-16 min-h-screen">
      <div className="page-container max-w-3xl">
        <h1 className="font-display text-4xl font-bold text-choco-900 mb-8">Privacy Policy</h1>
        <p className="text-choco-500 text-sm mb-8">Last updated: June 2025</p>

        {[
          {
            title: '1. Information We Collect',
            content: 'We collect information you provide directly, including your name, email address, phone number, and delivery address when you create an account or place an order.',
          },
          {
            title: '2. How We Use Your Information',
            content: 'We use your information to process and fulfill your orders, send order confirmations and updates, and provide customer support.',
          },
          {
            title: '3. Data Security',
            content: 'We take data security seriously. Passwords are hashed using industry-standard encryption.',
          },
        ].map((section) => (
          <div key={section.title} className="mb-8">
            <h2 className="font-display text-xl font-bold text-choco-900 mb-3">{section.title}</h2>
            <p className="text-choco-700 leading-relaxed">{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
