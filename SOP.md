# SOP — Cruz Gold & Associates Static Site

Standard Operating Procedure for the VA managing content on cruzgoldlaw.com.

**You are not expected to know how to code.** This document tells you exactly what to do for every common task, step by step. When something is unclear or goes wrong, use Claude — instructions for that are in every section.

Before doing anything in this document, make sure you have completed the one-time setup in `VA-GUIDE.md`.

---

## Adding a New Blog Post

1. Open the project folder on your computer
2. Pull the latest version first: run `git pull` in Terminal / Command Prompt
3. Go into the `_content/` folder
4. Copy `example-blog-post.html`, paste it in the same folder, rename it to the post topic — all lowercase, hyphens instead of spaces: `how-to-renew-your-green-card.html`
5. Open the file in a text editor
6. Fill in the metadata block at the top — see `VA-GUIDE.md` for what each field means
7. Write the blog post content below the `-->` closing tag — see `VA-GUIDE.md` for the full copy-paste content template
8. If you want Claude to write or review the content before you publish:
   - Open Claude (claude.ai or Claude Code)
   - Say: *"I'm adding a blog post to an immigration law firm's static website. Here is the content file I'm about to publish — please review it for accuracy, grammar, tone, and any HTML errors before I push it live."*
   - Paste the full contents of your file
   - Fix anything Claude flags
9. Build the page: `node build-page.mjs _content/how-to-renew-your-green-card.html`
10. Preview: double-click the new `how-to-renew-your-green-card.html` file that appears in the project root — it opens in your browser
11. Check that the header, content, and footer all look correct
12. Add a card for the post to `blog.html` — see `VA-GUIDE.md` for the exact copy-paste HTML block
13. Publish:
    ```
    git add .
    git commit -m "Add blog post: how to renew your green card"
    git push
    ```
14. Wait 1-2 minutes, then check the live site to confirm it appears correctly

---

## Adding a New Testimonial

1. Pull the latest version: `git pull`
2. Go into `_content/`, copy `example-blog-post.html`, rename it: `testimonial-client-name.html`
3. Open the file, fill in the metadata block, write the testimonial content — see `VA-GUIDE.md` for the full template
4. Optional Claude review: paste the file contents into Claude and say *"Review this testimonial page for an immigration law firm — check for HTML errors, grammar, and tone."*
5. Build: `node build-page.mjs _content/testimonial-client-name.html`
6. Preview by double-clicking the built file
7. Add a card to `client-testimonials.html` — see `VA-GUIDE.md` for the exact copy-paste HTML block
8. Publish: `git add .` → `git commit -m "Add testimonial: client name"` → `git push`
9. Check the live site after 1-2 minutes

---

## Adding a New Service Page

Service pages require a page-specific CSS file that only the developer can create.

1. **Message the developer first** and ask them to create the CSS file for the new service page. Tell them the page name (e.g. "deportation defense"). They will give you a filename like `css/gb-deportation-defense.css`
2. Once you have the CSS filename, follow the same steps as adding a blog post — but put the CSS filename in the `CSS:` field of the metadata block:
   ```
   CSS: css/gb-deportation-defense.css
   ```
3. For content, ask Claude to write the page:
   - Open Claude
   - Say: *"Write a service page for an immigration law firm called Cruz Gold & Associates in New Jersey. The service is [service name]. The firm has been operating since 1995, is led by Zachary Cruz, is fluent in Spanish and English, and serves clients in New Jersey, Philadelphia, and Houston. Write it in HTML using `<h2>`, `<p>`, `<ul>`, and `<li>` tags only. Keep the tone professional but approachable."*
   - Paste Claude's output into your content file below the `-->` tag
4. Build, preview, and publish following the same steps as a blog post

---

## Updating the Navigation Menu

The navigation menu appears in three places inside `_partials/header.html` — the desktop menu, the mobile header menu, and the slideout menu. **If you update one, you must update all three or the menus will be inconsistent.**

Because of this complexity, navigation changes carry the highest risk of breaking something. Follow these steps carefully.

1. Pull the latest version: `git pull`
2. Open `_partials/header.html` in a text editor
3. Use **Ctrl+F** (Windows) or **Cmd+F** (Mac) to find the nav item you want to change — search for the current link text (e.g. `Blog`)
4. Before making any changes, paste the full contents of `_partials/header.html` into Claude and say: *"I need to [describe your change — e.g. add a new menu item called 'Deportation Defense' linking to deportation-defense.html]. This header file has three nav menus: desktop, mobile, and slideout. Show me exactly what to change in each location, with the complete HTML for each change."*
5. Apply Claude's changes exactly
6. Save the file
7. Open any existing page (e.g. `index.html`) in your browser and check the navigation looks correct on both desktop and mobile
8. Publish: `git add .` → `git commit -m "Update navigation: add deportation defense link"` → `git push`
9. Check the live site

