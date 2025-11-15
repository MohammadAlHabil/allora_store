import { NextResponse } from "next/server";

const CATEGORIES = [
  {
    id: "cat-fashion",
    name: "Fashion",
    slug: "fashion",
    image: "/images/cat-fashion.jpg",
    subcategories: ["Dresses", "Tops", "Pants", "Skirts"],
  },
  {
    id: "cat-shoes",
    name: "Shoes",
    slug: "shoes",
    image: "/images/cat-shoes.jpg",
    subcategories: [],
  },
  {
    id: "cat-beauty",
    name: "Beauty",
    slug: "beauty",
    image: "/images/cat-beauty.jpg",
    subcategories: ["Makeup", "Skincare", "Haircare", "Perfumes"],
  },
  {
    id: "cat-accessories",
    name: "Accessories",
    slug: "accessories",
    image: "/images/cat-accessories.jpg",
    subcategories: ["Watches", "Scarves", "Sunglasses", "Belts"],
  },
  { id: "cat-bags", name: "Bags", slug: "bags", image: "/images/cat-bags.jpg", subcategories: [] },
  {
    id: "cat-sports",
    name: "Sportswear",
    slug: "sportswear",
    image: "/images/cat-sportswear.jpg",
    subcategories: [],
  },
];

export async function GET() {
  return NextResponse.json(CATEGORIES);
}
