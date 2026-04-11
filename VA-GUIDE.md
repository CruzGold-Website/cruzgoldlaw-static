# VA Guide — Cruz Gold & Associates

This guide covers everything you need to add and update content on cruzgoldlaw.com. You do not need to know how to code. Follow each step exactly as written.

**If anything in this guide is unclear, tell the developer — the guide needs to be fixed.**

---

## What You Need Installed (One Time Only)

- **Node.js** — https://nodejs.org → click the "LTS" button, install like any program
- **Git** — https://git-scm.com → install with all default options
- **GitHub Desktop** *(recommended)* — https://desktop.github.com

To check Node.js is installed: open Terminal (Mac) or Command Prompt (Windows), type `node -v`, press Enter. You should see something like `v20.11.0`. If you see an error, Node.js is not installed.

---

## One-Time Setup: Get the Project on Your Computer

1. The developer will send you the GitHub repository link
2. Click the green **Code** button → **Open with GitHub Desktop**
3. Choose a folder to save the project (e.g. `Documents/cruzgoldlaw`)
4. Click **Clone**

You now have the full project on your computer.

---

## Folder Map — What to Touch vs. What Not to Touch

```
cruzgoldlaw/
│
├── ★ _content/          ← YOU WORK HERE — source files for new pages
├── ★ images/            ← ADD NEW IMAGES HERE
│
├── index.html           ← Homepage  (edit directly for text changes)
├── about.html           ← About Us  (edit directly for text changes)
├── blog.html            ← Blog listing — ADD A CARD HERE when you add a post
├── client-testimonials.html  ← Testimonials listing — ADD A CARD HERE for new testimonials
├── contact.html         ← Contact page
├── immigration-law.html ← Service page
├── (other .html files)  ← All other pages — edit directly for text changes
│
├── _partials/           ← DO NOT TOUCH (shared header, footer, nav)
├── css/                 ← DO NOT TOUCH
├── js/                  ← DO NOT TOUCH
└── build-page.mjs       ← The script that builds new pages (you run this)
```

**Rule of thumb:** New pages go through `_content/` + `build-page.mjs`. Text changes on existing pages = edit the `.html` file directly.

---

## Before You Start Anything — Always Pull First

Before any work session, get the latest version:

**Terminal/Command Prompt:**
```
cd path/to/cruzgoldlaw
git pull
```

**GitHub Desktop:** Select the repo → click **Fetch origin** → click **Pull origin**

---

## How to Add a New Blog Post

### Step 1 — Create the content file

1. Open the `_content/` folder
2. Copy `example-blog-post.html` — do not rename or delete the original
3. Rename the copy using the blog post topic, all lowercase, hyphens instead of spaces:

   ✓ `how-to-prepare-for-your-green-card-interview.html`
   ✓ `understanding-daca-renewals-in-2026.html`
   ✗ `New Blog Post.html` (no spaces)
   ✗ `BlogPost.html` (not descriptive)

---

### Step 2 — Fill in the metadata

Open the file in any text editor. At the top you will see:

```html
<!--
TITLE: Example Blog Post Title | Cruz Gold & Associates
DESCRIPTION: A short meta description for this blog post (under 160 characters).
CANONICAL: example-blog-post.html
CSS:
-->
```

Replace with your information. Leave `CSS:` blank — blog posts do not need it.

```html
<!--
TITLE: How to Prepare for Your Green Card Interview | Cruz Gold & Associates
DESCRIPTION: Preparing for your green card interview? Cruz Gold & Associates breaks down what to expect, what to bring, and how to answer confidently.
CANONICAL: how-to-prepare-for-your-green-card-interview.html
CSS:
-->
```

**Field meanings:**

| Field | What it is | Rule |
|---|---|---|
| `TITLE` | Text in the browser tab and Google results | End with `\| Cruz Gold & Associates`. Max ~60 characters total. |
| `DESCRIPTION` | 1-2 sentence summary shown in Google | Max 160 characters. Write naturally. |
| `CANONICAL` | This page's filename | Must exactly match the filename you gave the file. |
| `CSS` | Page-specific stylesheet | Leave blank for blog posts and testimonials. |

