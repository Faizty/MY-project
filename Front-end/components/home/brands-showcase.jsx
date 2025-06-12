export default function BrandsShowcase() {
  const brands = [
    {
      name: "Apple",
      logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    },
    {
      name: "Samsung",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg",
    },
    {
      name: "Google",
      logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    },
    {
      name: "Microsoft",
      logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    },
    {
      name: "Sony",
      logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg",
    },
    {
      name: "Intel",
      logo: "https://upload.wikimedia.org/wikipedia/commons/7/7d/Intel_logo_%282006-2020%29.svg",
    },
    {
      name: "Dell",
      logo: "https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg",
    },
    {
      name: "HP",
      logo: "https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg",
    },
  ]

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2 dark:text-white">Trusted by Leading Brands</h2>
          <p className="text-gray-600 dark:text-gray-300">We partner with the best to bring you quality products</p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
          {brands.map((brand) => (
            <div
              key={brand.name}
              className="w-20 h-20 md:w-24 md:h-24 bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer flex items-center justify-center p-3 border border-gray-200 dark:border-gray-600"
            >
              <img
                src={brand.logo || "/placeholder.svg"}
                alt={`${brand.name} logo`}
                className="max-w-full max-h-full object-contain filter brightness-75 hover:brightness-100 transition-all duration-300 dark:invert dark:brightness-100 dark:hover:brightness-75"
                crossOrigin="anonymous"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
