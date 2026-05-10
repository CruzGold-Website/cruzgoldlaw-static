import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, readdirSync, statSync } from 'fs';
import { join, basename, extname } from 'path';
import { execSync } from 'child_process';

const SCRAPED = './site/cruzgoldlaw.com';
const OUTPUT = './output';
const DOMAIN = 'cruzgoldlaw.com';

// ============================================================
// STEP 0: Setup clean directory structure
// ============================================================
console.log('=== STEP 0: Setup directories ===');
for (const dir of ['css', 'js', 'images', 'fonts']) {
  mkdirSync(join(OUTPUT, dir), { recursive: true });
}

// ============================================================
// STEP 1: Map all pages to flat filenames
// ============================================================
const slugMap = {
  '': 'index.html',
  'about': 'about.html',
  'app-privacy-policy': 'app-privacy-policy.html',
  'blog': 'blog.html',
  'client-testimonials': 'client-testimonials.html',
  'contact': 'contact.html',
  'family-immigration-lawyer-new-jersey': 'family-immigration-lawyer-new-jersey.html',
  'family-immigration-lp': 'family-immigration-lp.html',
  'h1b-visa-lawyer-new-jersey': 'h1b-visa-lawyer-new-jersey.html',
  'immigration-law': 'immigration-law.html',
  'immigration-lawyer-houston': 'immigration-lawyer-houston.html',
  'immigration-lawyer-new-jersey': 'immigration-lawyer-new-jersey.html',
  'immigration-lawyer-philadelphia': 'immigration-lawyer-philadelphia.html',
  'locations-programmatic-template': 'locations-programmatic-template.html',
  'o-1-visa-lawyer-nj': 'o-1-visa-lawyer-nj.html',
  'privacy-policy': 'privacy-policy.html',
  'spouse-immigration-lp': 'spouse-immigration-lp.html',
  'student-visa-lawyer-new-jersey': 'student-visa-lawyer-new-jersey.html',
  'what-we-do': 'what-we-do.html',
  'work-visa-lawyer-new-jersey': 'work-visa-lawyer-new-jersey.html',
  // Blog posts
  'eb-3-visa-lawyer': 'eb-3-visa-lawyer.html',
  'experienced-fiance-visa-lawyer': 'experienced-fiance-visa-lawyer.html',
  'trusted-marriage-green-card-lawyer': 'trusted-marriage-green-card-lawyer.html',
  'adjustment-of-status-lawyer': 'adjustment-of-status-lawyer.html',
  'eb-1a-lawyer-expert-guidance': 'eb-1a-lawyer-expert-guidance.html',
  'partner-with-a-dedicated-eb-2-niw-lawyer': 'partner-with-a-dedicated-eb-2-niw-lawyer.html',
  'immigration-lawyer-cost': 'immigration-lawyer-cost.html',
  'dedicated-immigration-lawyer-in-jersey-city': 'dedicated-immigration-lawyer-in-jersey-city.html',
  'compassionate-immigration-lawyer-elizabeth-nj': 'compassionate-immigration-lawyer-elizabeth-nj.html',
  'e-2-visa-lawyer-for-investors-entrepreneurs': 'e-2-visa-lawyer-for-investors-entrepreneurs.html',
  'naturalization-lawyer-new-jersey': 'naturalization-lawyer-new-jersey.html',
  'immigration-attorneys-near-me': 'immigration-attorneys-near-me.html',
  'expert-eb-5-visa-lawyer': 'expert-eb-5-visa-lawyer.html',
  'new-jersey-us-immigration-laws': 'new-jersey-us-immigration-laws.html',
  'cruz-gold-law-trusted-immigration-lawyers-in-new-jersey': 'cruz-gold-law-trusted-immigration-lawyers-in-new-jersey.html',
  'tn-visa-lawyer': 'tn-visa-lawyer.html',
  'trusted-l-1-visa-lawyer': 'trusted-l-1-visa-lawyer.html',
  'the-waiting-game-understanding-lengthy-immigration-process-times-in-the-u-s': 'the-waiting-game-understanding-lengthy-immigration-process-times-in-the-u-s.html',
  'traveling-abroad-as-a-non-citizen-key-considerations': 'traveling-abroad-as-a-non-citizen-key-considerations.html',
  'understanding-the-rights-of-undocumented-individuals-in-the-usa': 'understanding-the-rights-of-undocumented-individuals-in-the-usa.html',
  'common-misconceptions-in-immigration-law': 'common-misconceptions-in-immigration-law.html',
  'navigating-immigration-changes-under-the-2025-trump-administration': 'navigating-immigration-changes-under-the-2025-trump-administration.html',
  // Testimonials
  'testimonial/jenny-bock': 'testimonial-jenny-bock.html',
  'testimonial/paul-maxon': 'testimonial-paul-maxon.html',
  'testimonial/laura-szwed': 'testimonial-laura-szwed.html',
  'testimonial/marek-zawarus': 'testimonial-marek-zawarus.html',
  'testimonial/frank-farmer': 'testimonial-frank-farmer.html',
  'testimonial/dave-ropiak': 'testimonial-dave-ropiak.html',
  'testimonial/herminia-maxon': 'testimonial-herminia-maxon.html',
  'testimonial/fredy-tay-red': 'testimonial-fredy-tay-red.html',
  'testimonial/nicole-noonan': 'testimonial-nicole-noonan.html',
  'testimonial/lukas-mchugh': 'testimonial-lukas-mchugh.html',
  'testimonial/vanessa-noel': 'testimonial-vanessa-noel.html',
  'testimonial/andrew': 'testimonial-andrew.html',
  'testimonial/leo-brunetti': 'testimonial-leo-brunetti.html',
  'testimonial/ali-jamil': 'testimonial-ali-jamil.html',
  'testimonial/rune-bendix-kjoelstad': 'testimonial-rune-bendix-kjoelstad.html',
  'testimonial/rachael-schuh': 'testimonial-rachael-schuh.html',
  'testimonial/anchal-kannambadi': 'testimonial-anchal-kannambadi.html',
  'testimonial/martin-sampson': 'testimonial-martin-sampson.html',
  'testimonial/agnes-kamara': 'testimonial-agnes-kamara.html',
  'testimonial/omar-graffie': 'testimonial-omar-graffie.html',
  // Category
  'category/blog': 'category-blog.html',
};

