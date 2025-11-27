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
    [isAuthenticated, calculateCartTotals]
  );

  // Update item quantity
  const updateItem = useCallback(
    async (itemId, quantity) => {
      try {
        if (isAuthenticated) {
          try {
            // --- FIX: Gọi API update, sau đó gọi lại fetchCart ---
            await updateCartItem(itemId, quantity);

            // Lấy lại toàn bộ giỏ hàng mới nhất
            const freshCart = await fetchCart();
            setCart(freshCart);
          } catch (apiError) {
            console.warn("API cart failed, using localStorage", apiError);
            const updatedItems = updateLocalCartItem(itemId, quantity);
            setCart(calculateCartTotals(updatedItems));
          }
        } else {
          const updatedItems = updateLocalCartItem(itemId, quantity);
          setCart(calculateCartTotals(updatedItems));
        }
      } catch (error) {
        console.error("Failed to update item", error);
        toast.error("Không thể cập nhật số lượng.");
      }
    },
    [isAuthenticated, calculateCartTotals]
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
      addItem,
      updateItem,
      removeItem,
      clearAllItems,
      refreshCart: loadCart,
      formatPrice,
    }),
    [
      cart,
      loading,
      syncing,
      addItem,
      updateItem,
      removeItem,
      clearAllItems,
      loadCart,
      formatPrice,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
