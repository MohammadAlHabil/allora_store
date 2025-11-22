/**
 * Wishlist Feature
 * Barrel exports for wishlist feature
 */

// Types
export type { WishlistItem, WishlistProduct, WishlistResponse } from "./types/wishlist.types";

// Components
export { WishlistButton } from "./components/WishlistButton";
export { WishlistIcon } from "./components/WishlistIcon";

// Hooks
export {
  useWishlist,
  useToggleWishlist,
  useWishlistCount,
  useMergeWishlist,
} from "./hooks/useWishlist";
