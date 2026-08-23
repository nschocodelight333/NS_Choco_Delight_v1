const Terms = () => (
  <div className="py-16 min-h-screen">
    <div className="page-container max-w-3xl prose-choco">
      <h1 className="font-display text-4xl font-bold text-choco-900 mb-8">Terms & Conditions</h1>
      <p className="text-choco-500 text-sm mb-8">Last updated: June 2025</p>

      {[
        {
          title: '1. General Terms',
          content: 'By placing an order on NS Choco Delight, you agree to these Terms & Conditions. Please read them carefully before making a purchase.',
        },
        {
          title: '2. Products',
          content: 'All chocolates are homemade and made to order. Product images are for representation purposes. Slight variations in appearance may occur due to the handcrafted nature of our products. Prices are listed in Indian Rupees (₹) and include applicable taxes.',
        },
        {
          title: '3. Pricing & Payments',
          content: 'All prices listed on our website are in INR (₹). We accept online payments via PhonePe, Paytm, Google Pay (8185920511), Razorpay (UPI, Credit/Debit cards, Net Banking) and Cash on Delivery for eligible pincodes.',
        },
        {
          title: '4. Order Fulfillment & Delivery',
          content: 'Orders are processed within 24 hours of confirmation. Delivery times depend on the shipping address and chosen delivery partner. Free delivery applies to orders above ₹500.',
        },
        {
          title: '5. Returns & Refund Policy',
          content: 'Due to the perishable nature of homemade chocolates, we do not accept returns. If your order arrives damaged or incorrect, please contact us within 24 hours with photos for a resolution or replacement.',
        },
        {
          title: '6. Intellectual Property',
          content: 'All content on this website, including text, images, logos, and design, belongs to NS Choco Delight and may not be reproduced without permission.',
        },
        {
          title: '7. Contact',
          content: 'For any queries, please reach out via our Contact page or WhatsApp.',
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

export default Terms;
