"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Phone, User } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Field, FieldContent, FieldError, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";

import { useUpdateProfile } from "../hooks/useUserProfile";
import { updateProfileSchema, type UpdateProfileFormData } from "../schemas/user.schemas";
import type { UserProfile } from "../types/user.types";

interface ProfileFormProps {
  user: UserProfile;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name || "",
      phone: user.phone || "",
    },
  });

  const onSubmit = (data: UpdateProfileFormData) => {
    updateProfile(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Update your personal details and contact information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <Field>
            <FieldLabel htmlFor="name">
              <User className="w-4 h-4 inline mr-2" />
              Full Name
            </FieldLabel>
            <FieldContent>
              <Input id="name" placeholder="Enter your full name" {...register("name")} />
              <FieldError errors={[errors.name]} />
            </FieldContent>
          </Field>

          {/* Email (Read-only) */}
          <Field>
            <FieldLabel htmlFor="email">
              <Mail className="w-4 h-4 inline mr-2" />
              Email Address
            </FieldLabel>
            <FieldContent>
              <Input id="email" type="email" value={user.email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </FieldContent>
          </Field>

          {/* Phone */}
          <Field>
            <FieldLabel htmlFor="phone">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone Number
            </FieldLabel>
            <FieldContent>
              <Input id="phone" type="tel" placeholder="+962 79 123 4567" {...register("phone")} />
              <FieldError errors={[errors.phone]} />
            </FieldContent>
          </Field>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="submit" disabled={!isDirty || isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
