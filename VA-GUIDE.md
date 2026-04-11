# VA Guide — Adding & Editing Pages

This guide covers everything you need to add new pages, blog posts, and images to this site. You do not need to know how to code. Follow each step exactly as written.

If anything in this guide is unclear, tell the developer — the guide needs to be fixed.

---

## What You Need Installed

Before anything else, make sure you have these on your computer:

- **Node.js** — download from https://nodejs.org (click the "LTS" button, install it like any program)
- **Git** — download from https://git-scm.com (install with all default options)
- **GitHub Desktop** *(optional but easier than command line)* — https://desktop.github.com

To check if Node.js is installed: open Terminal (Mac) or Command Prompt (Windows), type `node -v` and press Enter. You should see a version number like `v20.11.0`. If you see an error, Node.js is not installed.

---

## One-Time Setup: Get the Project on Your Computer

You only do this once.

1. Go to the repository on GitHub (the developer will send you the link)
2. Click the green **Code** button → **Open with GitHub Desktop**
3. Choose a folder on your computer to save the project (e.g. `Documents/cruzgoldlaw`)
4. Click **Clone**

You now have the full project on your computer.

---

## The Folder Structure (What Everything Is)

```
project/
├── index.html          ← The homepage
├── about.html          ← The About page
├── blog.html           ← The Blog listing page
├── *.html              ← All other pages
│
├── _content/           ← ★ THIS IS WHERE YOU WORK ★
│   └── example-blog-post.html   ← Your starting template
│
├── _partials/          ← DO NOT TOUCH (shared header/footer)
│
├── css/                ← DO NOT TOUCH (styles)
├── js/                 ← DO NOT TOUCH (scripts)
├── images/             ← Add new images here
│
└── build-page.mjs      ← The script that builds pages (you run this)
```

**You only ever work inside `_content/` and `images/`.** Everything else is hands-off unless the developer tells you otherwise.

---

## How to Add a New Blog Post

### Step 1 — Pull the latest changes

Always start by getting the latest version of the project.

Open Terminal (Mac) or Command Prompt (Windows), navigate to the project folder:

```
cd path/to/your/project
```

Then run:

```
git pull
```

You should see something like `Already up to date.` or a list of updated files. Either is fine.

> **GitHub Desktop alternative:** Open GitHub Desktop, select the repository, click **Fetch origin**, then **Pull**.

---

### Step 2 — Create your content file

1. Open the `_content/` folder
2. Find `example-blog-post.html`
3. **Copy** it (do not rename or delete the original)
4. Paste the copy in the same `_content/` folder
5. Rename it to match your blog post topic, using hyphens instead of spaces and all lowercase

**Good name examples:**
- `understanding-green-card-eligibility.html`
- `what-to-expect-at-your-immigration-interview.html`
- `5-common-mistakes-on-visa-applications.html`

**Bad name examples:**
- `New Blog Post.html` ← spaces not allowed
- `BlogPost1.html` ← not descriptive
- `My Post (2025).html` ← special characters not allowed

---

### Step 3 — Fill in the metadata

Open your new file in any text editor (Notepad on Windows, TextEdit on Mac, or VS Code if you have it).

At the very top of the file you will see this block:

```html
<!--
TITLE: Example Blog Post Title | Cruz Gold & Associates
DESCRIPTION: A short meta description for this blog post (under 160 characters).
CANONICAL: example-blog-post.html
CSS:
-->
```

Replace each line with your actual information:

```html
<!--
TITLE: Understanding Green Card Eligibility | Cruz Gold & Associates
DESCRIPTION: Learn who qualifies for a green card, the different paths to eligibility, and how Cruz Gold & Associates can help you through the process.
CANONICAL: understanding-green-card-eligibility.html
CSS:
-->
```

**What each field means:**

| Field | What it is | Rules |
|---|---|---|
| `TITLE` | The text that appears in the browser tab and in Google search results | Always end with `\| Cruz Gold & Associates`. Keep under 60 characters total. |
| `DESCRIPTION` | The 1-2 sentence summary that appears under your page title in Google | Keep under 160 characters. Write it like a human, not a robot. |
| `CANONICAL` | The filename of this page | Must exactly match the filename you gave the file in Step 2. |
| `CSS` | A stylesheet for page-specific styles | Leave this blank for blog posts. The developer fills this in for new service pages. |