---

### Step 3 — Write the content

Below the `-->` line, write the page content. Copy-paste this complete example and replace the text:

```html
<!--
TITLE: How to Prepare for Your Green Card Interview | Cruz Gold & Associates
DESCRIPTION: Preparing for your green card interview? Cruz Gold & Associates breaks down what to expect, what to bring, and how to answer confidently.
CANONICAL: how-to-prepare-for-your-green-card-interview.html
CSS:
-->

<div id="content" class="site-content">
<div class="inside-site-info grid-container grid-parent">
<div class="content-area" id="primary">
<main id="main" class="site-main">
<article>
  <div class="inside-article">
    <header class="entry-header">
      <h1 class="entry-title">How to Prepare for Your Green Card Interview</h1>
    </header>
    <div class="entry-content">

      <p>The green card interview can feel intimidating — but with the right preparation, most applicants walk out with good news. Here is what you need to know.</p>

      <h2>What Happens at the Interview?</h2>
      <p>A USCIS officer will review your application, ask questions about your background and relationship (if family-based), and verify your documents. The interview typically lasts 20–30 minutes.</p>

      <h2>What to Bring</h2>
      <ul>
        <li>Your interview appointment notice</li>
        <li>A valid passport or government-issued photo ID</li>
        <li>All original documents you submitted with your application</li>
        <li>Any new documents (medical records, police certificates, financial records)</li>
        <li>A qualified immigration attorney — <a href="contact.html">we can accompany you</a></li>
      </ul>

      <h2>Common Questions You May Be Asked</h2>
      <p>Officers often ask about your immigration history, employment, travel outside the U.S., and criminal record. Answer honestly and briefly. Do not guess — if you do not know, say so.</p>

      <h2>Need Help Preparing?</h2>
      <p>Cruz Gold & Associates has helped hundreds of New Jersey families through the green card process since 1995. <a href="contact.html">Contact us</a> to schedule a consultation before your interview.</p>

    </div>
  </div>
</article>
</main>
</div>
</div>
</div>
```

**HTML quick reference:**

| Tag | What it does |
|---|---|
| `<h2>...</h2>` | Section heading |
| `<p>...</p>` | Paragraph |
| `<ul>...</ul>` | Bullet list (wrap your `<li>` items inside) |
| `<li>...</li>` | One bullet point |
| `<strong>...</strong>` | **Bold text** |
| `<a href="page.html">text</a>` | Link to another page on the site |
| `<a href="https://...">text</a>` | Link to an external website |

---

### Step 4 — Build the page

Open Terminal / Command Prompt, navigate to the project folder, run:

```
node build-page.mjs _content/how-to-prepare-for-your-green-card-interview.html
```

Success looks like:
```
✓  Built: how-to-prepare-for-your-green-card-interview.html  (38.4 KB)
```

