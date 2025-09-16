-- Создаем хранилище для фотографий отзывов
INSERT INTO storage.buckets (id, name, public) 
VALUES ('review-photos', 'review-photos', true);

-- Создаем политики для хранилища фотографий отзывов
CREATE POLICY "Фото отзывов доступны всем для просмотра" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'review-photos');

CREATE POLICY "Авторизованные пользователи могут загружать фото отзывов" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'review-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Пользователи могут удалять свои фото отзывов" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'review-photos' AND auth.uid()::text = (storage.foldername(name))[1]);