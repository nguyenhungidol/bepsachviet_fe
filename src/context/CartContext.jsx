import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import { useAuth } from "./AuthContext";
import { getStoredToken } from "../services/userService";
import { validateCartItems } from "../services/productService";
import {
  // Local storage functions
  getLocalCart,
  clearLocalCart,
  addToLocalCart,
  updateLocalCartItem,
  removeFromLocalCart,
  // API functions
  fetchCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart as clearCartAPI,
  syncCart,
} from "../services/cartService";

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// Helper to wait for token to be available
const waitForToken = (maxAttempts = 10, interval = 100) => {
  return new Promise((resolve) => {
    let attempts = 0;
    const check = () => {
      const token = getStoredToken();
      if (token) {
        resolve(token);
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(check, interval);
      } else {
        resolve(null);
      }
    };
    check();
  });
};

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], totalItems: 0, totalPrice: 0 });
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [validating, setValidating] = useState(false);
  const [invalidItems, setInvalidItems] = useState([]); // Items that are inactive/unavailable

  // Track previous auth state to detect login
  const prevAuthRef = useRef(isAuthenticated);
  const syncAttemptedRef = useRef(false);

  // Format price helper
  const formatPrice = useCallback((price) => {
    if (price === null || price === undefined) return "LIÊN HỆ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);
  }, []);

  // Helper to recalculate cart totals - always returns new object/array references
  const calculateCartTotals = useCallback((items) => {
    const itemsCopy = items.map((item) => ({ ...item }));
    const totalItems = itemsCopy.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );
    const totalPrice = itemsCopy.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0
    );
    return { items: itemsCopy, totalItems, totalPrice };
  }, []);

  // Load cart based on auth state
  const loadCart = useCallback(async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        const serverCart = await fetchCart();
        setCart(serverCart);
      } else {
        // Use local storage for guests
        const localItems = getLocalCart();
        setCart(calculateCartTotals(localItems));
      }
    } catch (error) {
      console.error("Failed to load cart", error);
      // If API fails for authenticated user, show local cart as fallback
      if (isAuthenticated) {
        const localItems = getLocalCart();
        setCart(calculateCartTotals(localItems));
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, calculateCartTotals]);

  // Sync local cart to server when user logs in
  const syncLocalCartToServer = useCallback(async () => {
    const token = await waitForToken();
    if (!token) {
      console.error("No token available after login");
      const localItems = getLocalCart();
      setCart(calculateCartTotals(localItems));
      return;
    }

    const localItems = getLocalCart();

    setLoading(true);
    try {
      // 1. Try to fetch existing server cart first
      const serverCart = await fetchCart();

      // 2. If we have local items, sync them
      if (localItems.length > 0) {
        setSyncing(true);
        try {
          const itemsToSync = localItems.map((item) => ({
            productId: item.productId || item.id,
            quantity: item.quantity || 1,
          }));

          // Call sync API
          await syncCart(itemsToSync);

          // IMPORTANT: Fetch cart again after sync to get the final merged state
          const finalCart = await fetchCart();
          setCart(finalCart);

          clearLocalCart();
          toast.success("Đã đồng bộ giỏ hàng của bạn!");
        } catch (syncError) {
          console.warn("Sync failed, keeping server cart", syncError);
          setCart(serverCart);
        } finally {
          setSyncing(false);
        }
      } else {
        // No local items, just use server cart
        setCart(serverCart);
      }
    } catch (error) {
      console.warn("Cart API not available, using localStorage", error);
      setCart(calculateCartTotals(localItems));
    } finally {
      setLoading(false);
    }
  }, [calculateCartTotals]);

  // Add item to cart
  const addItem = useCallback(
    async (product, quantity = 1) => {
      // Check if product is active (not soft deleted)
      if (product.isActive === false || product.active === false) {
        toast.error(`Sản phẩm "${product.name}" không còn kinh doanh!`);
        return;
      }

      // Check stock quantity before adding
      const stockQuantity = product.stockQuantity;
      if (
        stockQuantity !== null &&
        stockQuantity !== undefined &&
        stockQuantity <= 0
      ) {
        toast.error(`Sản phẩm "${product.name}" đã hết hàng!`);
        return;
      }

      // Check if product already exists in cart
      const productId = product.productId || product.id;
      const existingItem = cart.items.find(
        (item) => (item.productId || item.id) === productId
      );
      const currentQtyInCart = existingItem ? existingItem.quantity : 0;
      const totalRequestedQty = currentQtyInCart + quantity;

      // Check if total quantity exceeds available stock
      if (
        stockQuantity !== null &&
        stockQuantity !== undefined &&
        totalRequestedQty > stockQuantity
      ) {
        const availableToAdd = stockQuantity - currentQtyInCart;
        if (availableToAdd <= 0) {
          toast.warning(`Đã đạt số lượng tối đa trong kho!`);
          return;
        }
        toast.warning(
          `Chỉ còn ${availableToAdd} sản phẩm có thể thêm vào giỏ!`
        );
        quantity = availableToAdd;
      }

      try {
        if (isAuthenticated) {
          const productId = product.productId || product.id;
          try {
            // --- FIX: Gọi API thêm, sau đó gọi lại fetchCart ---
            await addCartItem(productId, quantity);

            // Lấy lại toàn bộ giỏ hàng mới nhất từ server
            const freshCart = await fetchCart();
            setCart(freshCart);
          } catch (apiError) {
            console.warn("API cart failed, using localStorage", apiError);
            const updatedItems = addToLocalCart(product, quantity);
            const newCart = calculateCartTotals(updatedItems);
            setCart(newCart);
          }
        } else {
          // Guest logic
          const updatedItems = addToLocalCart(product, quantity);
          const newCart = calculateCartTotals(updatedItems);
          setCart({ ...newCart });
        }
        toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
      } catch (error) {
        console.error("Failed to add item", error);
        toast.error("Không thể thêm sản phẩm vào giỏ hàng.");
      }
    },
    [isAuthenticated, calculateCartTotals, cart.items]
  );

  // Update item quantity
  const updateItem = useCallback(
    async (itemId, quantity, stockQuantity = null) => {
      console.log("[CartContext] updateItem called:", {
        itemId,
        quantity,
        stockQuantity,
      });

      // Ensure minimum quantity is 1
      if (quantity < 1) {
        quantity = 1;
      }

      // Validate quantity against stock (only if stockQuantity is known)
      if (
        stockQuantity !== null &&
        stockQuantity !== undefined &&
        quantity > stockQuantity
      ) {
        toast.warning(`Chỉ còn ${stockQuantity} sản phẩm trong kho!`, {
          toastId: `stock-limit-${itemId}`, // Prevent duplicate toasts
        });
        return; // Don't proceed - just show the warning
      }

      // Find current item to check if quantity actually changed
      const currentItem = cart.items.find(
        (item) => (item.itemId || item.productId) === itemId
      );

      console.log("[CartContext] currentItem:", currentItem);

      if (currentItem && currentItem.quantity === quantity) {
        console.log("[CartContext] No change needed, returning");
        return; // No change needed
      }

      try {
        if (isAuthenticated) {
          try {
            console.log("[CartContext] Calling API updateCartItem...");
            // --- FIX: Gọi API update, sau đó gọi lại fetchCart ---
            await updateCartItem(itemId, quantity);

            // Lấy lại toàn bộ giỏ hàng mới nhất
            console.log("[CartContext] Fetching fresh cart...");
            const freshCart = await fetchCart();
            console.log("[CartContext] Fresh cart received:", freshCart);
            setCart(freshCart);
          } catch (apiError) {
            console.warn("[CartContext] API cart failed:", apiError);
            // Keep current cart state on error - don't modify
            toast.warning(`Đã đạt số lượng tối đa trong kho!`);
          }
        } else {
          const updatedItems = updateLocalCartItem(itemId, quantity);
          setCart(calculateCartTotals(updatedItems));
        }
      } catch (error) {
        console.error("[CartContext] Failed to update item", error);
        toast.error("Không thể cập nhật số lượng.");
      }
    },
    [isAuthenticated, calculateCartTotals, cart.items]
  );

  // Remove item from cart
  const removeItem = useCallback(
    async (itemId) => {
      try {
        if (isAuthenticated) {
          try {
            // --- FIX: Gọi API xóa, sau đó gọi lại fetchCart ---
            await removeCartItem(itemId);

            // Lấy lại toàn bộ giỏ hàng mới nhất
            const freshCart = await fetchCart();
            setCart(freshCart);
          } catch (apiError) {
            console.warn("API cart failed, using localStorage", apiError);
            const updatedItems = removeFromLocalCart(itemId);
            setCart(calculateCartTotals(updatedItems));
          }
        } else {
          const updatedItems = removeFromLocalCart(itemId);
          setCart(calculateCartTotals(updatedItems));
        }
        toast.success("Đã xóa sản phẩm khỏi giỏ hàng.");
      } catch (error) {
        console.error("Failed to remove item", error);
        toast.error("Không thể xóa sản phẩm.");
      }
    },
    [isAuthenticated, calculateCartTotals]
  );

  // Clear entire cart
  const clearAllItems = useCallback(async () => {
    try {
      if (isAuthenticated) {
        await clearCartAPI();
        // Reset state
        setCart({ items: [], totalItems: 0, totalPrice: 0 });
      } else {
        clearLocalCart();
        setCart({ items: [], totalItems: 0, totalPrice: 0 });
      }
      toast.success("Đã xóa tất cả sản phẩm trong giỏ hàng.");
    } catch (error) {
      console.error("Failed to clear cart", error);
      toast.error("Không thể xóa giỏ hàng.");
    }
  }, [isAuthenticated]);

  // Validate cart items against current product status
  const validateCart = useCallback(async () => {
    if (cart.items.length === 0) {
      setInvalidItems([]);
      return { valid: [], invalid: [], hasInvalidItems: false };
    }

    setValidating(true);
    try {
      const { valid, invalid } = await validateCartItems(cart.items);
      setInvalidItems(invalid);

      if (invalid.length > 0) {
        const inactiveCount = invalid.filter(
          (i) => i.reason === "INACTIVE" || i.reason === "NOT_FOUND"
        ).length;
        const outOfStockCount = invalid.filter(
          (i) => i.reason === "OUT_OF_STOCK"
        ).length;
        const insufficientCount = invalid.filter(
          (i) => i.reason === "INSUFFICIENT_STOCK"
        ).length;

        if (inactiveCount > 0) {
          toast.warning(`${inactiveCount} sản phẩm không còn kinh doanh.`);
        }
        if (outOfStockCount > 0) {
          toast.warning(`${outOfStockCount} sản phẩm đã hết hàng.`);
        }
        if (insufficientCount > 0) {
          toast.warning(`${insufficientCount} sản phẩm không đủ số lượng.`);
        }
      }

      return { valid, invalid, hasInvalidItems: invalid.length > 0 };
    } catch (error) {
      console.error("Failed to validate cart", error);
      return { valid: cart.items, invalid: [], hasInvalidItems: false };
    } finally {
      setValidating(false);
    }
  }, [cart.items]);

  // Check if an item is invalid
  const isItemInvalid = useCallback(
    (itemId) => {
      const productId = itemId;
      return invalidItems.some(
        (item) => (item.productId || item.id) === productId
      );
    },
    [invalidItems]
  );

  // Get invalid item info
  const getInvalidItemInfo = useCallback(
    (itemId) => {
      const productId = itemId;
      return invalidItems.find(
        (item) => (item.productId || item.id) === productId
      );
    },
    [invalidItems]
  );

  // Load cart on mount and when auth changes
  useEffect(() => {
    const justLoggedIn = !prevAuthRef.current && isAuthenticated;
    prevAuthRef.current = isAuthenticated;

    if (justLoggedIn && !syncAttemptedRef.current) {
      syncAttemptedRef.current = true;
      syncLocalCartToServer();
    } else if (!isAuthenticated) {
      syncAttemptedRef.current = false;
      loadCart();
    } else if (isAuthenticated && !syncAttemptedRef.current) {
      loadCart();
    }
  }, [isAuthenticated, loadCart, syncLocalCartToServer]);

  const value = useMemo(
    () => ({
      cart,
      items: cart.items,
      totalItems: cart.totalItems,
      totalPrice: cart.totalPrice,
      loading,
      syncing,
      validating,
      invalidItems,
      addItem,
      updateItem,
      removeItem,
      clearAllItems,
      refreshCart: loadCart,
      validateCart,
      isItemInvalid,
      getInvalidItemInfo,
      formatPrice,
    }),
    [
      cart,
      loading,
      syncing,
      validating,
      invalidItems,
      addItem,
      updateItem,
      removeItem,
      clearAllItems,
      loadCart,
      validateCart,
      isItemInvalid,
      getInvalidItemInfo,
      formatPrice,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
