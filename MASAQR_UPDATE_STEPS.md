# MasaQR update steps

1. Extract this ZIP to a new folder, for example `masa-menu-flow-fixed`.
2. Open that folder in VS Code.
3. Create a `.env` file in the project root.
4. Add your Supabase values:

```env
VITE_SUPABASE_URL=https://tylqisikppnfoxgihjan.supabase.co
VITE_SUPABASE_ANON_KEY=PASTE_YOUR_ANON_PUBLIC_KEY_HERE
```

5. Open VS Code terminal in the project folder.
6. Run:

```bash
npm install
npm run dev
```

7. Test:
   - Login with your Supabase Auth user.
   - Open `/app/menu` and confirm the menu is read from Supabase.
   - Open `/m/demo/1` and place an order.
   - Open `/app/orders` and confirm the order appears.
   - Confirm the order.
   - Open `/kitchen`, mark preparing, then ready.
   - Open `/waiter`, mark picked up, then served.

8. After it works locally, push it to GitHub:

```bash
git init
git remote add origin https://github.com/Mikayil339/masa-menu-flow.git
git add .
git commit -m "Connect MasaQR to Supabase"
git branch -M main
git push -f origin main
```

9. Vercel will redeploy from GitHub. Add these same environment variables in Vercel Project Settings → Environment Variables.

## Faza 2/3/4 — tam icra (icra olunmuş dəyişikliklər)

### Yeni / yenilənmiş səhifələr
- `src/routes/app/settings.tsx` — **tam yenidən yazıldı**. Real Supabase yazışı: ad, slug, valyuta, əsas dil, müştəri dilləri, qısa təsvir, **loqo yüklə**, **üz şəkli yüklə**, telefon, ünvan, Wi-Fi adı/şifrəsi, menyuda göstər/gizlət açarları, **ofisiant təyinatı rejimi** (first_confirming_waiter / manual_table_ranges / disabled).
- `src/routes/app/menu.tsx` — məhsul redaktoru artıq **AZ/EN/RU ad və təsvir**, **əsas / yerli / əcnəbi qiymət**, **tövsiyə olunan məhsullar** seçimi, kompüterdən şəkil yükləmə. Yeni kateqoriya da 3 dildə.
- `src/routes/app/orders.tsx` — yeni **Sessiyalar** görünüşü: açıq sessiyalar siyahısı, hesab-stilində detal, **Bağla** düyməsi `closeSession` çağırır və masanı boşaldır.

### Tələb olunan Supabase Storage bucket-ları
Aşağıdakı bucket-lar mövcud olmalıdır (yoxdursa Supabase Dashboard → Storage-də yaradın, hamısı **public**):
- `masaqr-logos`
- `masaqr-covers`
- `masaqr-menu-images`

Bucket-lar yaradıldıqdan sonra hər birinə bu RLS policy-lərini əlavə edin:
```sql
-- Anon və auth oxuya bilsin (public bucket)
CREATE POLICY "public read" ON storage.objects FOR SELECT USING (bucket_id IN ('masaqr-logos','masaqr-covers','masaqr-menu-images'));
-- Auth istifadəçilər yükləyə bilsin
CREATE POLICY "auth upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('masaqr-logos','masaqr-covers','masaqr-menu-images'));
```
