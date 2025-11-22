import { NextResponse } from "next/server";

import { contactFormSchema } from "@/features/contact/validations/contact.schema";
import { sendContactEmail } from "@/shared/services/emails";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate the data
    const validatedData = contactFormSchema.parse(body);

    // Send email notification
    await sendContactEmail({
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email,
      phone: validatedData.phone,
      subject: validatedData.subject,
      message: validatedData.message,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for contacting us! We'll get back to you within 24 hours.",
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