---

### Step 4 — Write the content

Below the `-->` closing tag, write your page content in HTML. You do not need to know HTML well — just copy the structure from the example and replace the text.

**Complete copy-paste example for a blog post:**

```html
<!--
TITLE: Understanding Green Card Eligibility | Cruz Gold & Associates
DESCRIPTION: Learn who qualifies for a green card, the different paths to eligibility, and how Cruz Gold & Associates can help you through the process.
CANONICAL: understanding-green-card-eligibility.html
CSS:
-->

<div id="content" class="site-content">
<div class="inside-site-info grid-container grid-parent">
<div class="content-area" id="primary">

  <article>

    <div class="gbp-section gb-element-blog-hero">
      <div class="gbp-section__inner">
        <h1 class="gb-text">Understanding Green Card Eligibility</h1>
        <p class="gb-text">Published: January 15, 2026 &nbsp;|&nbsp; Immigration Law</p>
      </div>
    </div>

    <div class="gbp-section gb-element-blog-body">
      <div class="gbp-section__inner">

        <p>Getting a green card is one of the most important steps toward permanent residence in the United States. But not everyone qualifies the same way — and understanding which path applies to you can save months of confusion.</p>

        <h2>Who Can Apply for a Green Card?</h2>
        <p>There are several main categories of green card eligibility:</p>

        <ul>
          <li><strong>Family-based:</strong> You have a close relative who is a U.S. citizen or permanent resident.</li>
          <li><strong>Employment-based:</strong> A U.S. employer has sponsored you for a job.</li>
          <li><strong>Asylum or refugee status:</strong> You have been granted asylum or came to the U.S. as a refugee.</li>
          <li><strong>Diversity Visa Lottery:</strong> You applied through the annual DV Lottery program.</li>
        </ul>

        <h2>What Happens After You Apply?</h2>
        <p>Once you submit your application, USCIS will review your documents, schedule a biometrics appointment, and eventually call you for an interview. The timeline varies widely — from several months to several years depending on your category and country of birth.</p>

        <h2>How We Can Help</h2>
        <p>At Cruz Gold & Associates, we have helped hundreds of families navigate the green card process since 1995. Our team reviews your full situation, identifies the strongest path forward, and handles the paperwork so you can focus on your life.</p>

        <p><a href="contact.html">Contact us today for a consultation.</a></p>

      </div>
    </div>

  </article>

</div>
</div>
</div>
```

**HTML tags you need to know:**

| Tag | What it does | Example |
|---|---|---|
| `<h2>...</h2>` | Section heading (big bold text) | `<h2>Who Qualifies?</h2>` |
| `<h3>...</h3>` | Sub-heading (slightly smaller) | `<h3>Family Category</h3>` |
| `<p>...</p>` | A paragraph of text | `<p>Your paragraph here.</p>` |
| `<ul>...</ul>` | A bullet list | Wrap your `<li>` items inside this |
| `<li>...</li>` | A single bullet point | `<li>First item</li>` |
| `<strong>...</strong>` | **Bold text** | `<strong>Important word</strong>` |
| `<a href="page.html">...</a>` | A link | `<a href="contact.html">Contact us</a>` |
| `<br>` | A line break | Use sparingly, prefer `<p>` tags |

---

### Step 5 — Build the page

Open Terminal / Command Prompt, navigate to the project folder, then run:

```
node build-page.mjs _content/understanding-green-card-eligibility.html
```

Replace `understanding-green-card-eligibility.html` with your actual filename.

**If it worked**, you will see:
```
✓  Built: understanding-green-card-eligibility.html  (38.4 KB)
```

**If you see an error**, read the error message — it tells you exactly what is wrong:
- `content file not found` → you typed the filename wrong
- `missing required field(s): TITLE` → you left a metadata field blank
- `must start with a metadata comment block` → the `<!--` block at the top is missing or has been accidentally deleted

---

### Step 6 — Preview in your browser

1. Open your project folder
2. Find the newly built `understanding-green-card-eligibility.html` file (it appears at the root of the project, not inside `_content/`)
3. Double-click it — it opens in your browser
4. Read through the page. Check:
   - The title in the browser tab looks correct
   - The header and navigation appear at the top
   - Your content is all there and formatted correctly
   - The footer appears at the bottom
   - Links work when you click them