If you see an error, see the [Troubleshooting](#troubleshooting) section at the bottom.

---

### Step 5 — Preview in your browser

Find the newly created `how-to-prepare-for-your-green-card-interview.html` file at the root of the project (not inside `_content/`). Double-click it to open in your browser.

Check:
- The title in the browser tab is correct
- The header and navigation appear at the top
- Your content reads correctly
- The footer appears at the bottom with the contact form

---

### Step 6 — Add a card to the blog listing page

The new blog post will not automatically appear on `blog.html`. You need to add it manually.

Open `blog.html` in a text editor. Find the line near line 312 that starts with:
```html
<div><div class="gb-looper-ab7dbb9f">
```

Immediately after that line, paste this block (replace the highlighted parts):

```html
<div class="gb-loop-item gb-loop-item-f6215a4d post-new post type-post status-publish format-standard has-post-thumbnail hentry category-blog">
<a href="how-to-prepare-for-your-green-card-interview.html"><img loading="lazy" decoding="async" width="512" height="341" alt="Green card interview preparation" class="gb-media-720fe08d" src="images/your-blog-image.webp" srcset="images/your-blog-image.webp 512w, images/your-blog-image-300x200.webp 300w" sizes="auto, (max-width: 512px) 100vw, 512px"></a>

<div class="gb-element-e00d3556">
<h5 class="gb-text gb-text-8d682ee1"><a href="how-to-prepare-for-your-green-card-interview.html">How to Prepare for Your Green Card Interview</a></h5>

<div class="has-link-color wp-block-post-excerpt has-text-color has-global-color-9-color"><p class="wp-block-post-excerpt__excerpt">The green card interview can feel intimidating — but with the right preparation, most applicants walk out with good news. Here is what you need to know.… </p></div>

<div class="gb-element-dd478c00">
<a class="gb-text button-style gb-text-bb8c018b" href="how-to-prepare-for-your-green-card-interview.html">Read More</a>
</div>
</div>
</div>
```

Replace:
- `how-to-prepare-for-your-green-card-interview.html` → your actual filename (appears 3 times)
- `your-blog-image.webp` → the image filename you added to `images/`
- `Green card interview preparation` → a description of the image
- The `h5` title text → your actual blog post title
- The excerpt text → a 1-2 sentence summary

---

### Step 7 — Publish

```
git add .
git commit -m "Add blog post: green card interview preparation"
git push
```

**GitHub Desktop:** Stage all files → type a summary → **Commit to master** → **Push origin**

The site updates within 1-2 minutes.

---

## How to Add a New Testimonial

### Step 1 — Create the content file

Copy `_content/example-blog-post.html`, paste in `_content/`, rename it:

`testimonial-firstname-lastname.html`

Examples from existing testimonials:
- `testimonial-agnes-kamara.html`
- `testimonial-frank-farmer.html`
- `testimonial-jenny-bock.html`

---

### Step 2 — Fill in the metadata

```html
<!--
TITLE: Sarah Johnson - Cruz Gold & Associates
DESCRIPTION: Sarah Johnson shares her experience working with Cruz Gold & Associates for her family immigration case in New Jersey.
CANONICAL: testimonial-sarah-johnson.html
CSS:
-->
```

Leave `CSS:` blank.

---

### Step 3 — Write the content

```html
<!--
TITLE: Sarah Johnson - Cruz Gold & Associates
DESCRIPTION: Sarah Johnson shares her experience working with Cruz Gold & Associates for her family immigration case in New Jersey.
CANONICAL: testimonial-sarah-johnson.html
CSS:
-->

<div id="content" class="site-content">
<div class="inside-site-info grid-container grid-parent">
<div class="content-area" id="primary">
<main id="main" class="site-main">
<article class="testimonial type-testimonial status-publish hentry" itemtype="https://schema.org/CreativeWork" itemscope="">
  <div class="inside-article">
    <header class="entry-header">
      <h1 class="entry-title" itemprop="headline">Sarah Johnson</h1>
    </header>
    <div class="entry-content" itemprop="text">
      <p>Working with Cruz Gold & Associates was the best decision we made for our immigration case. Zachary Cruz was professional, responsive, and genuinely cared about our outcome. He walked us through every step and kept us informed throughout the entire process. We are now permanent residents and couldn't be more grateful.</p>
    </div>
  </div>
</article>
</main>
</div>
</div>
</div>
```

Replace the name and review text.

---

### Step 4 — Build and preview

```
node build-page.mjs _content/testimonial-sarah-johnson.html
```

Double-click `testimonial-sarah-johnson.html` at the project root to preview.

---

### Step 5 — Add a card to the testimonials listing page

Open `client-testimonials.html`. Find the line near line 306 that starts with:
```html
<div><div class="gb-looper-cc2f9f8c">
```

Immediately after that line, paste this block:

```html
<div class="gb-loop-item gb-loop-item-f7e6fc0e post-new testimonial type-testimonial status-publish hentry">
<img loading="lazy" decoding="async" width="1137" height="182" class="gb-media-01a751e2" src="images/Star-Icon.webp" title="Star Icon" srcset="images/Star-Icon.webp 1137w, images/Star-Icon-300x48.webp 300w, images/Star-Icon-1024x164.webp 1024w, images/Star-Icon-768x123.webp 768w" sizes="auto, (max-width: 1137px) 100vw, 1137px">

<h2 class="gb-text gb-text-00048ccd"><a href="testimonial-sarah-johnson.html">Sarah Johnson</a></h2>

<p class="gb-text gb-text-250a70e4">Working with Cruz Gold & Associates was the best decision we made for our immigration case. Zachary Cruz was professional, responsive, and genuinely cared about our outcome.</p>
</div>
```

Replace:
- `testimonial-sarah-johnson.html` → your actual filename
- `Sarah Johnson` → the client's name
- The `<p>` text → the first 1-2 sentences of the review (not the full review)

---

### Step 6 — Publish

```
git add .
git commit -m "Add testimonial: Sarah Johnson"
git push
```

---

## How to Edit Existing Page Content

For text changes on pages that already exist (updating a phone number, fixing a typo, changing a heading), you edit the `.html` file directly — no build step needed.

1. Open the `.html` file in a text editor
2. Use **Ctrl+F** (Windows) or **Cmd+F** (Mac) to search for the text you want to change
3. Edit the text
4. Save the file
5. Preview by double-clicking the file
6. Publish: `git add .` → `git commit -m "your description"` → `git push`

**Do not edit anything inside `_partials/`.** Those files control the header and footer on every page — a typo there breaks the entire site.

---

## How to Add a New Image

### Step 1 — Prepare the image

- Format: `.webp` is preferred. Convert free at https://squoosh.app
- Name: all lowercase, hyphens, no spaces — `green-card-interview-nj.webp`
- Size: under 300KB for photos, under 100KB for icons/logos

### Step 2 — Drop it in the images folder

Drag the file into the `images/` folder in your project.

### Step 3 — Use it in your content

```html
<img loading="lazy" decoding="async" width="800" height="533"
  src="images/green-card-interview-nj.webp"
  alt="Immigration attorney meeting with client in New Jersey"
  srcset="images/green-card-interview-nj.webp 800w"
  sizes="(max-width: 800px) 100vw, 800px">
```

Replace:
- `green-card-interview-nj.webp` → your image filename (appears twice)
- `800` and `533` → the actual pixel width and height of your image
- The `alt` text → a plain English description of what is in the image

---

## Troubleshooting

### Build script errors

| Error message | What it means | Fix |
|---|---|---|
| `content file not found` | Filename in command doesn't match the actual file | Copy-paste the filename exactly from your file explorer |
| `missing required field(s): TITLE` | A required metadata field is blank | Open the file, fill in TITLE, DESCRIPTION, and CANONICAL |
| `must start with a metadata comment block` | The `<!--` block at top is missing | Copy it back from `_content/example-blog-post.html` |

### Page looks broken in browser

- Every opening tag needs a closing tag: `<p>text</p>` not `<p>text`
- The outer `<div id="content" class="site-content">` wrapper must not be deleted
- Compare your file to `_content/example-blog-post.html` to spot differences

### git push fails

- **`rejected` or `non-fast-forward`** → run `git pull` first, then `git push` again
- **Authentication error** → ask the developer to set up a GitHub Personal Access Token for you

### Not sure if something looks right

Do not guess. Message the developer with:
1. A screenshot of the error or the page
2. The filename you were working on
3. Which step you were on

---

## Quick Reference

| Task | Command |
|---|---|
| Get latest changes | `git pull` |
| Build a new page | `node build-page.mjs _content/your-file.html` |
| Stage all changes | `git add .` |
| Save a commit | `git commit -m "short description"` |
| Publish to live site | `git push` |

All commands run in Terminal (Mac) or Command Prompt (Windows) from inside the project folder.
