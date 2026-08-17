CREATE TABLE public.bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookmarks TO authenticated;
GRANT ALL ON public.bookmarks TO service_role;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own bookmarks" ON public.bookmarks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX bookmarks_user_created_idx ON public.bookmarks (user_id, created_at DESC);

CREATE TABLE public.browser_prefs (
  user_id UUID NOT NULL PRIMARY KEY,
  theme TEXT NOT NULL DEFAULT 'quantum',
  homepage TEXT NOT NULL DEFAULT 'https://example.com',
  block_scripts BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.browser_prefs TO authenticated;
GRANT ALL ON public.browser_prefs TO service_role;
ALTER TABLE public.browser_prefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own browser prefs" ON public.browser_prefs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);