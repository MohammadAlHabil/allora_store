"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { redirect } from "next/navigation";
import { useEffect, useActionState } from "react";
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
import { ActionResponse } from "@/shared/types";

// Accept any Zod schema shape. We keep the generic on the component to type the
// react-hook-form values, but allow the runtime schema to be any Zod schema
// (ZodTypeAny) to avoid strict _input/_output type mismatches from Zod's
// internal generics.
type ZodSchemaType = ZodTypeAny;

type FieldSpec<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  type?: string;
  placeholder?: string;
  description?: string;
};

type SubmitAction = (formData: FormData) => Promise<ActionResponse>;

type AuthFormProps<T extends FieldValues> = {
  schema: ZodSchemaType;
  fields: FieldSpec<T>[];
  submitLabel: string;
  children?: React.ReactNode;
  submitAction: SubmitAction;
};

export function AuthForm<T extends FieldValues>({
  schema,
  fields,
  submitLabel,
  children,
  submitAction,
}: AuthFormProps<T>) {
  const actionWrapper = ((
    maybeStateOrFormData: ActionResponse | undefined,
    maybeFormData?: FormData
  ) => {
    const fd =
      maybeFormData ??
      (maybeStateOrFormData instanceof FormData
        ? (maybeStateOrFormData as unknown as FormData)
        : undefined);
    return submitAction(fd ?? new FormData());
  }) as (
    state: ActionResponse | undefined,
    formData?: FormData
  ) => ActionResponse | Promise<ActionResponse | undefined> | undefined;

  const [state, action, isPending] = useActionState(actionWrapper, undefined);

  const form = useForm<T>({
    // cast schema to any to avoid zod/resolver strict generic mismatch
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any) as Resolver<T>,
  });

  // When the action returns server-side field errors, attach them to the
  // corresponding form fields so they render inline next to each input.
  useEffect(() => {
    if (!state) return;

    // clear previous server errors when a new request is pending/successful
    if (isPending) return;

    const fieldErrors = (state as Partial<ActionResponse>)?.fieldErrors;
    if (fieldErrors && typeof fieldErrors === "object") {
      Object.entries(fieldErrors).forEach(([name, message]) => {
        if (message) {
          // react-hook-form expects the field name as a path; cast via unknown->Path<T>
          form.setError(name as unknown as Path<T>, { type: "server", message });
        }
      });
    }
  }, [state, isPending, form]);

  if (state?.success && !isPending && submitLabel === "Sign In") {
    redirect("/");
  }

  function RenderField({ spec }: { spec: FieldSpec<T> }) {
    return (
      <Controller
        key={String(spec.name)}
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
                  value={(f.value as unknown as string) ?? ""}
                />
                {spec.description && <FieldDescription>{spec.description}</FieldDescription>}
                <FieldError errors={fieldState?.error ? [fieldState.error] : undefined} />
              </FieldContent>
            </Field>
          );
        }}
      />
    );
  }

  return (
    <FormProvider {...form}>
      <form action={action} className="space-y-6">
        {fields.map((field) => (
          <RenderField key={String(field.name)} spec={field} />
        ))}
        {children}
        {state?.message && (
          <div className="text-sm font-medium text-destructive">{state.message}</div>
        )}
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Submitting..." : submitLabel}
        </Button>
      </form>
    </FormProvider>
  );
}
