import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FeaturedBooks } from "@/components/books/featured-books"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturedBooks />
      </main>
      <Footer />
    </div>
  )
}
