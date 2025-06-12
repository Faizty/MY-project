"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Phone, Mail, Clock, CheckCircle } from "lucide-react"

export default function ContactPage() {
  const { toast } = useToast()
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      toast({
        title: "Message sent!",
        description: "We'll get back to you as soon as possible.",
      })
    }, 1500)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">Contact Us</h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          Have questions or feedback? We'd love to hear from you. Our team is always ready to help.
        </p>
      </div>

      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <div className="mb-8 rounded-lg bg-gray-50 p-6">
            <h2 className="mb-6 text-2xl font-bold">Get in Touch</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="mr-4 h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-medium">Our Location</h3>
                  <p className="text-gray-600">123 Tech Avenue, San Francisco, CA 94107</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="mr-4 h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-medium">Phone Number</h3>
                  <p className="text-gray-600">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="mr-4 h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-medium">Email Address</h3>
                  <p className="text-gray-600">support@techtrove.com</p>
                </div>
              </div>
              <div className="flex items-start">
                <Clock className="mr-4 h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-medium">Business Hours</h3>
                  <p className="text-gray-600">Monday - Friday: 9am - 5pm PST</p>
                  <p className="text-gray-600">Saturday - Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-6">
            <h2 className="mb-4 text-2xl font-bold">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">How do I track my order?</h3>
                <p className="text-gray-600">
                  You can track your order by logging into your account and visiting the "Orders" section.
                </p>
              </div>
              <div>
                <h3 className="font-medium">What is your return policy?</h3>
                <p className="text-gray-600">
                  We offer a 30-day return policy for most items. Please check the product page for specific details.
                </p>
              </div>
              <div>
                <h3 className="font-medium">How do I become a seller?</h3>
                <p className="text-gray-600">
                  To become a seller, click on the "Sell on TechTrove" link in the footer and follow the registration
                  process.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-6 shadow-sm">
          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="mb-4 h-16 w-16 text-green-500" />
              <h2 className="mb-2 text-2xl font-bold">Message Sent!</h2>
              <p className="mb-6 text-gray-600">
                Thank you for reaching out. We'll get back to you as soon as possible.
              </p>
              <Button
                onClick={() => {
                  setIsSubmitted(false)
                  setFormState({
                    name: "",
                    email: "",
                    subject: "",
                    message: "",
                  })
                }}
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <>
              <h2 className="mb-6 text-2xl font-bold">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium">
                    Your Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium">
                    Your Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formState.email}
                    onChange={handleChange}
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="mb-2 block text-sm font-medium">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formState.subject}
                    onChange={handleChange}
                    required
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="mb-2 block text-sm font-medium">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formState.message}
                    onChange={handleChange}
                    required
                    className="min-h-32 w-full"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
