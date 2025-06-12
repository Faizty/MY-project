import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Calendar, User } from "lucide-react"

export default function BlogPreview() {
  const articles = [
    {
      id: 1,
      title: "The Future of Smart Home Technology",
      excerpt:
        "Discover how the latest smart home innovations are transforming everyday living and what to expect in the coming years.",
      image: "/placeholder.svg?height=300&width=500&text=Smart+Home",
      date: "May 15, 2023",
      author: "Alex Johnson",
      category: "Technology",
    },
    {
      id: 2,
      title: "Top 10 Gadgets for Productivity",
      excerpt:
        "Boost your efficiency with these must-have tech tools that can streamline your workflow and help you accomplish more.",
      image: "/placeholder.svg?height=300&width=500&text=Productivity",
      date: "June 3, 2023",
      author: "Sarah Chen",
      category: "Productivity",
    },
    {
      id: 3,
      title: "Choosing the Right Gaming Setup",
      excerpt:
        "A comprehensive guide to building the perfect gaming station, from selecting components to optimizing your space.",
      image: "/placeholder.svg?height=300&width=500&text=Gaming+Setup",
      date: "April 22, 2023",
      author: "Mike Rodriguez",
      category: "Gaming",
    },
  ]

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Tech Insights & Tips</h2>
            <p className="text-gray-600">Stay updated with the latest tech trends and expert advice</p>
          </div>

          <Link href="/blog" className="mt-4 md:mt-0 flex items-center text-brand-600 hover:text-brand-700 font-medium">
            View All Articles <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Card
              key={article.id}
              className="overflow-hidden hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={article.image || "/placeholder.svg"}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105 dark:brightness-90"
                />
                <div className="absolute top-2 right-2 bg-brand-600 text-white text-xs font-medium px-2 py-1 rounded">
                  {article.category}
                </div>
              </div>

              <CardContent className="p-5">
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {article.date}
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {article.author}
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-2 line-clamp-2 hover:text-brand-600 transition-colors dark:text-white">
                  <Link href={`/blog/${article.id}`}>{article.title}</Link>
                </h3>

                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{article.excerpt}</p>

                <Link href={`/blog/${article.id}`}>
                  <Button
                    variant="outline"
                    className="w-full border-brand-600 text-brand-600 hover:bg-brand-50 dark:border-brand-500 dark:text-brand-400 dark:hover:bg-gray-700"
                  >
                    Read More
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
