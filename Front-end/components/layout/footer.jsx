import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-white text-gray-600 dark:bg-gray-900 dark:text-gray-400">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-gray-200">Ras Electronic</h3>
            <p className="mb-4">Premium electronics marketplace connecting buyers and sellers since 2020.</p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="rounded-full bg-gray-100 p-2 hover:bg-primary hover:text-white dark:bg-gray-800 dark:hover:bg-primary"
                aria-label="Facebook"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="#"
                className="rounded-full bg-gray-100 p-2 hover:bg-primary hover:text-white dark:bg-gray-800 dark:hover:bg-primary"
                aria-label="Twitter"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
              <a
                href="#"
                className="rounded-full bg-gray-100 p-2 hover:bg-primary hover:text-white dark:bg-gray-800 dark:hover:bg-primary"
                aria-label="Instagram"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-gray-200">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-primary hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-primary hover:underline">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary hover:underline">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary hover:underline">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-primary hover:underline">
                  Seller Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-gray-200">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products?category=smartphones" className="hover:text-primary hover:underline">
                  Smartphones
                </Link>
              </li>
              <li>
                <Link href="/products?category=laptops" className="hover:text-primary hover:underline">
                  Laptops
                </Link>
              </li>
              <li>
                <Link href="/products?category=audio" className="hover:text-primary hover:underline">
                  Audio
                </Link>
              </li>
              <li>
                <Link href="/products?category=wearables" className="hover:text-primary hover:underline">
                  Wearables
                </Link>
              </li>
              <li>
                <Link href="/products?category=accessories" className="hover:text-primary hover:underline">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-medium text-gray-800 dark:text-gray-200">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 mt-1 text-primary"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>Weleta</span>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 mt-1 text-primary"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>0900000000</span>
              </li>
              <li className="flex items-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 mt-1 text-primary"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>support@Raselectronics.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <p>&copy; 2025 Ras-Electronics. All rights reserved.</p>
            <div className="mt-4 flex space-x-6 md:mt-0">
              <Link href="#" className="hover:text-primary hover:underline">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-primary hover:underline">
                Terms of Service
              </Link>
              <Link href="#" className="hover:text-primary hover:underline">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
