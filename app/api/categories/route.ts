import { NextResponse } from "next/server";

const CATEGORIES = [
  {
    id: "cat_fashion",
    name: "Fashion",
    slug: "fashion",
    image: "/images/cat-fashion.jpg",
    subcategories: ["Dresses", "Tops", "Pants", "Skirts"],
  },
  {
    id: "cat_shoes",
    name: "Shoes",
    slug: "shoes",
    image: "/images/cat-shoes.jpg",
    subcategories: [],
  },
  {
    id: "cat_beauty",
    name: "Beauty",
    slug: "beauty",
    image: "/images/cat-beauty.jpg",
    subcategories: ["Makeup", "Skincare", "Haircare", "Perfumes"],
  },
  {
    id: "cat_accessories",
    name: "Accessories",
    slug: "accessories",
    image: "/images/cat-accessories.jpg",
    subcategories: ["Watches", "Scarves", "Sunglasses", "Belts"],
  },
  { id: "cat_bags", name: "Bags", slug: "bags", image: "/images/cat-bags.jpg", subcategories: [] },
  {
    id: "cat_sports",
    name: "Sportswear",
    slug: "sportswear",
    image: "/images/cat-sportswear.jpg",
    subcategories: [],
  },
];

export async function GET() {
  return NextResponse.json(CATEGORIES);
}
