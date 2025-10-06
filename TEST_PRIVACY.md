# 🔒 Privacy Testing Guide - Verify Private Dream Isolation

## ✅ What We're Testing

Ensure that **User B CANNOT access User A's private dreams** even if logged in.

---

## 🧪 Test Scenarios

### Test 1: Database-Level Protection (Most Important!)

This tests that Supabase RLS blocks unauthorized access at the database level.

```sql
-- 1. Create User A's private dream (run in Supabase SQL Editor)
-- First, get User A's ID from auth.users table
SELECT id, email FROM auth.users WHERE email = 'userA@test.com';

-- Insert a private dream for User A (replace {USER_A_ID} with actual ID)
INSERT INTO dreams (user_id, user_email, title, content, is_public)
VALUES (
  '{USER_A_ID}',
  'userA@test.com',
  'User A Private Dream',
  'This is a secret dream that only User A should see',
  false  -- PRIVATE
);

-- 2. Try to access as User B
-- Login as User B in your app, then run this in browser console:
fetch('http://localhost:3001/api/dreams', {
  headers: {
    'Authorization': 'Bearer ' + session.access_token
  }
})
.then(r => r.json())
.then(data => {
  console.log('User B dreams:', data.dreams);
  // Should NOT include "User A Private Dream"
});

-- Expected Result: User B's API call will NOT return User A's private dream
-- RLS blocks it at database level
```

---

### Test 2: Frontend Gallery Test

1. **Create User A**:
   - Sign up: `userA@test.com`
   - Create 2 dreams:
     - "Public Space Dream" (is_public = true)
     - "Private Diary" (is_public = false)
   - Logout

2. **Create User B**:
   - Sign up: `userB@test.com`
   - Go to Gallery
   - **Expected**:
     - ✅ See "Public Space Dream" from User A
     - ❌ **NOT** see "Private Diary" from User A

3. **Verify**:
   - Open browser console
   - Check: `dreamVideos` array
   - Confirm: No private dreams from User A

---

### Test 3: Direct Database Query

Run this in **Supabase SQL Editor** while authenticated as different users:

```sql
-- Test as User A (should see their own private dreams)
SET request.jwt.claims.sub = '{USER_A_ID}';
SELECT id, title, is_public, user_id FROM dreams WHERE is_public = false;
-- Expected: Returns User A's private dreams

-- Test as User B (should NOT see User A's private dreams)
SET request.jwt.claims.sub = '{USER_B_ID}';
SELECT id, title, is_public, user_id FROM dreams WHERE is_public = false;
-- Expected: Returns ONLY User B's private dreams (not User A's)
```

---

### Test 4: API Endpoint Test

```bash
# Get User A's token
USER_A_TOKEN="your_user_a_jwt_token"

# Get User B's token
USER_B_TOKEN="your_user_b_jwt_token"

# Test 1: User A fetches their dreams
curl -H "Authorization: Bearer $USER_A_TOKEN" \
  http://localhost:3001/api/dreams | jq

# Expected: See User A's public + private dreams

# Test 2: User B fetches their dreams
curl -H "Authorization: Bearer $USER_B_TOKEN" \
  http://localhost:3001/api/dreams | jq

# Expected: See User B's dreams + public dreams from others
# Should NOT see User A's private dreams
```

---

### Test 5: Video Storage Access

```javascript
// Login as User B
const { data, error } = await supabase.storage
  .from('dream-videos')
  .download('user-a-id/private-video.mp4');  // Try to access User A's video

console.log('Error:', error);
// Expected: Error - "Access denied" or "Not found"
// RLS on storage.objects blocks cross-user access
```

---

## 🔍 How to Verify Privacy is Working

### ✅ Success Indicators:

1. **Gallery Page**:
   - User B sees public dreams from everyone
   - User B sees their own private dreams
   - User B does **NOT** see User A's private dreams

2. **Network Tab**:
   - Open DevTools → Network
   - Filter: `api/dreams`
   - Response should NOT contain other users' private dreams

3. **Console Logs**:
   - Check console.log output
   - Should show: "Loaded X public dreams + Y private dreams"
   - Private count should only be user's own

4. **Database Query**:
   - Direct Supabase query with User B's auth
   - Returns only public dreams + User B's dreams
   - Never returns User A's private dreams

---

## ❌ Red Flags (Privacy BROKEN):

If you see any of these, privacy is NOT working:

1. ❌ User B can see "Private Diary" from User A in gallery
2. ❌ API response includes `user_id` not matching logged-in user for private dreams
3. ❌ Console shows private dreams from other users
4. ❌ Direct database query returns other users' private dreams

---

## 🛡️ Privacy Protection Layers

Your system has **3 layers of protection**:

### Layer 1: Database RLS (PRIMARY)
```sql
-- Only allows reading own dreams or public dreams
CREATE POLICY "Users can read their own dreams"
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can read public dreams"
USING (is_public = true);
```

### Layer 2: Backend Filtering
```javascript
// Query already filtered by user_id in authenticateUser middleware
const { data } = await supabase
  .from('dreams')
  .select('*')
  .eq('user_id', req.user.id);  // Only this user's dreams
```

### Layer 3: Frontend Filtering
```javascript
// Additional UI-level check
const isVisible = dream.is_public === true || dream.isOwner;
```

---

## 📊 Expected Test Results

### User A's View:
```
Gallery Contents:
✅ Public Space Dream (Public - Own)
✅ Private Diary (Private - Own)
✅ Ocean Journey (Public - User B's)
❌ Secret Thoughts (BLOCKED - User B's private)
```

### User B's View:
```
Gallery Contents:
✅ Public Space Dream (Public - User A's)
❌ Private Diary (BLOCKED - User A's private)
✅ Ocean Journey (Public - Own)
✅ Secret Thoughts (Private - Own)
```

### Guest (Not Logged In):
```
Gallery Contents:
✅ Public Space Dream (Public - User A's)
❌ Private Diary (BLOCKED)
✅ Ocean Journey (Public - User B's)
❌ Secret Thoughts (BLOCKED)
```

---

## 🔐 Security Confirmation

After running all tests, confirm:

- [ ] User B cannot see User A's private dreams in Gallery
- [ ] API responses don't leak private dreams
- [ ] Direct database queries respect RLS
- [ ] Storage bucket blocks cross-user video access
- [ ] Console logs show correct filtering
- [ ] Network responses verified in DevTools

---

## 🚨 If Privacy Test Fails

### Step 1: Check RLS is Enabled
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'dreams';
-- rowsecurity should be TRUE
```

### Step 2: Verify Policies Exist
```sql
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'dreams';
-- Should see 2 SELECT policies + INSERT/UPDATE/DELETE policies
```

### Step 3: Check Backend Authentication
```javascript
// In backend/routes/dreams.js
console.log('Authenticated user:', req.user.id, req.user.email);
// Make sure this matches the logged-in user
```

### Step 4: Verify Frontend Filtering
```javascript
// In Gallery.jsx, add console.log
console.log('Fetched dreams:', allDreams.map(d => ({
  title: d.title,
  isPublic: d.is_public,
  userId: d.user_id,
  currentUser: user.id
})));
```

---

## ✅ Privacy Verified!

Once all tests pass, your privacy implementation is **SECURE**. Users cannot access other users' private dreams through:
- ❌ Gallery UI
- ❌ API endpoints
- ❌ Direct database queries
- ❌ Storage file access
- ❌ Any other method

**Your Dream Journey Analyzer is privacy-compliant!** 🔒✨
