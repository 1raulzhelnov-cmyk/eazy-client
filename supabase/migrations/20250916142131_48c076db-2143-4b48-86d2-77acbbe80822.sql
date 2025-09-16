-- Создаем bucket для документов курьеров
INSERT INTO storage.buckets (id, name, public) 
VALUES ('driver-documents', 'driver-documents', false);

-- Политики для загрузки документов курьеров
CREATE POLICY "Users can upload their own driver documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'driver-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own driver documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'driver-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own driver documents"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'driver-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own driver documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'driver-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);