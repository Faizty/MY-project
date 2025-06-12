import Hero from "@/components/home/hero"
import FeaturedProducts from "@/components/home/featured-products"
import CategorySection from "@/components/home/category-section"
import Newsletter from "@/components/home/newsletter"
import Testimonials from "@/components/home/testimonials"
import TrendingProducts from "@/components/home/trending-products"
import BrandsShowcase from "@/components/home/brands-showcase"
import BlogPreview from "@/components/home/blog-preview"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShoppingBag, Award, Clock, Truck, Shield, Gift } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />

      {/* Benefits Section - Enhanced */}
      <div className="py-8 sm:py-12 bg-gray-50 dark:bg-gray-800 rounded-xl mb-8 sm:mb-12 overflow-hidden">
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-medium mb-3 dark:text-white">Why Choose TechTrove</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We're committed to providing the best shopping experience with premium products and exceptional service.
            </p>
          </div>

          <div className="flex flex-nowrap overflow-x-auto gap-6 pb-4 px-4 md:justify-center">
            <div className="flex flex-col items-center text-center p-4 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md rounded-lg transition-all duration-300 min-w-[180px] flex-shrink-0">
              <div className="bg-brand-100 dark:bg-brand-900/50 p-3 rounded-full mb-4">
                <ShoppingBag className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="font-semibold mb-2 dark:text-white">Wide Selection</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Thousands of products from trusted sellers</p>
            </div>

            <div className="flex flex-col items-center text-center p-4 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md rounded-lg transition-all duration-300 min-w-[180px] flex-shrink-0">
              <div className="bg-brand-100 dark:bg-brand-900/50 p-3 rounded-full mb-4">
                <Award className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="font-semibold mb-2 dark:text-white">Quality Guaranteed</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">All products are verified for quality</p>
            </div>

            <div className="flex flex-col items-center text-center p-4 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md rounded-lg transition-all duration-300 min-w-[180px] flex-shrink-0">
              <div className="bg-brand-100 dark:bg-brand-900/50 p-3 rounded-full mb-4">
                <Truck className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="font-semibold mb-2 dark:text-white">Fast Shipping</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Get your products delivered quickly</p>
            </div>

            <div className="flex flex-col items-center text-center p-4 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md rounded-lg transition-all duration-300 min-w-[180px] flex-shrink-0">
              <div className="bg-brand-100 dark:bg-brand-900/50 p-3 rounded-full mb-4">
                <Clock className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="font-semibold mb-2 dark:text-white">24/7 Support</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Our customer service team is always available</p>
            </div>

            <div className="flex flex-col items-center text-center p-4 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md rounded-lg transition-all duration-300 min-w-[180px] flex-shrink-0">
              <div className="bg-brand-100 dark:bg-brand-900/50 p-3 rounded-full mb-4">
                <Shield className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="font-semibold mb-2 dark:text-white">Secure Payments</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Your transactions are always protected</p>
            </div>

            <div className="flex flex-col items-center text-center p-4 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md rounded-lg transition-all duration-300 min-w-[180px] flex-shrink-0">
              <div className="bg-brand-100 dark:bg-brand-900/50 p-3 rounded-full mb-4">
                <Gift className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
              <h3 className="font-semibold mb-2 dark:text-white">Easy Returns</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">30-day hassle-free return policy</p>
            </div>
          </div>
        </div>
      </div>

      <FeaturedProducts />

      {/* Trending Products Section - New */}
      <TrendingProducts />

      <CategorySection />

      {/* Testimonials Section - New */}
      <Testimonials />

      {/* Brands Showcase - New */}
      <BrandsShowcase />

      {/* Blog Preview Section - New */}
      <BlogPreview />

      {/* Call to Action Section - Enhanced */}
      <div className="py-10 sm:py-16 my-8 sm:my-12 bg-gradient-to-r from-brand-700 to-brand-600 dark:from-gray-800 dark:to-gray-700 dark:border dark:border-gray-600 rounded-xl text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-medium mb-3 sm:mb-4">Ready to Start Shopping?</h2>
          <p className="max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
            Join thousands of satisfied customers and discover the best tech products at competitive prices.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
            <Link href="/products" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white text-brand-600 hover:bg-gray-100 hover:text-brand-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                Browse Products
              </Button>
            </Link>
            <Link href="/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white text-white hover:bg-brand-700 hover:text-white dark:border-gray-500 dark:hover:bg-gray-600"
              >
                Create Account
              </Button>
            </Link>
          </div>
          <div className="mt-8 text-sm text-white/80">
            Already have an account?{" "}
            <Link href="/login" className="underline font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      <Newsletter />
    </main>
  )
}
