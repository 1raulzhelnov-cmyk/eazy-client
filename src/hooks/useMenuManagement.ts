import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRestaurant } from './useRestaurant';

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price?: number | null;
  discount_percent?: number | null;
  category_id: string;
  category_name?: string;
  ingredients: string[] | null;
  allergens: string[] | null;
  tags: string[] | null;
  is_available: boolean;
  is_popular: boolean;
  preparation_time: number | null;
  images: string[];
  nutritional_info?: any;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  item_count: number;
}

export const useMenuManagement = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { restaurant } = useRestaurant();

  const fetchCategories = async () => {
    if (!restaurant?.id) return;

    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('sort_order');

      if (error) throw error;

      // Count items for each category
      const categoriesWithCount = await Promise.all(
        data.map(async (category) => {
          const { count } = await supabase
            .from('menu_items')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id);
          
          return {
            ...category,
            item_count: count || 0
          };
        })
      );

      setCategories(categoriesWithCount);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Ошибка загрузки категорий');
    }
  };

  const fetchMenuItems = async () => {
    if (!restaurant?.id) return;

    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          menu_categories!inner(name)
        `)
        .eq('restaurant_id', restaurant.id)
        .order('name');

      if (error) throw error;

      // Get images for each menu item
      const itemsWithImages = await Promise.all(
        data.map(async (item) => {
          const { data: images } = await supabase
            .from('menu_item_images')
            .select('image_url')
            .eq('menu_item_id', item.id)
            .order('sort_order');

          return {
            ...item,
            category_name: item.menu_categories?.name || '',
            images: images?.map(img => img.image_url) || [],
            ingredients: item.ingredients || [],
            allergens: item.allergens || [],
            tags: item.tags || []
          } as MenuItem;
        })
      );

      setMenuItems(itemsWithImages);
    } catch (err) {
      console.error('Error fetching menu items:', err);
      setError('Ошибка загрузки меню');
    }
  };

  const createCategory = async (categoryData: Omit<MenuCategory, 'id' | 'item_count'>) => {
    if (!restaurant?.id) return;

    try {
      const { data, error } = await supabase
        .from('menu_categories')
        .insert({
          ...categoryData,
          restaurant_id: restaurant.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Категория создана",
        description: "Новая категория успешно добавлена"
      });

      await fetchCategories();
      return data;
    } catch (err) {
      console.error('Error creating category:', err);
      toast({
        title: "Ошибка",
        description: "Не удалось создать категорию",
        variant: "destructive"
      });
      throw err;
    }
  };

  const createMenuItem = async (itemData: Omit<MenuItem, 'id' | 'category_name' | 'images'>) => {
    if (!restaurant?.id) return;

    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert({
          ...itemData,
          restaurant_id: restaurant.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Блюдо добавлено",
        description: "Новое блюдо успешно добавлено в меню"
      });

      await fetchMenuItems();
      await fetchCategories(); // Update item counts
      return data;
    } catch (err) {
      console.error('Error creating menu item:', err);
      toast({
        title: "Ошибка",
        description: "Не удалось добавить блюдо",
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Блюдо обновлено",
        description: "Изменения успешно сохранены"
      });

      await fetchMenuItems();
    } catch (err) {
      console.error('Error updating menu item:', err);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить блюдо",
        variant: "destructive"
      });
      throw err;
    }
  };

  const toggleItemAvailability = async (id: string) => {
    const item = menuItems.find(item => item.id === id);
    if (!item) return;

    await updateMenuItem(id, { is_available: !item.is_available });
  };

  const toggleCategoryActive = async (id: string) => {
    const category = categories.find(cat => cat.id === id);
    if (!category) return;

    try {
      const { error } = await supabase
        .from('menu_categories')
        .update({ is_active: !category.is_active })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Категория обновлена",
        description: `Категория ${category.is_active ? 'деактивирована' : 'активирована'}`
      });

      await fetchCategories();
    } catch (err) {
      console.error('Error toggling category:', err);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить категорию",
        variant: "destructive"
      });
    }
  };

  const deleteMenuItem = async (id: string) => {
    try {
      // Delete associated images first
      await supabase
        .from('menu_item_images')
        .delete()
        .eq('menu_item_id', id);

      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Блюдо удалено",
        description: "Блюдо успешно удалено из меню"
      });

      await fetchMenuItems();
      await fetchCategories(); // Update item counts
    } catch (err) {
      console.error('Error deleting menu item:', err);
      toast({
        title: "Ошибка",
        description: "Не удалось удалить блюдо",
        variant: "destructive"
      });
      throw err;
    }
  };

  const uploadMenuImage = async (file: File, menuItemId: string): Promise<string> => {
    if (!restaurant?.id) throw new Error('Restaurant not found');

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${restaurant.id}/${menuItemId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('menu-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('menu-images')
      .getPublicUrl(filePath);

    // Save image reference to database
    await supabase
      .from('menu_item_images')
      .insert({
        menu_item_id: menuItemId,
        image_url: publicUrl
      });

    return publicUrl;
  };

  useEffect(() => {
    if (restaurant?.id) {
      setLoading(true);
      Promise.all([fetchCategories(), fetchMenuItems()])
        .finally(() => setLoading(false));
    }
  }, [restaurant?.id]);

  return {
    menuItems,
    categories,
    loading,
    error,
    createCategory,
    createMenuItem,
    updateMenuItem,
    toggleItemAvailability,
    toggleCategoryActive,
    deleteMenuItem,
    uploadMenuImage,
    refreshData: () => Promise.all([fetchCategories(), fetchMenuItems()])
  };
};