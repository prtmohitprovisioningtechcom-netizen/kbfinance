"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertCircle } from "lucide-react";

type FormData = {
  name: string;
  phone: string;
  email: string;
  city: string;
  service?: string;
  message: string;
};

export default function EnquiryModal({ 
  triggerText, 
  triggerClassName,
  onClick
}: { 
  triggerText: string;
  triggerClassName?: string;
  onClick?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agree, setAgree] = useState(true);
  const [agreeError, setAgreeError] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    if (!agree) {
      setAgreeError(true);
      return;
    }
    setAgreeError(false);
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          service_required: triggerText?.replace(/^(Apply for|Open an|Start an)\s+/i, '').trim(),
          agree: true,
        }),
      });

      const resData = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(resData?.error || "Problem submitting inquiry. Please try again.");
      }

      toast({
        title: "Inquiry Submitted!",
        description: "We will get back to you shortly.",
      });
      reset();
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Problem submitting inquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        className={triggerClassName} 
        onClick={(e) => {
          if (onClick) onClick();
        }}
      >
        {triggerText}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#0A2540]">Send an Inquiry</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="modal-name">Full Name *</Label>
              <Input id="modal-name" {...register("name", { required: "Name is required" })} placeholder="John Doe" />
              {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="modal-phone">Mobile Number *</Label>
              <Input id="modal-phone" {...register("phone", { required: "Phone is required" })} placeholder="831 876 3728" />
              {errors.phone && <span className="text-xs text-red-500">{errors.phone.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="modal-email">Email Address</Label>
              <Input id="modal-email" type="email" {...register("email")} placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modal-city">City *</Label>
              <Input id="modal-city" {...register("city", { required: "City is required" })} placeholder="Varanasi" />
              {errors.city && <span className="text-xs text-red-500">{errors.city.message}</span>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="modal-message">Message</Label>
            <Textarea id="modal-message" {...register("message")} placeholder="How can we help you?" className="min-h-[80px]" />
          </div>

          <div className="space-y-1 pt-1">
            <div className="flex items-start gap-2">
              <Checkbox 
                id="modal-agree" 
                checked={agree}
                onCheckedChange={(checked) => {
                  setAgree(Boolean(checked));
                  if (checked) setAgreeError(false);
                }}
              />
              <Label htmlFor="modal-agree" className="text-xs text-gray-600 leading-tight cursor-pointer">
                I agree to the Privacy Policy and consent to being contacted.
              </Label>
            </div>
            {agreeError && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5" /> Please accept the terms to proceed.
              </p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full bg-[#1952B3] hover:bg-[#0A2540] text-white mt-4">
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
              </span>
            ) : (
              "Submit Inquiry"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
