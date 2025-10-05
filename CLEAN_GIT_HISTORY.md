# 🧹 Clean .env Files from Git History

## ⚠️ WARNING: This is Irreversible!

**Before proceeding:**
- ✅ Backup your repository
- ✅ Make sure no one else is working on the repo
- ✅ This will rewrite history and change all commit SHAs
- ✅ After this, you'll need to force push

---

## 🔧 Method 1: Using BFG Repo Cleaner (Easiest)

### Step 1: Download BFG

Download from: https://rtyley.github.io/bfg-repo-cleaner/

Or use this direct link:
```
https://repo1.maven.org/maven2/com/madgag/bfg/1.14.0/bfg-1.14.0.jar
```

Save to: `C:\Users\Prasanna\Downloads\bfg.jar`

### Step 2: Create Backup

```bash
cd C:\Users\Prasanna
git clone --mirror Dream_journey_analyzer Dream_journey_analyzer-backup
```

### Step 3: Clean History

```bash
# Go to project directory
cd C:\Users\Prasanna\Dream_journey_analyzer

# Delete .env files (BFG works on bare repos, so we clone mirror first)
cd ..
git clone --mirror Dream_journey_analyzer Dream_journey_analyzer.git

# Run BFG to remove .env files
java -jar C:\Users\Prasanna\Downloads\bfg.jar --delete-files .env Dream_journey_analyzer.git

# Go into the mirror repo
cd Dream_journey_analyzer.git

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Push cleaned history
cd ../Dream_journey_analyzer
git remote remove origin
git remote add origin https://github.com/Balaji2004-bmn/Dream_journey_analyzer.git
git push --force --all
git push --force --tags
```

---

## 🔧 Method 2: Using git filter-repo (More Control)

### Step 1: Install git-filter-repo

```bash
# Using pip
pip install git-filter-repo
```

Or download from: https://github.com/newren/git-filter-repo/

### Step 2: Create Backup

```bash
cd C:\Users\Prasanna
cp -r Dream_journey_analyzer Dream_journey_analyzer-backup
```

### Step 3: Filter History

```bash
cd Dream_journey_analyzer

# Remove .env files from entire history
git filter-repo --path .env --invert-paths --force
git filter-repo --path backend/.env --invert-paths --force
git filter-repo --path .env.local --invert-paths --force
git filter-repo --path backend/.env.local --invert-paths --force

# Add remote back (filter-repo removes it)
git remote add origin https://github.com/Balaji2004-bmn/Dream_journey_analyzer.git

# Force push
git push --force --all
git push --force --tags
```

---

## 🔧 Method 3: Manual Git Filter-Branch (Built-in)

```bash
cd C:\Users\Prasanna\Dream_journey_analyzer

# Remove .env files
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env backend/.env .env.local backend/.env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push --force --all
git push --force --tags
```

---

## ✅ Verification

After cleaning, verify .env files are gone:

```bash
# Check if .env exists in history
git log --all --full-history -- "**/.env"

# Should return nothing if successful
```

---

## 🚨 Important Notes

### After Force Push:

1. **Anyone with a clone must re-clone:**
   ```bash
   git clone https://github.com/Balaji2004-bmn/Dream_journey_analyzer.git
   ```

2. **Old commits are gone** - history is rewritten

3. **GitHub may cache old history** for ~1 hour

4. **Check GitHub Security Alerts** - mark exposed secrets as resolved

---

## 🔐 After Cleaning History

1. **Regenerate ALL credentials:**
   - New Supabase keys
   - New JWT secret
   - New email password
   - New API keys

2. **Update local .env files** with new credentials

3. **Update deployment environments** (Netlify, Railway)

4. **Make repository public**

---

## ⚠️ If Something Goes Wrong

### Restore from Backup:

```bash
# If you created backup
cd C:\Users\Prasanna
rm -rf Dream_journey_analyzer
cp -r Dream_journey_analyzer-backup Dream_journey_analyzer
cd Dream_journey_analyzer
```

---

## 📋 Checklist

Before cleaning:
- [ ] Created backup
- [ ] No one else is working on repo
- [ ] Understand this is irreversible

After cleaning:
- [ ] Verified .env files removed from history
- [ ] Force pushed successfully
- [ ] Regenerated all secrets
- [ ] Updated .env files locally
- [ ] Ready to make repository public

---

**Need help?** Run each command one at a time and check for errors.