// ============================================================
// STEP 2: CSS file mapping (scraped name → clean name)
// ============================================================
const cssMap = {
  'formidableforms_ver=4122250.css': 'formidableforms.css',
  'fonts_ver=1758722447.css': 'fonts.css',
  'style.min_ver=6.9.4.css': 'block-library.css',
  'style_ver=6.9.4.css': 'suntyp-slider.css',
  'custome-style_ver=1.0.1.css': 'owl-carousel-custom.css',
  'main.min_ver=3.6.1.css': 'generatepress-main.css',
  'style-global_ver=1742418875.css': 'generateblocks-global.css',
  'offside.min_ver=2.5.5.css': 'offside.css',
  'navigation-branding-flex.min_ver=2.5.5.css': 'navigation-branding.css',
  'fluent-forms-public_ver=6.1.11.css': 'fluent-forms-public.css',
  'fluentform-public-default_ver=6.1.11.css': 'fluent-forms-default.css',
  'accordion-style_ver=2.4.0.css': 'accordion-style.css',
  'featured-images.min_ver=2.5.5.css': 'featured-images.css',
};

// Page-specific GenerateBlocks CSS
const gbCssFiles = {};
const gbDir = join(SCRAPED, 'wp-content/uploads/generateblocks');
if (existsSync(gbDir)) {
  for (const f of readdirSync(gbDir)) {
    if (f.endsWith('.css') && f !== 'style-global_ver=1742418875.css') {
      // style-17_ver=1771921637.css → generateblocks-17.css
      const match = f.match(/style-(\d+)_ver=/);
      if (match) {
        gbCssFiles[f] = `generateblocks-${match[1]}.css`;
      }
    }
  }
}

// ============================================================
// STEP 3: JS file mapping
// ============================================================
const jsMap = {
  'jquery.min_ver=3.7.1.js': 'jquery.min.js',
  'jquery-migrate.min_ver=3.4.1.js': 'jquery-migrate.min.js',
  'form-submission_ver=6.1.11.js': 'fluent-form-submission.js',
  'accordion_ver=2.4.0.js': 'accordion.js',
  'smooth-scroll.min_ver=2.5.5.js': 'smooth-scroll.min.js',
  'offside.min_ver=2.5.5.js': 'offside.min.js',
  'sticky.min_ver=2.5.5.js': 'sticky.min.js',
  'script.js': 'suntyp-slider.js',
  'custom-slider_ver=1.0.1.js': 'owl-carousel-custom.js',
  'back-to-top.min_ver=3.6.1.js': 'back-to-top.min.js',
  'menu.min_ver=3.6.1.js': 'menu.min.js',
  'swiper-init.js': 'swiper-init.js',
};

