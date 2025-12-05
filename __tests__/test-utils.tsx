import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React, { ReactElement } from "react";

// Mock session for testing
const mockSession = {
  user: {
    id: "test-user-id",
    name: "Test User",
    email: "test@example.com",
    image: null,
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

// Create a new QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

interface AllProvidersProps {
  children: React.ReactNode;
}

function AllProviders({ children }: AllProvidersProps) {
  const queryClient = createTestQueryClient();

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  session?: typeof mockSession | null;
}

function customRender(ui: ReactElement, options: CustomRenderOptions = {}) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { session, ...renderOptions } = options;
  return render(ui, {
    wrapper: ({ children }) => <AllProviders>{children}</AllProviders>,
    ...renderOptions,
  });
}

// Re-export everything from testing-library
export * from "@testing-library/react";

// Override render with our custom render
export { customRender as render };

// Export userEvent for convenience
export { userEvent };

// Export mock session for tests that need it
export { mockSession };

// Helper to create a mock for server actions
export function createMockServerAction<T = unknown>(resolvedValue: T = null as T) {
  return jest.fn().mockResolvedValue(resolvedValue);
}

// Helper to wait for async operations
export async function waitForLoadingToFinish() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

// Mock cart item for testing
export const mockCartItem = {
  id: "cart-item-1",
  productId: "product-1",
  variantId: null,
  quantity: 2,
  title: "Test Product",
  slug: "test-product",
  sku: "TEST-SKU-001",
  unitPrice: 29.99,
  totalPrice: 59.98,
  imageUrl: "/images/test-product.jpg",
};

// Mock product for testing
export const mockProduct = {
  id: "product-1",
  name: "Test Product",
  slug: "test-product",
  description: "A test product description",
  shortDesc: "Short description",
  sku: "TEST-SKU-001",
  price: 29.99,
  compareAtPrice: 39.99,
  currency: "USD",
  isAvailable: true,
  isArchived: false,
  type: "PHYSICAL" as const,
  avgRating: 4.5,
  reviewCount: 100,
  images: [{ url: "/images/test-product.jpg", alt: "Test Product" }],
  categories: [{ category: { id: "cat-1", name: "Test Category" } }],
  variants: [
    {
      id: "variant-1",
      sku: "VAR-001",
      price: 29.99,
      compareAtPrice: null,
      stock: 10,
      isDefault: true,
      optionValues: { size: "M", color: "Blue" },
    },
    {
      id: "variant-2",
      sku: "VAR-002",
      price: 34.99,
      compareAtPrice: null,
      stock: 5,
      isDefault: false,
      optionValues: { size: "L", color: "Red" },
    },
  ],
};

// Mock wishlist item
export const mockWishlistItem = {
  id: "product-1",
  name: "Test Product",
  slug: "test-product",
  price: 29.99,
  imageUrl: "/images/test-product.jpg",
};