> **Note:** Images that reference the live site may not display locally — that is normal. They will show correctly once you publish.

---

### Step 7 — Publish

Once you are happy with the preview, publish the page:

```
git add .
git commit -m "Add blog post: understanding green card eligibility"
git push
```

Replace the text in quotes with a short description of what you added.

**If git push asks for a username/password:** enter your GitHub username and a Personal Access Token (not your password — GitHub no longer accepts passwords. Ask the developer to set this up for you once).

> **GitHub Desktop alternative:**
> 1. Open GitHub Desktop
> 2. You will see your changed files listed on the left
> 3. At the bottom left, type a short summary (e.g. "Add green card eligibility blog post")
> 4. Click **Commit to master**
> 5. Click **Push origin**

The site will automatically update within 1-2 minutes after you push.

---

## How to Add a New Service Page

Service pages are built the same way as blog posts with one difference: they need a CSS file for their specific layout. **Ask the developer to create the CSS file first before you build the page.** Once they give you the CSS filename, add it to the `CSS:` field in your metadata.

**Example metadata for a service page:**

```html
<!--
TITLE: Deportation Defense Lawyer New Jersey | Cruz Gold & Associates
DESCRIPTION: Facing deportation? Cruz Gold & Associates provides experienced deportation defense representation throughout New Jersey. Call (609) 924-8500.
CANONICAL: deportation-defense-lawyer-new-jersey.html
CSS: css/gb-deportation-defense.css
-->
```

Everything else is identical to the blog post steps above.

---

## How to Add a New Image

### Step 1 — Prepare the image file

Before adding an image, make sure it is:
- Saved as `.webp` format (best for website speed) — use https://squoosh.app to convert any image for free
- Named with hyphens, no spaces, all lowercase: `immigration-consultation-nj.webp`
- Reasonably sized — aim for under 300KB for photos, under 100KB for logos/icons

### Step 2 — Put the file in the images folder

Drag the image file into the `images/` folder inside the project.

### Step 3 — Reference it in your content

In your HTML content, add an image like this:

```html
<img src="images/immigration-consultation-nj.webp" alt="Immigration consultation at Cruz Gold & Associates" width="800" height="533">
```

**What each part means:**

| Part | What it does |
|---|---|
| `src="images/..."` | The path to your image — always starts with `images/` |
| `alt="..."` | A text description of the image for screen readers and Google — be descriptive |
| `width="800" height="533"` | The actual pixel dimensions of the image — fill these in accurately |

---

## What to Do If Something Goes Wrong

### The build script shows an error

Read the error message — it tells you what to fix. The most common errors:

| Error message | What it means | How to fix |
|---|---|---|
| `content file not found` | The filename in your command doesn't match the actual file | Check spelling — copy-paste the filename from your file explorer |
| `missing required field(s): TITLE` | You left TITLE, DESCRIPTION, or CANONICAL blank | Open the file and fill in the missing field |
| `must start with a metadata comment block` | The `<!--` block is missing or was accidentally deleted | Copy it back from `_content/example-blog-post.html` |

### The page looks broken in the browser

- Make sure every HTML tag you opened has a matching closing tag: `<p>text</p>` not `<p>text`
- Make sure you did not accidentally delete any part of the content structure (the outer `<div id="content" ...>` wrapper)
- Compare your file to `_content/example-blog-post.html` to find what is different

### Git push fails

Common reasons:
- You are not authenticated — ask the developer to help you set up a GitHub Personal Access Token
- Someone else pushed changes before you — run `git pull` first, then `git push` again
- You have no internet connection

### You are not sure if something is right

Do not guess. Send the developer a message with:
1. A screenshot of the error or the page
2. The name of the file you were working on
3. What step you were on when the problem happened

---

## Quick Reference — Commands

| What you want to do | Command |
|---|---|
| Get the latest changes | `git pull` |
| Build a page | `node build-page.mjs _content/your-file.html` |
| Stage all changes | `git add .` |
| Save a checkpoint (commit) | `git commit -m "your description here"` |
| Publish to the live site | `git push` |

All commands are run in Terminal (Mac) or Command Prompt (Windows) from inside the project folder.
