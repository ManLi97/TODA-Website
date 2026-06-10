-- Public bucket for blog cover images.
-- Public bucket = anonymous read via the public object URL.
-- No storage write policies: uploads go through the service-role client
-- in admin server actions only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-covers',
  'blog-covers',
  true,
  8388608, -- 8 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do nothing;
