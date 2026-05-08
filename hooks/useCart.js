"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

const CART_KEY = "valerga_cart";

function getStoredCart() {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    console.error("Error guardando carrito");
  }
}

export function useCart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carga inicial desde localStorage
  useEffect(() => {
    setItems(getStoredCart());
    setLoading(false);
  }, []);

  // Sincroniza con localStorage cada vez que cambian los items
  useEffect(() => {
    if (!loading) {
      saveCart(items);
    }
  }, [items, loading]);

  // Agregar producto al carrito
  const addItem = useCallback((product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + quantity } : item,
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          sku: product.sku,
          name: product.name,
          brand: product.brand,
          price: product.price,
          unit: product.unit,
          image_url: product.images?.[0] ?? null,
          qty: quantity,
        },
      ];
    });

    // Toast fuera del setState
    setTimeout(() => {
      toast.success(product.name + " agregado al carrito");
    }, 0);
  }, []);

  // Quitar un producto completamente
  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
    setTimeout(() => {
      toast.success("Producto eliminado del carrito");
    }, 0);
  }, []);

  // Actualizar cantidad de un producto
  const updateQuantity = useCallback(
    (productId, quantity) => {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === productId ? { ...item, qty: quantity } : item,
        ),
      );
    },
    [removeItem],
  );

  // Vaciar carrito
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Cargar items de un pedido anterior (función "repetir pedido")
  const repeatOrder = useCallback((orderItems) => {
    const cartItems = orderItems.map((item) => ({
      id: item.product_id,
      sku: item.sku,
      name: item.name,
      brand: item.brand,
      price: item.unit_price, // precio actual, no el del pedido viejo
      unit: item.unit,
      image_url: item.image_url ?? null,
      qty: item.qty,
    }));

    setItems(cartItems);
    toast.success("Pedido cargado en el carrito");
  }, []);

  // Sincronizar carrito con Supabase al loguear
  // Llámalo después del login exitoso
  const syncWithUser = useCallback(
    async (userId) => {
      if (items.length === 0) return;

      const supabase = createClient();

      // Verificamos que los productos sigan activos y traemos precio actualizado
      const productIds = items.map((item) => item.id);

      const { data: products } = await supabase
        .from("products")
        .select("id, name, price, is_active")
        .in("id", productIds);

      if (!products) return;

      // Filtramos productos que siguen activos y actualizamos precios
      const syncedItems = items.reduce((acc, item) => {
        const current = products.find((p) => p.id === item.id);

        if (!current || !current.is_active) {
          toast.error(`"${item.name}" ya no está disponible y fue removido`);
          return acc;
        }

        if (current.price !== item.price) {
          toast(`El precio de "${item.name}" fue actualizado`, { icon: "ℹ️" });
        }

        return [...acc, { ...item, price: current.price }];
      }, []);

      setItems(syncedItems);
    },
    [items],
  );

  // Totales calculados
  const itemCount = items.reduce((acc, item) => acc + item.qty, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);

  return {
    items,
    loading,
    itemCount,
    subtotal,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    repeatOrder,
    syncWithUser,
  };
}