**If the navigation looks broken at any point, do not push. Run `git restore _partials/header.html` to undo your changes and contact the developer.**

---

## Updating the Footer

The footer (links, copyright text, social media links) is in `_partials/footer.html`. Changes here affect every page on the site.

1. Pull: `git pull`
2. Open `_partials/footer.html`
3. Use **Ctrl+F** to find the text you want to change
4. Make the change
5. Open any existing page in your browser and scroll to the bottom to verify it looks correct
6. Publish: `git add .` → `git commit -m "Update footer: [what you changed]"` → `git push`

---

## Updating Contact Information

The firm's phone number, email, and address appear in `_partials/footer.html`. The current values are:

- **Phone:** (609) 924-8500
- **Email:** info@cruzgoldlaw.com
- **Address:** 830 Bear Tavern Rd Ste 108, Ewing Township, NJ 08628

To update:

1. Open `_partials/footer.html`
2. Use **Ctrl+F** to search for the current phone number / email / address
3. Update every place it appears (there may be more than one — search thoroughly)
4. Also check `_partials/header.html` and the individual service pages in case the contact info is repeated there
5. Publish: `git add .` → `git commit -m "Update contact info"` → `git push`

---

## Adding a New Image

1. Rename your image file: all lowercase, hyphens instead of spaces, no special characters
   - ✓ `green-card-interview-nj.webp`
   - ✗ `Green Card Interview (NJ).jpg`
2. Convert to `.webp` format if it is not already — free tool: https://squoosh.app
   - Target size: under 300KB for photos, under 100KB for icons
3. Drop the file into the `images/` folder in the project
4. Reference it in your content file — see `VA-GUIDE.md` for the exact `<img>` tag format

---

## What to Do If the Build Fails

The build command (`node build-page.mjs`) will print a clear error message in the terminal if something is wrong.

1. Read the error message — it tells you exactly what is wrong
2. Check the `VA-GUIDE.md` troubleshooting table first — most errors are explained there
3. If the error is not in the table, open Claude and say: *"I'm running `node build-page.mjs` on a static HTML site and got this error. What does it mean and how do I fix it?"* — then paste the full error message
4. Follow Claude's instructions
5. If still stuck after following Claude's fix, contact the developer — send them a screenshot of the terminal error

---

## What to Do If a Page Looks Wrong After Deploying

1. First check if the issue is in your content file:
   - Open the `.html` file that looks wrong (the built file, not the `_content/` source)
   - Use Ctrl+F to find the broken section
   - Paste the relevant section into Claude and say: *"This HTML is rendering incorrectly on my static site — [describe what looks wrong]. What is the problem and how do I fix it?"*
   - If it is a content/HTML issue, fix it in the `_content/` source file, rebuild, and push
2. If the problem appears on every page (header or footer looks wrong):
   - Check `_partials/header.html` or `_partials/footer.html` for the issue
   - Paste the relevant partial into Claude and describe the problem
3. If the issue looks like a layout or styling problem (spacing is off, colors are wrong, sections are misaligned) — **do not edit `css/` files**. Contact the developer and describe exactly what looks wrong and on which page.

---

## Using Claude for Content Writing

Claude can write or improve any content on this site. Use it freely for:

- Writing full blog posts: *"Write a 600-word blog post for an immigration law firm called Cruz Gold & Associates in New Jersey about [topic]. Professional but approachable tone. Use `<h2>`, `<p>`, `<ul>`, `<li>` tags."*
- Improving existing content: *"Rewrite this section to sound more professional"* — paste the text
- Writing meta descriptions: *"Write a meta description under 160 characters for a page about [topic] for Cruz Gold & Associates, an immigration law firm in New Jersey"*
- Reviewing before publishing: *"Check this HTML file for errors before I publish it"* — paste the file
- Fixing build errors: paste the error message and ask what it means
- Any task where you are unsure: describe what you are trying to do and ask Claude to either do it or tell you the exact steps

**General rule:** When in doubt, ask Claude first. It can read files, catch mistakes, and explain what to do — all before anything goes live.

---

## Summary Checklist for Every Task

Before pushing anything live:

- [ ] Did you `git pull` before starting?
- [ ] Did you fill in all three required metadata fields (TITLE, DESCRIPTION, CANONICAL)?
- [ ] Did you run `node build-page.mjs` and see a success message?
- [ ] Did you preview the page by double-clicking the built `.html` file?
- [ ] If you added a blog post — did you add the card to `blog.html`?
- [ ] If you added a testimonial — did you add the card to `client-testimonials.html`?
- [ ] Did you commit with a clear description of what you did?
