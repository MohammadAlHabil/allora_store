"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  Facebook,
  Instagram,
  Twitter,
  Send,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  contactFormSchema,
  type ContactFormData,
} from "@/features/contact/validations/contact.schema";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Textarea } from "@/shared/components/ui/textarea";

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const subject = watch("subject");

  const onSubmit = async (data: ContactFormData) => {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Message sent successfully!", {
          description: result.message,
        });
        reset();
      } else {
        toast.error("Failed to send message", {
          description: result.message,
        });
      }
    } catch {
      toast.error("Something went wrong", {
        description: "Please try again later.",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-12">
        <Badge className="mb-4" variant="secondary">
          Get In Touch
        </Badge>
        <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          We&apos;d love to hear from you! Whether you have a question about your order, need
          styling advice, or just want to say hello, our team is here to help.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        {/* Contact Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
            <CardDescription>
              Fill out the form below and we&apos;ll get back to you within 24 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Field>
                  <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                  <FieldContent>
                    <Input id="firstName" placeholder="Ahmed" {...register("firstName")} />
                    <FieldError errors={[errors.firstName]} />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                  <FieldContent>
                    <Input id="lastName" placeholder="Raed" {...register("lastName")} />
                    <FieldError errors={[errors.lastName]} />
                  </FieldContent>
                </Field>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <FieldContent>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Ahmed@example.com"
                      {...register("email")}
                    />
                    <FieldError errors={[errors.email]} />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                  <FieldContent>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+20 10701234567"
                      {...register("phone")}
                    />
                    <FieldDescription className="text-xs">Optional</FieldDescription>
                    <FieldError errors={[errors.phone]} />
                  </FieldContent>
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor="subject">Subject</FieldLabel>
                <FieldContent>
                  <Select
                    value={subject || ""}
                    onValueChange={(value) => setValue("subject", value, { shouldValidate: true })}
                  >
                    <SelectTrigger id="subject" className="w-full">
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Order Inquiry">Order Inquiry</SelectItem>
                      <SelectItem value="Product Question">Product Question</SelectItem>
                      <SelectItem value="Shipping & Delivery">Shipping & Delivery</SelectItem>
                      <SelectItem value="Returns & Exchanges">Returns & Exchanges</SelectItem>
                      <SelectItem value="Feedback">Feedback</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldError errors={[errors.subject]} />
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel htmlFor="message">Message</FieldLabel>
                <FieldContent>
                  <Textarea
                    id="message"
                    placeholder="Tell us how we can help you..."
                    rows={5}
                    className="resize-none"
                    {...register("message")}
                  />
                  <FieldDescription className="text-xs">Minimum 10 characters</FieldDescription>
                  <FieldError errors={[errors.message]} />
                </FieldContent>
              </Field>

              <Button type="submit" className="w-full h-12" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Info Cards */}
        <div className="space-y-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center space-x-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center ">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="pb-2">Email</CardTitle>
                <CardDescription>Our support team is ready to help</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <a
                href="mailto:support@allorastore.com"
                className="text-primary hover:underline font-medium"
              >
                allora.store.co@gmail.com
              </a>
              <p className="text-sm text-muted-foreground mt-2">
                We typically respond within 24 hours
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center space-x-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="pb-2">Phone</CardTitle>
                <CardDescription>Call us during business hours</CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <a href="tel:+205551234567" className="text-primary hover:underline font-medium">
                +20 10701234567
              </a>
              <p className="text-sm text-muted-foreground mt-2">
                Monday - Friday: 9:00 AM - 6:00 PM EST
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center space-x-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center ">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="pb-2">Address</CardTitle>
                <CardDescription>Visit our headquarters</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <address className="not-italic">
                <p className="font-medium">123 Fashion Avenue</p>
                <p className="text-muted-foreground">Cairo, Cairo Governorate 11511</p>
                <p className="text-muted-foreground">Egypt</p>
              </address>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Customer Service Hours */}
      <Card className="mb-12">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Customer Service Hours</CardTitle>
              <CardDescription>
                Our team is available to assist you during these hours
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="font-semibold mb-2">Monday - Friday</p>
              <p className="text-muted-foreground">9:00 AM - 6:00 PM EST</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="font-semibold mb-2">Saturday</p>
              <p className="text-muted-foreground">10:00 AM - 4:00 PM EST</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="font-semibold mb-2">Sunday</p>
              <p className="text-muted-foreground">Closed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Reference */}
      <Card className="mb-12 bg-primary/5 border-primary/20">
        <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6 p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Before reaching out...</h3>
              <p className="text-muted-foreground">
                You might find the answer you&apos;re looking for in our FAQ page. We&apos;ve
                compiled answers to the most common questions about orders, shipping, returns, and
                more.
              </p>
            </div>
          </div>
          <a
            href="/faq"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap"
          >
            View FAQ
          </a>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card>
        <CardHeader>
          <CardTitle>Follow Us</CardTitle>
          <CardDescription>
            Stay connected with us on social media for the latest updates, style tips, and exclusive
            offers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://instagram.com/allorastore"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors flex-1 min-w-[200px]"
            >
              <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-950 flex items-center justify-center">
                <Instagram className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <p className="font-semibold">Instagram</p>
                <p className="text-sm text-muted-foreground">@allorastore</p>
              </div>
            </a>

            <a
              href="https://facebook.com/allorastore"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors flex-1 min-w-[200px]"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                <Facebook className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-semibold">Facebook</p>
                <p className="text-sm text-muted-foreground">/allorastore</p>
              </div>
            </a>

            <a
              href="https://twitter.com/allorastore"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors flex-1 min-w-[200px]"
            >
              <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-950 flex items-center justify-center">
                <Twitter className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="font-semibold">Twitter</p>
                <p className="text-sm text-muted-foreground">@allorastore</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        We value your feedback and are always looking for ways to improve your shopping experience.
        Don&apos;t hesitate to reach out—we&apos;re here for you!
      </p>
    </div>
  );
}
