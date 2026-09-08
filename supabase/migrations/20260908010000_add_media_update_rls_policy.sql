-- Bucket `media` (storage.objects) só tinha policies de INSERT e SELECT. O upload
-- com `upsert: true` (uploadThumbnail em src/services/brandKit.ts) faz um UPDATE
-- na linha de storage.objects quando o objeto já existe — sem policy de UPDATE, a
-- 2ª gravação no MESMO path era negada por RLS e o Storage devolvia HTTP 400.
--
-- Isso passou a acontecer quando `persistAdjustedPremium` (AgentChat) começou a
-- sobrescrever a thumbnail no path determinístico `thumbnails/{email}/{id}.jpg`
-- depois de um ajuste/overlay Premium: a 1ª gravação (geração) = INSERT = 200; a
-- 2ª (ajuste) = UPDATE = 400. Antes disso todo uploadThumbnail usava um postId
-- novo (só INSERT), então a lacuna nunca aparecia.
--
-- Adiciona UPDATE para `authenticated` no bucket media (mesma condição do INSERT).
-- DELETE segue sem policy de propósito — nenhum caminho do app apaga objetos.

create policy "Authenticated users can update media"
  on storage.objects for update to authenticated
  using (bucket_id = 'media')
  with check (bucket_id = 'media');
