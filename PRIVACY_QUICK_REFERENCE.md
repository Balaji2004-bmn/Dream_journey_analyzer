# 🔒 Privacy Quick Reference

## Dream Visibility Matrix

| Dream Type | Creator Sees | Other Users See | Not Logged In |
|-----------|--------------|-----------------|---------------|
| **Public** (`is_public = true`) | ✅ Yes | ✅ Yes | ✅ Yes |
| **Private** (`is_public = false`) | ✅ Yes | ❌ **NO** | ❌ **NO** |

---

## Example Scenario

### User A's Dreams:
- Dream 1: "Ocean Adventure" (Public)
- Dream 2: "Personal Diary" (Private)
- Dream 3: "Mountain Climb" (Public)

### User B's Dreams:
- Dream 4: "Space Travel" (Public)
- Dream 5: "Secret Thoughts" (Private)

---

## What Each User Sees:

### User A's Gallery:
```
✅ Dream 1: Ocean Adventure (Public - Own)
✅ Dream 2: Personal Diary (Private - Own)
✅ Dream 3: Mountain Climb (Public - Own)
✅ Dream 4: Space Travel (Public - User B's)
❌ Dream 5: Secret Thoughts (BLOCKED - User B's private)
```

### User B's Gallery:
```
✅ Dream 1: Ocean Adventure (Public - User A's)
❌ Dream 2: Personal Diary (BLOCKED - User A's private)
✅ Dream 3: Mountain Climb (Public - User A's)
✅ Dream 4: Space Travel (Public - Own)
✅ Dream 5: Secret Thoughts (Private - Own)
```

### Guest (Not Logged In):
```
✅ Dream 1: Ocean Adventure (Public)
❌ Dream 2: Personal Diary (BLOCKED)
✅ Dream 3: Mountain Climb (Public)
✅ Dream 4: Space Travel (Public)
❌ Dream 5: Secret Thoughts (BLOCKED)
```

---

## Key Rules

1. **Public Dreams** = Visible to EVERYONE
2. **Private Dreams** = Visible ONLY to creator
3. **RLS enforces** = Database-level protection
4. **Cannot bypass** = Even with direct DB access

---

## How to Set Privacy

### When Creating a Dream:

```javascript
// PUBLIC DREAM (everyone can see)
{
  title: "My Amazing Dream",
  content: "Dream description...",
  is_public: true  // ← Set to true for public
}

// PRIVATE DREAM (only you can see)
{
  title: "My Private Dream",
  content: "Secret dream...",
  is_public: false  // ← Set to false for private
}
```

---

## Testing Commands

```sql
-- Check public dreams (works for everyone)
SELECT * FROM dreams WHERE is_public = true;

-- Check private dreams (only works for owner)
SELECT * FROM dreams WHERE is_public = false;
-- Result: Only YOUR private dreams (RLS filters)
```

---

## Files to Deploy

1. ✅ `supabase/migrations/add_user_email_privacy.sql`
2. ✅ `backend/routes/dreams.js`
3. ✅ `src/pages/Gallery.jsx`

---

## Deployment Checklist

- [ ] Run SQL migration in Supabase
- [ ] Deploy backend code
- [ ] Deploy frontend code
- [ ] Test with 2 users:
  - [ ] User A creates 1 public + 1 private
  - [ ] User B creates 1 public + 1 private
  - [ ] User A sees: A's 2 + B's 1 public (3 total)
  - [ ] User B sees: B's 2 + A's 1 public (3 total)
  - [ ] Private dreams NOT visible to other user ✓

---

**That's it! Simple and secure.** 🔒
