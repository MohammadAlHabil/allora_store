import { zodResolver } from "@hookform/resolvers/zod";
import { redirect } from "next/navigation";
import { useActionState } from "react";
import { useForm, FormProvider, Resolver, Path, FieldValues } from "react-hook-form";
import { ZodType } from "zod";
import { ZodTypeDef } from "zod/v3";
import { Button } from "@/shared/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { ActionResponse } from "@/shared/types";

type ZodSchemaType<T extends FieldValues> = ZodType<T, ZodTypeDef>;
type AuthFormProps<T extends FieldValues> = {
  schema: ZodSchemaType<T>;
  // onSubmit: (data: T) => Promise<{ success?: boolean; errors?: any; message?: string }>;
  // onSubmit: (data: T) => Promise<ActionResponse<T>>;
  fields: { name: Path<T>; label: string; type?: string; placeholder?: string }[];
  submitLabel: string;
  children?: React.ReactNode;
  // submitAction?: (formData: FormData) => Promise<any>;
  submitAction: (formData: FormData) => Promise<ActionResponse>;
};

export function AuthForm<T extends FieldValues>({
  schema,
  // onSubmit,
  fields,
  submitLabel,
  children,
  submitAction,
}: AuthFormProps<T>) {
  // Wrap submitAction so it handles the formData regardless of whether the
  // action wrapper calls the target with (formData) or (state, formData).
  const [state, action, isPending] = useActionState(
    ((maybeState: ActionResponse | undefined, maybeFormData?: FormData) => {
      // prefer the FormData argument
      const fd =
        maybeFormData ??
        (maybeState instanceof FormData ? (maybeState as unknown as FormData) : undefined);
      // If fd is undefined, call submitAction with an empty FormData to allow
      // the server action to return a helpful error instead of throwing.
      return submitAction(fd ?? new FormData());
    }) as unknown as (
      state: ActionResponse | undefined,
      formData: FormData
    ) => ActionResponse | Promise<ActionResponse | undefined> | undefined,
    undefined
  );

  const form = useForm<T>({
    resolver: zodResolver(schema) as unknown as Resolver<T>,
  });

  // const handleSubmit = async (data: T) => {
  //   try {
  //     const result = await onSubmit(data);
  //     if (result.success) {
  //       toast.success(result.message);
  //     } else {
  //       form.setError("root", { message: result.errors?._form?.[0] });
  //     }
  //   } catch (error: any) {
  //     toast.error(error.message || "An error occurred");
  //   }
  // };
  if (state?.success && !isPending && submitLabel === "Sign In") {
    redirect("/");
  }

  return (
    <FormProvider {...form}>
      <form action={action} className="space-y-4">
        {fields.map((field) => (
          <FormField
            key={field.name as string}
            control={form.control}
            name={field.name}
            render={({ field: f }) => {
              const { name, onChange, onBlur, value, ref } = f;
              return (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <FormControl>
                    <Input
                      type={field.type || "text"}
                      placeholder={field.placeholder}
                      name={name}
                      onChange={onChange}
                      onBlur={onBlur}
                      value={(value as unknown as string) ?? ""}
                      ref={ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
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