// ============================================================
// STEP 4: Copy and rename CSS files
// ============================================================
console.log('=== STEP 4: Copy CSS files ===');
function findFile(dir, filename) {
  if (!existsSync(dir)) return null;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = findFile(full, filename);
      if (found) return found;
    } else if (entry.name === filename) {
      return full;
    }
  }
  return null;
}

let cssCopied = 0;
for (const [scraped, clean] of Object.entries(cssMap)) {
  const src = findFile(join(SCRAPED, 'wp-content'), scraped);
  if (src) {
    copyFileSync(src, join(OUTPUT, 'css', clean));
    cssCopied++;
  } else {
    console.log(`  WARN: CSS not found: ${scraped}`);
  }
}
for (const [scraped, clean] of Object.entries(gbCssFiles)) {
  const src = join(SCRAPED, 'wp-content/uploads/generateblocks', scraped);
  if (existsSync(src)) {
    copyFileSync(src, join(OUTPUT, 'css', clean));
    cssCopied++;
  }
}
console.log(`  Copied ${cssCopied} CSS files`);

// ============================================================
// STEP 5: Copy and rename JS files
// ============================================================
console.log('=== STEP 5: Copy JS files ===');
let jsCopied = 0;
for (const [scraped, clean] of Object.entries(jsMap)) {
  const src = findFile(join(SCRAPED, 'wp-content'), scraped) || findFile(join(SCRAPED, 'wp-includes'), scraped);
  if (src) {
    copyFileSync(src, join(OUTPUT, 'js', clean));
    jsCopied++;
  } else {
    console.log(`  WARN: JS not found: ${scraped}`);
  }
}
console.log(`  Copied ${jsCopied} JS files`);

// ============================================================
// STEP 6: Copy all images
// ============================================================
console.log('=== STEP 6: Copy images ===');
const imagesSeen = new Map(); // filename → source path (track duplicates)
let imgCopied = 0;

function copyImages(dir) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      copyImages(full);
    } else if (/\.(webp|png|jpg|jpeg|gif|svg|ico)$/i.test(entry.name)) {
      let outName = entry.name;
      if (imagesSeen.has(outName)) {
        // Check if same file (same size)
        const existingSize = statSync(imagesSeen.get(outName)).size;
        const newSize = statSync(full).size;
        if (existingSize !== newSize) {
          // Different file, rename
          const ext = extname(outName);
          const base = basename(outName, ext);
          outName = `${base}-2${ext}`;
          console.log(`  DUPE: ${entry.name} → ${outName}`);
        } else {
          // Same file, skip
          return;
        }
      }
      imagesSeen.set(outName, full);
      copyFileSync(full, join(OUTPUT, 'images', outName));
      imgCopied++;
    }
  }
}

copyImages(join(SCRAPED, 'wp-content/uploads'));
console.log(`  Copied ${imgCopied} images`);

// ============================================================
// STEP 7: Download external CDN assets
// ============================================================
console.log('=== STEP 7: Download external CDN assets ===');

function download(url, dest) {
  if (existsSync(dest)) {
    console.log(`  SKIP (exists): ${basename(dest)}`);
    return;
  }
  try {
    execSync(`curl -sL -o "${dest}" "${url}"`, { timeout: 30000 });
    const size = statSync(dest).size;
    if (size === 0) {
      console.log(`  WARN: Empty file: ${basename(dest)}`);
    } else {
      console.log(`  OK: ${basename(dest)} (${size} bytes)`);
    }
  } catch (e) {
    console.log(`  FAIL: ${url} - ${e.message}`);
  }
}

// Swiper
download('https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css', join(OUTPUT, 'css', 'swiper-bundle.min.css'));
download('https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js', join(OUTPUT, 'js', 'swiper-bundle.min.js'));

// Owl Carousel
download('https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/assets/owl.carousel.min.css', join(OUTPUT, 'css', 'owl.carousel.min.css'));
download('https://cdnjs.cloudflare.com/ajax/libs/OwlCarousel2/2.3.4/owl.carousel.min.js', join(OUTPUT, 'js', 'owl.carousel.min.js'));

// Hostinger background image
download('https://indigo-horse-622910.hostingersite.com/wp-content/uploads/2025/03/Menu_background-1.webp', join(OUTPUT, 'images', 'Menu_background-1.webp'));

