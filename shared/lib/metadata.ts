import { Metadata } from "next";

export function constructMetadata({
  title = "Allora Store - Fashion & Lifestyle",
  description = "Your premier destination for fashion, beauty, and lifestyle products. Discover the latest trends and timeless classics at Allora Store.",
  image = "/og-image.png",
  icons = "/favicon/favicon.ico",
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title: {
      template: "%s | Allora Store",
      default: title,
    },
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
        },
      ],
      siteName: "Allora Store",
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@allorastore",
    },
    icons,
    metadataBase: new URL("https://allora-store.vercel.app"),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}
