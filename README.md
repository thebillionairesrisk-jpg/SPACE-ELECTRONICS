# SPACE ELECTRONICS — Netlify starter

## 1. Deploy from GitHub
Import the `SPACE-ELECTRONICS` repository into Netlify. This project uses plain HTML/CSS/JavaScript.
- Build command: leave blank
- Publish directory: `.`
- Functions directory: `netlify/functions` (Netlify usually detects this automatically)

## 2. Connect Supabase public browser credentials
Open `assets/config.js` and replace `PASTE_YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY_HERE` with the project's **anon / publishable** key from Supabase → Project Settings → API.
The project URL is already filled in.
Never paste the `service_role` / secret key into `assets/config.js`, HTML, JavaScript, or GitHub.

## 3. Netlify environment variables for secure cart monitoring
In Netlify → Site configuration → Environment variables, add:
- `SUPABASE_URL` = your Supabase project URL
- `SUPABASE_ANON_KEY` = the anon / publishable key
- `SUPABASE_SERVICE_ROLE_KEY` = the Supabase service_role / secret key

Only the server-side Netlify function reads the service role key. Do not expose it in the browser.

After adding variables, trigger a new deploy. The cart-monitor function is `/.netlify/functions/admin-carts`.

## 4. Important database checks
- The public products table must allow SELECT of active products.
- Admin users need an authenticated admin policy to INSERT/UPDATE products.
- The `profiles` table should allow an admin to read their own role.
- The cart function expects `carts.created_at` and the PostgREST relationship `carts -> cart_items -> products`. If your actual schema uses different FK names, adjust the select in `netlify/functions/admin-carts.mjs`.
- Customer carts in this starter are currently stored in the customer's browser (`localStorage`) for the shopping experience. Cross-device / server-side customer cart tracking requires wiring cart additions to the Supabase `carts` and `cart_items` tables and applying secure policies. The admin monitor function is provided as the protected server-side read endpoint, but it will only show carts that have actually been saved to those database tables.

## 5. Weekend offers
The banner is shown on Saturdays and Sundays. The UGX 1,000 discount applies only to products whose database row has `weekend_offer: true`. Ensure that field exists and is set only on selected products. If your table instead uses the `weekend_offers` relation, connect that relation in `assets/app.js` before launch.

## 6. Contact / developer details
Customer WhatsApp/call/SMS: +256 753 443 115
Developer: Matende Samson
samsonmatende@gmail.com
+256741701441, +256753443115, +25674585751

This is a starter implementation. Test with a few sample products and an admin account before accepting live orders.
