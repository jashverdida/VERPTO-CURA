# National ID Images - Supabase Setup Guide

## 1. Create Storage Bucket

### Step 1: Go to Supabase Dashboard
- URL: https://supabase.com/dashboard
- Project: wyytiwqcllupfqmaahuq

### Step 2: Create 'national-ids' Bucket
1. Click on **Storage** in the left sidebar
2. Click **Create a new bucket**
3. Enter name: `national-ids`
4. Enable **Public bucket** checkbox
5. Click **Create bucket**

### Step 3: Configure Bucket Policies
1. Click on the `national-ids` bucket
2. Go to **Policies** tab
3. Add these policies:

**Policy 1 - Public Read Access**
- Click **New policy**
- Choose **Storage object** → **For queries**
- Select **SELECT**
- Click **Review**
- Name: `Public read access`
- Policy:
```sql
((bucket_id = 'national-ids'::text) AND (auth.role() = 'anon'::text))
```
- Click **Save policy**

**Policy 2 - Authenticated Users Can Upload**
- Click **New policy**
- Choose **Storage object** → **For queries**
- Select **INSERT**
- Click **Review**
- Name: `Authenticated users upload`
- Policy:
```sql
((bucket_id = 'national-ids'::text) AND (auth.role() = 'authenticated'::text) AND ((owner_id = auth.uid()) OR (auth.role() = 'authenticated'::text)))
```
- Click **Save policy**

---

## 2. Update Database Schema

### Option A: Using SQL Editor (Recommended)

1. Go to **SQL Editor** in Supabase Dashboard
2. Click **New Query**
3. Copy and paste this SQL:

```sql
-- Add columns for National ID images to citizens table
ALTER TABLE citizens
ADD COLUMN IF NOT EXISTS national_id_front_url TEXT,
ADD COLUMN IF NOT EXISTS national_id_back_url TEXT;

-- Optional: Add comment for documentation
COMMENT ON COLUMN citizens.national_id_front_url IS 'URL to front of Philippine National ID';
COMMENT ON COLUMN citizens.national_id_back_url IS 'URL to back of Philippine National ID';
```

4. Click **Run**

### Option B: Using Table Editor

1. Go to **Table Editor**
2. Click on **citizens** table
3. Click **Add Column** (for each):
   - Column name: `national_id_front_url`
     - Type: `text`
     - Nullable: Yes
   - Column name: `national_id_back_url`
     - Type: `text`
     - Nullable: Yes

---

## 3. Verify Setup

### Check Storage Bucket
```bash
# You should see the bucket in your Supabase dashboard
Dashboard → Storage → national-ids bucket visible
```

### Check Database Columns
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name='citizens' 
AND column_name LIKE 'national_id%';
```

Should return:
- national_id_front_url | text
- national_id_back_url | text

---

## 4. Testing the Feature

1. **Start the mobile app**
   ```bash
   cd mobile
   npm start
   ```

2. **Register a new account**
   - Fill in registration form
   - Click on "Philippine National ID" section
   - Select "Front" and "Back" images from your device

3. **Verify upload**
   - After registration, check Supabase Dashboard → Storage → national-ids
   - You should see uploaded image files with timestamps

4. **Verify database**
   - Check Supabase Dashboard → Table Editor → citizens
   - Find the newly created citizen record
   - Verify `national_id_front_url` and `national_id_back_url` are populated with image URLs

---

## 5. Troubleshooting

### Images not uploading
- **Issue**: Permission denied
- **Solution**: Verify bucket policies are set correctly (see section 1.3)

### Database error: column doesn't exist
- **Issue**: national_id_front_url/national_id_back_url columns missing
- **Solution**: Run the SQL migration (section 2.A)

### Images not showing in UI
- **Issue**: Image URLs invalid or bucket policy incorrect
- **Solution**: 
  1. Check URL format: Should start with `https://wyytiwqcllupfqmaahuq.supabase.co/storage/v1/object/public/national-ids/`
  2. Test bucket is public: Try opening URL in browser

### Upload fails with timeout
- **Issue**: Network or image too large
- **Solution**: Ensure image < 5MB, check network connection

---

## 6. Next Steps

After successful setup:
1. Test complete registration flow with National ID images
2. Create User Profile page to display images
3. Add admin verification UI to mark citizens as verified