// ============================================================
// STEP 8: Download font files
// ============================================================
console.log('=== STEP 8: Download font files ===');
const fontsCss = readFileSync(findFile(join(SCRAPED, 'wp-content'), 'fonts_ver=1758722447.css'), 'utf8');
const fontUrls = [...fontsCss.matchAll(/url\(['"]?(https:\/\/cruzgoldlaw\.com\/[^'")\s]+)['"]?\)/g)].map(m => m[1]);
const uniqueFontUrls = [...new Set(fontUrls)];
console.log(`  Found ${uniqueFontUrls.length} unique font URLs`);

for (const url of uniqueFontUrls) {
  const filename = url.split('/').pop();
  download(url, join(OUTPUT, 'fonts', filename));
}

// ============================================================
// STEP 9: Build URL rewrite map for CSS references in HTML
// ============================================================
console.log('=== STEP 9: Build URL rewrite rules ===');

// Build a map of all scraped CSS/JS paths to their clean output paths
const cssUrlMap = {};
const jsUrlMap = {};

// CSS: map WordPress paths to clean names
const cssRewrites = {
  'wp-content/plugins/formidable/css/formidableforms_ver%3D4122250.css': 'css/formidableforms.css',
  'wp-content/uploads/generatepress/fonts/fonts_ver%3D1758722447.css': 'css/fonts.css',
  'wp-includes/css/dist/block-library/style.min_ver%3D6.9.4.css': 'css/block-library.css',
  'wp-content/plugins/suntyp-slider-2/assets/css/style_ver%3D6.9.4.css': 'css/suntyp-slider.css',
  'wp-content/plugins/wp-owl-carousel-slider/assets/custome-style_ver%3D1.0.1.css': 'css/owl-carousel-custom.css',
  'wp-content/themes/generatepress/assets/css/main.min_ver%3D3.6.1.css': 'css/generatepress-main.css',
  'wp-content/uploads/generateblocks/style-global_ver%3D1742418875.css': 'css/generateblocks-global.css',
  'wp-content/plugins/gp-premium/menu-plus/functions/css/offside.min_ver%3D2.5.5.css': 'css/offside.css',
  'wp-content/plugins/gp-premium/menu-plus/functions/css/navigation-branding-flex.min_ver%3D2.5.5.css': 'css/navigation-branding.css',
  'wp-content/plugins/fluentform/assets/css/fluent-forms-public_ver%3D6.1.11.css': 'css/fluent-forms-public.css',
  'wp-content/plugins/fluentform/assets/css/fluentform-public-default_ver%3D6.1.11.css': 'css/fluent-forms-default.css',
  'wp-content/plugins/generateblocks-pro/dist/accordion-style_ver%3D2.4.0.css': 'css/accordion-style.css',
  'wp-content/plugins/gp-premium/blog/functions/css/featured-images.min_ver%3D2.5.5.css': 'css/featured-images.css',
};

// Add generateblocks page-specific CSS
for (const [scraped, clean] of Object.entries(gbCssFiles)) {
  cssRewrites[`wp-content/uploads/generateblocks/${scraped.replace(/=/g, '%3D')}`] = `css/${clean}`;
}

const jsRewrites = {
  'wp-includes/js/jquery/jquery.min_ver%3D3.7.1.js': 'js/jquery.min.js',
  'wp-includes/js/jquery/jquery-migrate.min_ver%3D3.4.1.js': 'js/jquery-migrate.min.js',
  'wp-content/plugins/fluentform/assets/js/form-submission_ver%3D6.1.11.js': 'js/fluent-form-submission.js',
  'wp-content/plugins/generateblocks-pro/dist/accordion_ver%3D2.4.0.js': 'js/accordion.js',
  'wp-content/plugins/gp-premium/general/js/smooth-scroll.min_ver%3D2.5.5.js': 'js/smooth-scroll.min.js',
  'wp-content/plugins/gp-premium/menu-plus/functions/js/offside.min_ver%3D2.5.5.js': 'js/offside.min.js',
  'wp-content/plugins/gp-premium/menu-plus/functions/js/sticky.min_ver%3D2.5.5.js': 'js/sticky.min.js',
  'wp-content/plugins/suntyp-slider-2/assets/js/script.js': 'js/suntyp-slider.js',
  'wp-content/plugins/wp-owl-carousel-slider/assets/custom-slider_ver%3D1.0.1.js': 'js/owl-carousel-custom.js',
  'wp-content/themes/generatepress/assets/js/back-to-top.min_ver%3D3.6.1.js': 'js/back-to-top.min.js',
  'wp-content/themes/generatepress/assets/js/menu.min_ver%3D3.6.1.js': 'js/menu.min.js',
  'wp-content/themes/generatepress/swiper-init.js': 'js/swiper-init.js',
};

