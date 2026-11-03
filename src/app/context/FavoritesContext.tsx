"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import { useToast } from "./ToastContext";

interface FavoritesContextType {
  favoriteIds: string[];
  favoriteCount: number;
  loadingIds: Record<string, boolean>;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (productId: string, productTitle?: string) => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session, status } = useSession();
  const { showToast } = useToast();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});

  const refreshFavorites = useCallback(async () => {
    if (status !== "authenticated" || !session?.user?.email) {
      setFavoriteIds([]);
      return;
    }

    try {
      const res = await fetch("/api/favorites");
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        const ids = data
          .filter((item: { _id?: string } | null) => Boolean(item?._id))
          .map((item: { _id: string }) => item._id);
        setFavoriteIds(ids);
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
    }
  }, [session?.user?.email, status]);

  useEffect(() => {
    if (status === "loading") return;
    refreshFavorites();
  }, [status, refreshFavorites]);

  const isFavorite = useCallback(
    (productId: string) => favoriteIds.includes(productId),
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (productId: string, productTitle?: string) => {
      if (status !== "authenticated" || !session?.user?.email) {
        showToast({
          message: "Please sign in to save favorites",
          type: "info",
          actionLabel: "Sign In",
          actionHref: "/login",
        });
        return;
      }

      if (loadingIds[productId]) return;

      const wasFavorite = favoriteIds.includes(productId);
      const nextFavorite = !wasFavorite;

      // Optimistic update so UI & Header badge update immediately
      setFavoriteIds((prev) =>
        nextFavorite
          ? [...prev, productId]
          : prev.filter((id) => id !== productId)
      );
      setLoadingIds((prev) => ({ ...prev, [productId]: true }));

      try {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });

        const data = await res.json();

        if (!res.ok) {
          // Revert on error
          setFavoriteIds((prev) =>
            wasFavorite
              ? [...prev, productId]
              : prev.filter((id) => id !== productId)
          );
          showToast({
            message: data.message || "Could not update favorites",
            type: "error",
          });
          return;
        }

        const label = productTitle ? `"${productTitle}"` : "Item";
        showToast({
          message: data.isFavorite
            ? `${label} saved to favorites`
            : `${label} removed from favorites`,
          type: "success",
          actionLabel: data.isFavorite ? "View" : undefined,
          actionHref: data.isFavorite ? "/favorites" : undefined,
        });
      } catch (error) {
        console.error("Error toggling favorite:", error);
        setFavoriteIds((prev) =>
          wasFavorite
            ? [...prev, productId]
            : prev.filter((id) => id !== productId)
        );
        showToast({
          message: "Network error while updating favorites",
          type: "error",
        });
      } finally {
        setLoadingIds((prev) => ({ ...prev, [productId]: false }));
      }
    },
    [favoriteIds, loadingIds, session?.user?.email, showToast, status]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        favoriteCount: favoriteIds.length,
        loadingIds,
        isFavorite,
        toggleFavorite,
        refreshFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};

