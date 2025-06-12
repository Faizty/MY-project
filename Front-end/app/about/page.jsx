import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-3xl font-medium text-gray-900">About Ras-Electronics</h1>
        <p className="mx-auto max-w-2xl text-base text-gray-600">
          Connecting tech enthusiasts with premium electronics since 2020
        </p>
      </div>

      <div className="mb-16 grid gap-12 md:grid-cols-2 items-center">
        <div>
          <h2 className="mb-4 text-2xl font-medium text-gray-900">Our Story</h2>
          <p className="mb-4 text-gray-600">
            Ras-Electronics was founded with a simple mission: to create a marketplace where tech enthusiasts could find
            premium electronics directly from trusted sellers. What started as a small community has grown into a
            thriving platform connecting thousands of buyers and sellers.
          </p>
          <p className="mb-4 text-gray-600">
            We believe in the power of technology to transform lives, and we're committed to making the latest
            innovations accessible to everyone. Our platform is designed to be intuitive, secure, and enjoyable for both
            buyers and sellers.
          </p>
          <Button className="bg-brand-600 hover:bg-brand-700">Learn More</Button>
        </div>
        <div className="relative h-80 w-full overflow-hidden rounded-lg">
          <Image src="/placeholder.svg?height=400&width=600" alt="TechTrove team" fill className="object-cover" />
        </div>
      </div>

      <div className="mb-16">
        <h2 className="mb-8 text-center text-2xl font-medium text-gray-900">Our Values</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-lg bg-gray-50 p-6">
            <div className="mb-4 inline-flex rounded-full bg-brand-100 p-3 text-brand-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium">Trust & Security</h3>
            <p className="text-gray-600">
              We prioritize the security of our platform and the trust of our community. Every transaction is protected,
              and every seller is verified.
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-6">
            <div className="mb-4 inline-flex rounded-full bg-brand-100 p-3 text-brand-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium">Community</h3>
            <p className="text-gray-600">
              We're building more than a marketplace—we're creating a community of tech enthusiasts who share knowledge,
              experiences, and passion.
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-6">
            <div className="mb-4 inline-flex rounded-full bg-brand-100 p-3 text-brand-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v20" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium">Innovation</h3>
            <p className="text-gray-600">
              We embrace the latest technologies and continuously improve our platform to provide the best possible
              experience for our users.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-16">
        <h2 className="mb-8 text-center text-2xl font-medium text-gray-900">Our Team</h2>
        <div className="grid gap-8 md:grid-cols-5">
          {[
            {
              name: "Faiz Ahmed",
              role: "Founder & CEO",
              image: "/placeholder.svg?height=300&width=300",
            },
            {
              name: "Daniel Derega",
              role: "CTO",
              image: "/placeholder.svg?height=300&width=300",
            },
            {
              name: "Adoneyas dememelash",
              role: "Head of Operations",
              image: "/placeholder.svg?height=300&width=300",
            },
            {
              name: "Firdos Abdurehman",
              role: "Lead Designer",
              image: "/placeholder.svg?height=300&width=300",
            },
            {
              name: "Bethelhem Ashenafi",
              role: "Marketing Director",
              image: "/placeholder.svg?height=300&width=300",
            },
            {
              name: "Hamza Nasir",
              role: "Marketing Director",
              image: "/placeholder.svg?height=300&width=300",
            },
          ].map((member, index) => (
            <div key={index} className="text-center">
              <div className="mb-4 overflow-hidden rounded-full">
                <Image
                  src={member.image || "/placeholder.svg"}
                  alt={member.name}
                  width={160}
                  height={160}
                  className="mx-auto h-40 w-40 object-cover"
                />
              </div>
              <h3 className="mb-1 text-lg font-medium">{member.name}</h3>
              <p className="text-gray-600">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
