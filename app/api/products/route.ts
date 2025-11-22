import { NextResponse } from "next/server";

const PRODUCTS = [
  {
    id: "p1",
    name: "Floral Midi Dress",
    slug: "floral-midi-dress",
    price: 79.0,
    image: "/images/products/dress1.jpg",
    rating: 4.6,
    isBestSeller: true,
    createdAt: "2025-11-01",
  },
  {
    id: "p2",
    name: "Leather Ankle Boots",
    slug: "leather-ankle-boots",
    price: 129.0,
    image: "/images/products/boots1.jpg",
    rating: 4.8,
    isBestSeller: true,
    createdAt: "2025-10-20",
  },
  {
    id: "p3",
    name: "Silk Scarf",
    slug: "silk-scarf",
    price: 39.0,
    image: "/images/products/scarf1.jpg",
    rating: 4.4,
    isBestSeller: false,
    createdAt: "2025-11-10",
  },
  {
    id: "p4",
    name: "Statement Necklace",
    slug: "statement-necklace",
    price: 59.99,
    image: "/images/products/necklace1.jpg",
    rating: 4.7,
    isBestSeller: false,
    createdAt: "2025-11-12",
  },
  {
    id: "p5",
    name: "Everyday Tote Bag",
    slug: "everyday-tote",
    price: 69.0,
    image: "/images/products/tote1.jpg",
    rating: 4.5,
    isBestSeller: true,
    createdAt: "2025-09-30",
  },
  {
    id: "p6",
    name: "Satin Camisole",
    slug: "satin-camisole",
    price: 29.0,
    image: "/images/products/cami1.jpg",
    rating: 4.2,
    isBestSeller: false,
    createdAt: "2025-11-13",
  },
  {
    id: "p7",
    name: "High-waist Jeans",
    slug: "high-waist-jeans",
    price: 89.0,
    image: "/images/products/jeans1.jpg",
    rating: 4.3,
    isBestSeller: true,
    createdAt: "2025-10-05",
  },
  {
    id: "p8",
    name: "Chunky Knit Sweater",
    slug: "chunky-knit-sweater",
    price: 99.0,
    image: "/images/products/sweater1.jpg",
    rating: 4.6,
    isBestSeller: false,
    createdAt: "2025-11-05",
  },
  {
    id: "p9",
    name: "Strappy Sandals",
    slug: "strappy-sandals",
    price: 59.0,
    image: "/images/products/sandals1.jpg",
    rating: 4.1,
    isBestSeller: false,
    createdAt: "2025-11-11",
  },
  {
    id: "p10",
    name: "Classic Blazer",
    slug: "classic-blazer",
    price: 149.0,
    image: "/images/products/blazer1.jpg",
    rating: 4.9,
    isBestSeller: true,
    createdAt: "2025-10-28",
  },
];

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "new";

  let items = [...PRODUCTS];

  if (type === "best") {
    items = items.filter((p) => p.isBestSeller).slice(0, 8);
  } else if (type === "new") {
    items = items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 8);
  } else if (type === "all") {
    // Return all products for shop page
    items = items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  return NextResponse.json(items);
}
