export default function TermsPage() {
  return (
    <div className="py-16 min-h-screen">
      <div className="page-container max-w-3xl prose-choco">
        <h1 className="font-display text-4xl font-bold text-choco-900 mb-8">Terms & Conditions</h1>
        <p className="text-choco-500 text-sm mb-8">Last updated: June 2025</p>

        {[
          {
            title: '1. General Terms',
            content: 'By placing an order on NS Choco Delight, you agree to these Terms & Conditions.',
          },
          {
            title: '2. Products',
            content: 'All chocolates are homemade and made to order. Product images are for representation purposes.',
          },
          {
            title: '3. Pricing & Payments',
            content: 'All prices listed on our website are in INR (₹). We accept online payments and Cash on Delivery.',
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
