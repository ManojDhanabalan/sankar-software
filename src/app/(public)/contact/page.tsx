"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { submitContactMessage } from "@/lib/firestore";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email || !form.message) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      await submitContactMessage(form);
      toast.success("Message sent successfully! We'll get back to you soon.");
      setForm({ name: "", phone: "", email: "", message: "" });
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20 lg:pt-24">
      {/* Hero */}
      <section className="bg-primary py-20 lg:py-28 relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-primary-foreground/5 mix-blend-overlay" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="text-sm font-bold text-primary-foreground/80 tracking-widest uppercase">
            Get In Touch
          </span>
          <h1 className="mt-4 text-4xl lg:text-6xl font-bold text-primary-foreground tracking-tighter text-balance">
            Contact Us
          </h1>
          <p className="mt-6 text-lg text-primary-foreground/90 max-w-2xl mx-auto text-balance">
            Have a project in mind? Get in touch and let&apos;s discuss how we
            can bring your vision to life.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Form */}
            <div className="lg:col-span-3">
              <Card className="border border-border shadow-lg rounded-xl bg-card">
                <CardContent className="p-8 lg:p-10">
                  <h2 className="text-3xl font-bold text-foreground mb-8 tracking-tight">
                    Send us a Message
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          className="rounded-xl"
                          value={form.name}
                          onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          placeholder="+91 98765 43210"
                          className="rounded-xl"
                          value={form.phone}
                          onChange={(e) =>
                            setForm({ ...form, phone: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="rounded-xl"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us about your project..."
                        className="rounded-xl min-h-[120px]"
                        value={form.message}
                        onChange={(e) =>
                          setForm({ ...form, message: e.target.value })
                        }
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={loading}
                      size="lg"
                      className="w-full rounded-2xl h-14 text-base"
                    >
                      {loading ? (
                        "Sending..."
                      ) : (
                        <>
                          Send Message <Send className="ml-2 w-5 h-5" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border border-border shadow-sm rounded-xl bg-card hover:shadow-md hover:border-primary/20 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">Call Us</h3>
                      <p className="text-sm text-muted-foreground mt-1">+91 98765 43210</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border shadow-sm rounded-xl bg-card hover:shadow-md hover:border-primary/20 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">
                        Email Us
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        info@ssconstruction.com
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border shadow-sm rounded-xl bg-card hover:shadow-md hover:border-primary/20 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground">
                        Visit Us
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        123 Construction Avenue,
                        <br /> Tamil Nadu, India
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-border shadow-sm rounded-xl bg-muted/30">
                <CardContent className="p-6">
                  <h3 className="font-bold text-foreground mb-3 tracking-tight">
                    Working Hours
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground font-medium">
                    <p>Monday – Saturday: 9:00 AM – 6:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
