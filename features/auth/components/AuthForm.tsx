"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm, FormProvider, Resolver, Path, FieldValues, Controller } from "react-hook-form";
import { ZodTypeAny } from "zod";
import { Button } from "@/shared/components/ui/button";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
  FieldDescription,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Result } from "@/shared/lib/errors";
import { cn } from "@/shared/lib/utils";

type ZodSchemaType = ZodTypeAny;

type FieldSpec<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  type?: string;
  placeholder?: string;
  description?: string;
};

type SubmitAction = (formData: FormData) => Promise<Result<null>>;

type AuthFormProps<T extends FieldValues> = {
  schema: ZodSchemaType;
  fields: FieldSpec<T>[];
  submitLabel: string;
  children?: React.ReactNode;
  submitAction: SubmitAction;
  showForgotPasswordLink?: boolean;
};

function RenderField<T extends FieldValues>({
  form,
  spec,
}: {
  form: ReturnType<typeof useForm<T>>;
  spec: FieldSpec<T>;
}) {
  return (
    <Controller
      control={form.control}
      name={spec.name}
      render={({ field: f, fieldState }) => {
        const id = `${String(spec.name)}-field`;

        return (
          <Field data-invalid={!!fieldState?.error} aria-invalid={!!fieldState?.error}>
            <FieldLabel htmlFor={id}>{spec.label}</FieldLabel>
            <FieldContent>
              <Input
                id={id}
                type={spec.type || "text"}
                placeholder={spec.placeholder}
                {...f}
                aria-invalid={!!fieldState?.error}
                value={(f.value as string) ?? ""}
              />
              {spec.description && <FieldDescription>{spec.description}</FieldDescription>}
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </FieldContent>
          </Field>
        );
      }}
    />
  );
}

export function AuthForm<T extends FieldValues>({
  schema,
  fields,
  submitLabel,
  children,
  submitAction,
  showForgotPasswordLink,
}: AuthFormProps<T>) {
  const [state, setState] = useState<Result<null> | undefined>(undefined);
  const [isPending, setIsPending] = useState(false);

  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);

  const form = useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any) as Resolver<T>,
  });

  // Handle server-driven field errors
  useEffect(() => {
    if (!state || state.success || !state.error.fieldErrors) return;

    Object.entries(state.error.fieldErrors).forEach(([name, message]) => {
      form.setError(name as Path<T>, {
        type: "server",
        message,
      });
    });
  }, [state, form]);

  // Handle successful submission redirects
  useEffect(() => {
    if (!state?.success) return;

    if (submitLabel === "Sign In") router.push("/");
    if (submitLabel === "Reset Password") router.push("/signin");
  }, [state, router, submitLabel]);

  const onSubmit = form.handleSubmit(async () => {
    if (!formRef.current) return;
    setIsPending(true);

    try {
      const fd = new FormData(formRef.current);
      const res = await submitAction(fd);
      setState(res);
    } catch (err) {
      // Handle unexpected errors - should not happen with proper error handling
      console.error("Unexpected error in form submission:", err);
    } finally {
      setIsPending(false);
    }
  });

  return (
    <FormProvider {...form}>
      <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
        {fields.map((field) => (
          <RenderField key={String(field.name)} form={form} spec={field} />
        ))}

        {showForgotPasswordLink && (
          <div className="text-sm text-right">
            <Link href="/forgot-password" className="text-blue-600 hover:underline">
              Forgot Password?
            </Link>
          </div>
        )}

        {children}

        {/* Display global message (success or error) */}
        {state && (
          <div
            role={state.success ? "status" : "alert"}
            aria-live="polite"
            className={cn(
              "p-3 rounded-md text-sm font-medium",
              state.success
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            )}
          >
            {state.success ? state.message : state.error.message}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Submitting..." : submitLabel}
        </Button>
      </form>
    </FormProvider>
  );
}
