import { MessageCircle } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <Badge className="mb-4" variant="secondary">
          Help Center
        </Badge>
        <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-muted-foreground text-lg">
          Find answers to common questions about shopping at Allora Store
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Orders & Payment</CardTitle>
            <CardDescription>Questions about placing and paying for orders</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  We accept all major credit cards, PayPal, Apple Pay, and Google Pay.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Can I modify or cancel my order?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Orders can be modified or cancelled within 1 hour of placement. Contact us
                  immediately if you need to make changes.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping & Delivery</CardTitle>
            <CardDescription>Information about shipping times and tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="ship-1">
                <AccordionTrigger>How long does shipping take?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Standard shipping takes 5-7 business days. Express shipping (2-3 days) is
                  available at checkout.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="ship-2">
                <AccordionTrigger>Do you ship internationally?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes! We ship to most countries worldwide. Shipping costs and delivery times vary
                  by location.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Returns & Exchanges</CardTitle>
            <CardDescription>Our return and exchange policy</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="return-1">
                <AccordionTrigger>What is your return policy?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  We offer 30-day returns on most items in original condition with tags attached.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="return-2">
                <AccordionTrigger>How do I start a return?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Contact us at support@allorastore.com with your order number to initiate a return.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6 p-8">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Still have questions?</h3>
                <p className="text-muted-foreground">Our customer service team is here to help!</p>
              </div>
            </div>
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              Contact Us
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
