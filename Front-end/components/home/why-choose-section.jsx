export default function WhyChooseSection() {
  const reasons = [
    {
      title: "Premium Quality",
      description: "Carefully curated products from trusted brands and verified sellers",
      icon: "🏆",
    },
    {
      title: "Fast Delivery",
      description: "Quick and reliable shipping with real-time tracking",
      icon: "🚚",
    },
    {
      title: "Secure Shopping",
      description: "Protected payments and buyer guarantee for peace of mind",
      icon: "🔒",
    },
    {
      title: "24/7 Support",
      description: "Expert customer service available whenever you need help",
      icon: "💬",
    },
  ]

  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold">Why Choose TechTrove</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experience the difference with our commitment to quality, service, and customer satisfaction
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-lg border border-gray-100 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="text-4xl mb-4">{reason.icon}</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{reason.title}</h3>
              <p className="text-gray-600 leading-relaxed">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
