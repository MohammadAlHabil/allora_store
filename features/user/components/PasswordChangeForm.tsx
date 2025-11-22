"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, KeyRound, Lock, Shield } from "lucide-react";
import { useState } from "react";
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

import { useChangePassword } from "../hooks/useUserProfile";
import { changePasswordSchema, type ChangePasswordFormData } from "../schemas/user.schemas";

export function PasswordChangeForm() {
  const { mutate: changePassword, isPending } = useChangePassword();
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    changePassword(data, {
      onSuccess: () => {
        reset();
      },
    });
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Change Password
        </CardTitle>
        <CardDescription>Update your password to keep your account secure</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Current Password */}
          <Field>
            <FieldLabel htmlFor="currentPassword">
              <KeyRound className="w-4 h-4 inline mr-2" />
              Current Password
            </FieldLabel>
            <FieldContent>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  placeholder="Enter current password"
                  {...register("currentPassword")}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPasswords.current ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <FieldError errors={[errors.currentPassword]} />
            </FieldContent>
          </Field>

          {/* New Password */}
          <Field>
            <FieldLabel htmlFor="newPassword">
              <Lock className="w-4 h-4 inline mr-2" />
              New Password
            </FieldLabel>
            <FieldContent>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  placeholder="Enter new password"
                  {...register("newPassword")}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <FieldError errors={[errors.newPassword]} />
              <p className="text-xs text-muted-foreground mt-2">
                Must be at least 8 characters with uppercase, lowercase, number, and symbol
              </p>
            </FieldContent>
          </Field>

          {/* Confirm Password */}
          <Field>
            <FieldLabel htmlFor="confirmPassword">
              <Lock className="w-4 h-4 inline mr-2" />
              Confirm New Password
            </FieldLabel>
            <FieldContent>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              <FieldError errors={[errors.confirmPassword]} />
            </FieldContent>
          </Field>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => reset()} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Changing..." : "Change Password"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