// ============================================================
// STEP 10: Process each HTML file
// ============================================================
console.log('=== STEP 10: Process HTML files ===');

// Collect all image filenames for mapping
const allImages = new Set(readdirSync(join(OUTPUT, 'images')));

function processHtml(html, filename) {
  let changes = 0;

  // --- CSS URL rewrites ---
  for (const [wpPath, cleanPath] of Object.entries(cssRewrites)) {
    // Handle both relative and absolute URLs, with or without %3D encoding
    const wpPathDecoded = wpPath.replace(/%3D/g, '=');
    const patterns = [
      wpPath,
      wpPathDecoded,
      `https://cruzgoldlaw.com/${wpPath}`,
      `https://cruzgoldlaw.com/${wpPathDecoded}`,
      `https://www.cruzgoldlaw.com/${wpPath}`,
      `https://www.cruzgoldlaw.com/${wpPathDecoded}`,
    ];
    for (const pattern of patterns) {
      if (html.includes(pattern)) {
        html = html.split(pattern).join(cleanPath);
        changes++;
      }
    }
  }

  // --- JS URL rewrites ---
  for (const [wpPath, cleanPath] of Object.entries(jsRewrites)) {
    const wpPathDecoded = wpPath.replace(/%3D/g, '=');
    const patterns = [
      wpPath,
      wpPathDecoded,
      `https://cruzgoldlaw.com/${wpPath}`,
      `https://cruzgoldlaw.com/${wpPathDecoded}`,
    ];
    for (const pattern of patterns) {
      if (html.includes(pattern)) {
        html = html.split(pattern).join(cleanPath);
        changes++;
      }
    }
  }

  // --- External CDN CSS/JS ---
  html = html.replace(/https:\/\/cdn\.jsdelivr\.net\/npm\/swiper@11\/swiper-bundle\.min\.css[^"']*/g, 'css/swiper-bundle.min.css');
  html = html.replace(/https:\/\/cdn\.jsdelivr\.net\/npm\/swiper@11\/swiper-bundle\.min\.js/g, 'js/swiper-bundle.min.js');
  html = html.replace(/https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/OwlCarousel2\/2\.3\.4\/assets\/owl\.carousel\.min\.css[^"']*/g, 'css/owl.carousel.min.css');
  html = html.replace(/https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/OwlCarousel2\/2\.3\.4\/owl\.carousel\.min\.js[^"']*/g, 'js/owl.carousel.min.js');

  // --- Image URLs ---
  // Handle absolute image URLs from cruzgoldlaw.com
  html = html.replace(/https?:\/\/(www\.)?cruzgoldlaw\.com\/wp-content\/uploads\/[^"')\s]+/g, (match) => {
    // Don't catch CSS/JS
    if (/\.(css|js)(\?.*)?$/i.test(match)) return match;
    const fname = match.split('/').pop().split('?')[0];
    if (allImages.has(fname)) {
      return `images/${fname}`;
    }
    console.log(`  WARN [${filename}]: Image not found locally: ${fname}`);
    return match;
  });

  // Handle relative image URLs (scraper already made some relative)
  html = html.replace(/(?:src|srcset)="(wp-content\/uploads\/[^"]+)"/g, (match, path) => {
    if (/\.(css|js)$/i.test(path)) return match;
    const fname = path.split('/').pop().split('?')[0];
    if (allImages.has(fname)) {
      return match.replace(path, `images/${fname}`);
    }
    console.log(`  WARN [${filename}]: Relative image not found: ${fname}`);
    return match;
  });

  // Handle srcset with multiple entries
  html = html.replace(/srcset="([^"]+)"/g, (match, srcsetVal) => {
    const newVal = srcsetVal.replace(/(?:https?:\/\/(?:www\.)?cruzgoldlaw\.com\/)?wp-content\/uploads\/[^\s,]+/g, (imgUrl) => {
      const fname = imgUrl.split('/').pop().split('?')[0];
      if (allImages.has(fname)) return `images/${fname}`;
      return imgUrl;
    });
    return `srcset="${newVal}"`;
  });

  // Hostinger staging image
  html = html.replace(/https:\/\/indigo-horse-622910\.hostingersite\.com\/wp-content\/uploads\/2025\/03\/Menu_background-1\.webp/g, 'images/Menu_background-1.webp');

  // --- Font URLs in inline CSS ---
  html = html.replace(/url\(['"]?https:\/\/cruzgoldlaw\.com\/wp-content\/uploads\/generatepress\/fonts\/[^'")\s]+['"]?\)/g, (match) => {
    const fname = match.match(/\/([^/'")\s]+)['"]?\)$/)?.[1];
    if (fname) return `url('fonts/${fname}')`;
    return match;
  });

  // --- Internal links ---
  // Full URLs
  html = html.replace(/href="https?:\/\/(www\.)?cruzgoldlaw\.com\/([^"]*)"/g, (match, www, path) => {
    let anchor = '';
    let cleanPath = path;
    const anchorIdx = cleanPath.indexOf('#');
    if (anchorIdx !== -1) {
      anchor = cleanPath.substring(anchorIdx);
      cleanPath = cleanPath.substring(0, anchorIdx);
    }
    // Remove query string
    const qIdx = cleanPath.indexOf('?');
    if (qIdx !== -1) cleanPath = cleanPath.substring(0, qIdx);
    // Remove trailing slash
    cleanPath = cleanPath.replace(/\/$/, '');

    // CRITICAL: Skip file extensions
    if (/\.(svg|png|jpg|jpeg|webp|gif|js|css|ico|pdf|xml|json|php|otf|woff|woff2|ttf)$/i.test(cleanPath)) {
      return match;
    }
    // Skip WordPress internals
    if (/^(feed|wp-json|xmlrpc|author\/|wp-content|wp-admin|wp-login)/.test(cleanPath)) return match;

    const localFile = slugMap[cleanPath];
    if (localFile) return `href="${localFile}${anchor}"`;

    console.log(`  WARNING [${filename}]: Unknown internal link: /${cleanPath}`);
    return match;
  });

  // Relative internal links: href="/slug/"
  html = html.replace(/href="\/([^"]*?)"/g, (match, path) => {
    let anchor = '';
    let cleanPath = path;
    const anchorIdx = cleanPath.indexOf('#');
    if (anchorIdx !== -1) {
      anchor = cleanPath.substring(anchorIdx);
      cleanPath = cleanPath.substring(0, anchorIdx);
    }
    const qIdx = cleanPath.indexOf('?');
    if (qIdx !== -1) cleanPath = cleanPath.substring(0, qIdx);
    cleanPath = cleanPath.replace(/\/$/, '');

    if (/\.(svg|png|jpg|jpeg|webp|gif|js|css|ico|pdf|xml|json|php|otf|woff|woff2|ttf)$/i.test(cleanPath)) return match;
    if (/^(feed|wp-json|xmlrpc|author\/|wp-content|wp-admin|wp-login)/.test(cleanPath)) return match;
    if (cleanPath === '') return `href="index.html${anchor}"`;

    const localFile = slugMap[cleanPath];
    if (localFile) return `href="${localFile}${anchor}"`;

    // Don't warn for external-ish paths
    if (!cleanPath.startsWith('http')) {
      console.log(`  WARNING [${filename}]: Unknown relative link: /${cleanPath}`);
    }
    return match;
  });

  // Fix canonical and og:url meta tags
  html = html.replace(/content="https?:\/\/(www\.)?cruzgoldlaw\.com\/([^"]*)"/g, (match, www, path) => {
    // Only fix content= in canonical/og tags, not all content attributes
    if (!match) return match;
    let cleanPath = path.replace(/\/$/, '');
    if (/\.(svg|png|jpg|jpeg|webp|gif|js|css)$/i.test(cleanPath)) return match;
    const localFile = slugMap[cleanPath];
    if (localFile) return `content="${localFile}"`;
    return match;
  });
  html = html.replace(/content="https?:\/\/(www\.)?cruzgoldlaw\.com\/?"/g, 'content="index.html"');

  // --- Strip WordPress bloat ---
  // RSS feeds
  html = html.replace(/<link rel="alternate" type="application\/rss\+xml"[^>]*>\n?/g, '');
  // oEmbed
  html = html.replace(/<link rel="alternate" title="oEmbed[^>]*>\n?/g, '');
  // wp-json API
  html = html.replace(/<link rel="https:\/\/api\.w\.org\/"[^>]*>\n?/g, '');
  html = html.replace(/<link rel="alternate"[^>]*wp-json[^>]*>\n?/g, '');
  // EditURI / RSD
  html = html.replace(/<link rel="EditURI"[^>]*>\n?/g, '');
  // dns-prefetch for CDNs we no longer use
  html = html.replace(/<link rel="dns-prefetch"[^>]*>\n?/g, '');
  // Generator meta
  html = html.replace(/<meta name="generator"[^>]*>\n?/g, '');
  // Site Kit meta
  html = html.replace(/<meta name="ti-site-data"[^>]*>/g, '');
  // Shortlink
  html = html.replace(/<link rel="shortlink"[^>]*>\n?/g, '');
  // WP emoji styles (inline CSS)
  html = html.replace(/<style id="wp-emoji-styles-inline-css">[\s\S]*?<\/style>\s*/g, '');
  // WP emoji settings and script
  html = html.replace(/<script id="wp-emoji-settings"[^>]*>[\s\S]*?<\/script>\s*/g, '');
  html = html.replace(/<script type="module">\s*const a=JSON\.parse\(document\.getElementById\("wp-emoji-settings"\)[\s\S]*?<\/script>\s*/g, '');
  // WP img auto-sizes
  html = html.replace(/<style id="wp-img-auto-sizes-contain-inline-css">[\s\S]*?<\/style>\s*/g, '');
  // Speculation rules
  html = html.replace(/<script type="speculationrules">[\s\S]*?<\/script>\s*/g, '');
  // Rank Math comments
  html = html.replace(/<!-- \/Rank Math WordPress SEO plugin -->\s*/g, '');
  html = html.replace(/<!-- Search Engine Optimization by Rank Math - https:\/\/rankmath\.com\/ -->\s*/g, '');
  // document.documentElement.className JS
  html = html.replace(/<script>document\.documentElement\.className \+= " js";<\/script>\s*/g, '');

  // --- Google Tag Manager: keep it as placeholder ---
  // The client might want analytics, so leave GTM script but comment it as placeholder
  // Actually, keep it as-is since we want pixel-perfect

  // --- Fix fluentFormVars.ajaxUrl ---
  html = html.replace(/"ajaxUrl":"https?:\\\/\\\/[^"]+admin-ajax\.php"/g, '"ajaxUrl":""');

  return html;
}

// Find all HTML files in scraped directory
function findHtmlFiles(dir, prefix = '') {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      // Skip wp-content and wp-includes
      if (['wp-content', 'wp-includes'].includes(entry.name)) continue;
      results.push(...findHtmlFiles(full, rel));
    } else if (entry.name === 'index.html' || (entry.name.endsWith('.html') && !prefix)) {
      results.push({ path: full, rel });
    }
  }
  return results;
}

