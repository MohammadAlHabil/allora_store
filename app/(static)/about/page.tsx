import { Award, Globe, Heart, Shield, Sparkles, Users } from "lucide-react";

import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-12">
        <Badge className="mb-4" variant="secondary">
          Our Story
        </Badge>
        <h1 className="text-4xl font-bold mb-4">About Allora Store</h1>
        <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
          More than just a fashion destination—we&apos;re a community dedicated to helping you
          discover your unique style and express yourself with confidence.
        </p>
      </div>

      {/* Hero Story Card */}
      <Card className="mb-12 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-8 md:p-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Our Journey</h2>
          </div>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Founded with a passion for bringing quality and style together, Allora Store started
              as a small dream to make fashion accessible to everyone. Today, we&apos;re proud to
              offer a carefully curated collection of clothing, accessories, beauty products, and
              more—all designed to help you express your unique style.
            </p>
            <p>
              Our name, &quot;Allora,&quot; reflects our commitment to helping you take that next
              step in your style journey with confidence and purpose. From the moment you browse our
              collection to the day your order arrives at your door, we&apos;re here to make sure
              you&apos;re completely satisfied.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Values Grid */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center mb-8">What We Stand For</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-rose-600 dark:text-rose-400" />
              </div>
              <CardTitle>Quality First</CardTitle>
              <CardDescription>
                We carefully curate every piece, ensuring it meets our high standards for
                craftsmanship, materials, and durability.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>Unique Style</CardTitle>
              <CardDescription>
                From timeless classics to trend-forward pieces, we offer a thoughtfully selected
                collection that helps you express your individuality.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Customer-Centric</CardTitle>
              <CardDescription>
                Your satisfaction is our priority. We provide exceptional support, hassle-free
                returns, and a shopping experience you&apos;ll love.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Sustainability</CardTitle>
              <CardDescription>
                We&apos;re committed to reducing our environmental impact through eco-friendly
                packaging and partnerships with sustainable brands.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle>Excellence</CardTitle>
              <CardDescription>
                From product selection to delivery, we maintain the highest standards at every step
                of your shopping journey.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-950 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <CardTitle>Trust & Security</CardTitle>
              <CardDescription>
                Shop with confidence knowing your personal information and transactions are
                protected with industry-leading security.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* What We Offer */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="text-2xl">What We Offer</CardTitle>
          <CardDescription>A curated shopping experience designed around you</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                Curated Collections
              </h3>
              <p className="text-muted-foreground text-sm">
                Trendy and timeless clothing for every occasion, along with high-quality beauty and
                skincare products.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                Stylish Accessories
              </h3>
              <p className="text-muted-foreground text-sm">
                Complete your look with our carefully selected accessories that add the perfect
                finishing touch.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                Affordable Pricing
              </h3>
              <p className="text-muted-foreground text-sm">
                Quality fashion at prices that won&apos;t break the bank, with regular new arrivals
                to keep things fresh.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                Fast & Reliable Shipping
              </h3>
              <p className="text-muted-foreground text-sm">
                Get your orders quickly with our efficient shipping, plus hassle-free returns and
                exchanges.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promise */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Promise to You</h2>
          <p className="text-lg opacity-90 max-w-3xl mx-auto">
            At Allora Store, we&apos;re committed to providing you with an exceptional shopping
            experience. Our friendly customer service team is always ready to help with any
            questions or concerns. Thank you for choosing Allora Store. We&apos;re excited to be
            part of your style journey!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
