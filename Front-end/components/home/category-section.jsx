import Link from "next/link"

export default function CategorySection() {
  const categories = [
    {
      name: "Smartphones",
      slug: "smartphones",
      description: "Latest mobile devices with cutting-edge technology",
      backgroundImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=2080&auto=format&fit=crop",
    },
    {
      name: "Laptops",
      slug: "laptops",
      description: "Powerful computers for work and entertainment",
      backgroundImage: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=2071&auto=format&fit=crop",
    },
    {
      name: "Audio",
      slug: "audio",
      description: "High-quality sound systems and headphones",
      backgroundImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop",
    },
    {
      name: "Wearables",
      slug: "wearables",
      description: "Smart watches and fitness trackers",
      backgroundImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop",
    },
    {
      name: "Accessories",
      slug: "accessories",
      description: "Essential add-ons for your devices",
      backgroundImage: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?q=80&w=2079&auto=format&fit=crop",
    },
    {
      name: "Gaming",
      slug: "gaming",
      description: "Consoles and peripherals for gamers",
      backgroundImage: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?q=80&w=2070&auto=format&fit=crop",
    },
  ]

  return (
    <div className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-bold">Shop by Category</h2>
          <p className="text-gray-600">Browse our wide selection of electronics categories</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/products?category=${category.slug}`}
              className="group relative h-48 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundImage: `url(${category.backgroundImage})` }}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300" />

              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-6 text-white">
                <h3 className="mb-2 text-2xl font-bold group-hover:text-white transition-colors">{category.name}</h3>
                <p className="text-gray-200 text-sm leading-relaxed">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
