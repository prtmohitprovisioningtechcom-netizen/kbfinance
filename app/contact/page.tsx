"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useSiteContent } from "@/components/content/SiteContentProvider";

type FormData = {
  name: string;
  phone: string;
  email: string;
  city: string;
  message: string;
  agree: boolean;
};

export default function ContactPage() {
  const { toast } = useToast();
  const { contact } = useSiteContent();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const resData = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(resData?.error || "Submission failed. Please try again.");
      }

      toast({
        title: "Inquiry Submitted!",
        description: "We have received your message and will get back to you shortly.",
        variant: "default",
      });
      reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "There was a problem submitting your inquiry. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="bg-[#0A2540] text-white py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{contact.pageTitle}</h1>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            {contact.pageSubtitle}
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold text-[#0A2540] mb-8">{contact.heading}</h2>
              <p className="text-gray-600 mb-12 text-lg">
                {contact.intro}
              </p>

              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#1952B3]/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-[#1952B3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0A2540] mb-1">{contact.addressLabel}</h3>
                    <p className="text-gray-600 whitespace-pre-line">{contact.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#1952B3]/10 flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-[#1952B3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0A2540] mb-1">{contact.phoneLabel}</h3>
                    <p className="text-gray-600">{contact.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#1952B3]/10 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-[#1952B3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0A2540] mb-1">{contact.emailLabel}</h3>
                    <div className="text-[#1952B3] flex flex-col gap-1">
                      {contact.email.split('\n').map((e, i) => (
                        <a key={i} href={`mailto:${e.trim()}`} className="hover:underline">
                          {e.trim()}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#1952B3]/10 flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-[#1952B3]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#0A2540] mb-1">{contact.hoursLabel}</h3>
                    <p className="text-gray-600 whitespace-pre-line">{contact.hours}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-bl-full -z-10"></div>
              
              <h2 className="text-2xl font-bold text-[#0A2540] mb-6">{contact.formTitle}</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" {...register("name", { required: true })} placeholder="John Doe" />
                    {errors.name && <span className="text-xs text-red-500">Name is required</span>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Mobile Number *</Label>
                    <Input id="phone" {...register("phone", { required: true })} placeholder="831 876 3728" />
                    {errors.phone && <span className="text-xs text-red-500">Phone is required</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" {...register("email")} placeholder="john@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" {...register("city", { required: true })} placeholder="Varanasi" />
                    {errors.city && <span className="text-xs text-red-500">City is required</span>}
                  </div>
                </div>


                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" {...register("message")} placeholder="How can we help you?" className="min-h-[120px]" />
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox 
                    id="agree" 
                    onCheckedChange={(checked) => setValue("agree", checked as boolean)} 
                    required 
                  />
                  <Label htmlFor="agree" className="text-sm font-normal text-gray-600 leading-tight">
                    I agree to the website's Privacy Policy and consent to being contacted regarding my enquiry.
                  </Label>
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full bg-[#1952B3] hover:bg-[#0A2540] text-white h-12 text-lg rounded-xl">
                  {isSubmitting ? "Submitting..." : "Submit Inquiry"}
                </Button>
              </form>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