const htmlFiles = findHtmlFiles(SCRAPED);
console.log(`  Found ${htmlFiles.length} HTML files to process`);

let processed = 0;
for (const { path: htmlPath, rel } of htmlFiles) {
  // Determine output filename
  let outName;
  if (rel === 'index.html') {
    outName = 'index.html';
  } else {
    // e.g. about/index.html → about, testimonial/jenny-bock/index.html → testimonial/jenny-bock
    const slug = rel.replace(/\/index\.html$/, '');
    outName = slugMap[slug];
    if (!outName) {
      console.log(`  SKIP: No mapping for ${slug}`);
      continue;
    }
  }

  let html = readFileSync(htmlPath, 'utf8');
  html = processHtml(html, outName);
  writeFileSync(join(OUTPUT, outName), html);
  processed++;
}
console.log(`  Processed ${processed} HTML files`);

// ============================================================
// STEP 11: Fix font CSS - rewrite URLs to local paths
// ============================================================
console.log('=== STEP 11: Fix font CSS paths ===');
let fontsCssContent = readFileSync(join(OUTPUT, 'css', 'fonts.css'), 'utf8');
fontsCssContent = fontsCssContent.replace(/url\(['"]?https:\/\/cruzgoldlaw\.com\/wp-content\/uploads\/generatepress\/fonts\/[^'")\s]+['"]?\)/g, (match) => {
  const fname = match.match(/\/([^/'")\s]+)['"]?\)$/)?.[1];
  if (fname) return `url('../fonts/${fname}')`;
  return match;
});
writeFileSync(join(OUTPUT, 'css', 'fonts.css'), fontsCssContent);
console.log('  Font CSS paths updated');

// ============================================================
// STEP 12: Fix any CSS files that reference images
// ============================================================
console.log('=== STEP 12: Fix CSS image paths ===');
const cssDir = join(OUTPUT, 'css');
for (const cssFile of readdirSync(cssDir)) {
  const cssPath = join(cssDir, cssFile);
  let css = readFileSync(cssPath, 'utf8');
  let changed = false;

  // Fix wp-content image references in CSS
  const newCss = css.replace(/url\(['"]?(?:https?:\/\/(?:www\.)?cruzgoldlaw\.com\/)?wp-content\/uploads\/[^'")\s]+['"]?\)/g, (match) => {
    const fname = match.match(/\/([^/'")\s]+)['"]?\)$/)?.[1];
    if (fname && allImages.has(fname)) {
      changed = true;
      return `url('../images/${fname}')`;
    }
    return match;
  });

  if (changed) {
    writeFileSync(cssPath, newCss);
    console.log(`  Fixed image paths in ${cssFile}`);
  }
}

// ============================================================
// STEP 13: Create form handler
// ============================================================
console.log('=== STEP 13: Create form handler ===');
const formHandler = `/* Form Handler - Intercepts Fluent Forms and posts to webhook */
(function() {
  var WEBHOOK_URL = 'PLACEHOLDER_WEBHOOK_URL'; // Replace with actual webhook URL

  // Wait for DOM
  document.addEventListener('DOMContentLoaded', function() {
    // Find all Fluent Forms
    var forms = document.querySelectorAll('form.frm-fluent-form, form[data-form_id]');

    forms.forEach(function(form) {
      // Mark as loaded
      form.classList.remove('ff-form-loading');
      form.classList.add('ff-form-loaded');

      form.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;

        var formData = {};
        var formName = form.getAttribute('data-form_id') || 'contact';
        formData._form = formName;

        form.querySelectorAll('input, select, textarea').forEach(function(input) {
          if (!input.name || input.type === 'hidden' || input.type === 'submit') return;
          if (input.type === 'checkbox') {
            formData[input.name] = input.checked ? input.value || 'yes' : '';
          } else if (input.type === 'radio') {
            if (input.checked) formData[input.name] = input.value;
          } else {
            formData[input.name] = input.value;
          }
        });

        fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
          mode: 'no-cors'
        }).then(function() {
          // Show success message
          var msg = document.createElement('div');
          msg.style.cssText = 'padding:20px;background:#d4edda;color:#155724;border-radius:5px;margin-top:15px;text-align:center;font-weight:600;';
          msg.textContent = 'Thank you! Your message has been sent successfully.';
          form.style.display = 'none';
          form.parentNode.insertBefore(msg, form.nextSibling);
        }).catch(function() {
          var msg = document.createElement('div');
          msg.style.cssText = 'padding:20px;background:#f8d7da;color:#721c24;border-radius:5px;margin-top:15px;text-align:center;';
          msg.textContent = 'Something went wrong. Please call us directly.';
          form.parentNode.insertBefore(msg, form.nextSibling);
          if (submitBtn) submitBtn.disabled = false;
        });
      });
    });

    // Also handle Formidable Forms
    var frmForms = document.querySelectorAll('form.frm-show-form');
    frmForms.forEach(function(form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var formData = {};
        form.querySelectorAll('input, select, textarea').forEach(function(input) {
          if (!input.name || input.type === 'hidden' || input.type === 'submit') return;
          formData[input.name] = input.value;
        });

        fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
          mode: 'no-cors'
        }).then(function() {
          var msg = document.createElement('div');
          msg.style.cssText = 'padding:20px;background:#d4edda;color:#155724;border-radius:5px;margin-top:15px;text-align:center;font-weight:600;';
          msg.textContent = 'Thank you! Your message has been sent successfully.';
          form.style.display = 'none';
          form.parentNode.insertBefore(msg, form.nextSibling);
        });
      });
    });
  });
})();
`;
writeFileSync(join(OUTPUT, 'js', 'form-handler.js'), formHandler);
console.log('  Created form-handler.js');

// Add form-handler.js to all HTML pages
console.log('=== STEP 14: Add form handler to all pages ===');
let formAdded = 0;
for (const f of readdirSync(OUTPUT)) {
  if (!f.endsWith('.html')) continue;
  const fPath = join(OUTPUT, f);
  let html = readFileSync(fPath, 'utf8');
  if (!html.includes('form-handler.js')) {
    html = html.replace('</body>', '<script src="js/form-handler.js"></script>\n</body>');
    writeFileSync(fPath, html);
    formAdded++;
  }
}
console.log(`  Added form-handler.js to ${formAdded} pages`);

// ============================================================
// DONE
// ============================================================
console.log('\n=== BUILD COMPLETE ===');
console.log(`Output: ${OUTPUT}/`);
console.log(`  HTML: ${readdirSync(OUTPUT).filter(f => f.endsWith('.html')).length} files`);
console.log(`  CSS:  ${readdirSync(join(OUTPUT, 'css')).length} files`);
console.log(`  JS:   ${readdirSync(join(OUTPUT, 'js')).length} files`);
console.log(`  IMG:  ${readdirSync(join(OUTPUT, 'images')).length} files`);
console.log(`  Font: ${readdirSync(join(OUTPUT, 'fonts')).length} files`);
