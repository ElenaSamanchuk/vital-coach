export interface ShopItem {
  id: string;
  label: string;
  done: boolean;
  category: "food" | "home" | "care" | "other";
}

export const SHOP_QUICK = [
  { label: "Овощи / фрукты", category: "food" as const },
  { label: "Белок: творог, рыба", category: "food" as const },
  { label: "Средства для уборки", category: "home" as const },
  { label: "Маска / крем", category: "care" as const },
  { label: "Корм питомцу", category: "other" as const },
];

export function parseShopping(raw: string | null | undefined): ShopItem[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ShopItem[];
  } catch {
    return [];
  }
}

export function newShopItem(label: string, category: ShopItem["category"] = "other"): ShopItem {
  return {
    id: `s_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    label,
    done: false,
    category,
  };
}
