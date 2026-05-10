import scrape from 'website-scraper';
import { existsSync, rmSync } from 'fs';

const DOMAIN = 'https://cruzgoldlaw.com';
const OUTPUT = './site';

// All 67 pages mapped to filenames
const urls = [
  // === PAGES (24) ===
  { url: `${DOMAIN}/`, filename: 'index.html' },
  { url: `${DOMAIN}/about/`, filename: 'about.html' },
  { url: `${DOMAIN}/app-privacy-policy/`, filename: 'app-privacy-policy.html' },
  { url: `${DOMAIN}/blog/`, filename: 'blog.html' },
  { url: `${DOMAIN}/client-testimonials/`, filename: 'client-testimonials.html' },
  { url: `${DOMAIN}/contact/`, filename: 'contact.html' },
  { url: `${DOMAIN}/family-immigration-lawyer-new-jersey/`, filename: 'family-immigration-lawyer-new-jersey.html' },
  { url: `${DOMAIN}/family-immigration-lp/`, filename: 'family-immigration-lp.html' },
  { url: `${DOMAIN}/h1b-visa-lawyer-new-jersey/`, filename: 'h1b-visa-lawyer-new-jersey.html' },
  { url: `${DOMAIN}/immigration-law/`, filename: 'immigration-law.html' },
  { url: `${DOMAIN}/immigration-lawyer-houston/`, filename: 'immigration-lawyer-houston.html' },
  { url: `${DOMAIN}/immigration-lawyer-new-jersey/`, filename: 'immigration-lawyer-new-jersey.html' },
  { url: `${DOMAIN}/immigration-lawyer-philadelphia/`, filename: 'immigration-lawyer-philadelphia.html' },
  { url: `${DOMAIN}/locations-programmatic-template/`, filename: 'locations-programmatic-template.html' },
  { url: `${DOMAIN}/o-1-visa-lawyer-nj/`, filename: 'o-1-visa-lawyer-nj.html' },
  { url: `${DOMAIN}/privacy-policy/`, filename: 'privacy-policy.html' },
  { url: `${DOMAIN}/spouse-immigration-lp/`, filename: 'spouse-immigration-lp.html' },
  { url: `${DOMAIN}/student-visa-lawyer-new-jersey/`, filename: 'student-visa-lawyer-new-jersey.html' },
  { url: `${DOMAIN}/what-we-do/`, filename: 'what-we-do.html' },
  { url: `${DOMAIN}/work-visa-lawyer-new-jersey/`, filename: 'work-visa-lawyer-new-jersey.html' },

  // === BLOG POSTS (22) ===
  { url: `${DOMAIN}/eb-3-visa-lawyer/`, filename: 'eb-3-visa-lawyer.html' },
  { url: `${DOMAIN}/experienced-fiance-visa-lawyer/`, filename: 'experienced-fiance-visa-lawyer.html' },
  { url: `${DOMAIN}/trusted-marriage-green-card-lawyer/`, filename: 'trusted-marriage-green-card-lawyer.html' },
  { url: `${DOMAIN}/adjustment-of-status-lawyer/`, filename: 'adjustment-of-status-lawyer.html' },
  { url: `${DOMAIN}/eb-1a-lawyer-expert-guidance/`, filename: 'eb-1a-lawyer-expert-guidance.html' },
  { url: `${DOMAIN}/partner-with-a-dedicated-eb-2-niw-lawyer/`, filename: 'partner-with-a-dedicated-eb-2-niw-lawyer.html' },
  { url: `${DOMAIN}/immigration-lawyer-cost/`, filename: 'immigration-lawyer-cost.html' },
  { url: `${DOMAIN}/dedicated-immigration-lawyer-in-jersey-city/`, filename: 'dedicated-immigration-lawyer-in-jersey-city.html' },
  { url: `${DOMAIN}/compassionate-immigration-lawyer-elizabeth-nj/`, filename: 'compassionate-immigration-lawyer-elizabeth-nj.html' },
  { url: `${DOMAIN}/e-2-visa-lawyer-for-investors-entrepreneurs/`, filename: 'e-2-visa-lawyer-for-investors-entrepreneurs.html' },
  { url: `${DOMAIN}/naturalization-lawyer-new-jersey/`, filename: 'naturalization-lawyer-new-jersey.html' },
  { url: `${DOMAIN}/immigration-attorneys-near-me/`, filename: 'immigration-attorneys-near-me.html' },
  { url: `${DOMAIN}/expert-eb-5-visa-lawyer/`, filename: 'expert-eb-5-visa-lawyer.html' },
  { url: `${DOMAIN}/new-jersey-us-immigration-laws/`, filename: 'new-jersey-us-immigration-laws.html' },
  { url: `${DOMAIN}/cruz-gold-law-trusted-immigration-lawyers-in-new-jersey/`, filename: 'cruz-gold-law-trusted-immigration-lawyers-in-new-jersey.html' },
  { url: `${DOMAIN}/tn-visa-lawyer/`, filename: 'tn-visa-lawyer.html' },
  { url: `${DOMAIN}/trusted-l-1-visa-lawyer/`, filename: 'trusted-l-1-visa-lawyer.html' },
  { url: `${DOMAIN}/the-waiting-game-understanding-lengthy-immigration-process-times-in-the-u-s/`, filename: 'the-waiting-game-understanding-lengthy-immigration-process-times-in-the-u-s.html' },
  { url: `${DOMAIN}/traveling-abroad-as-a-non-citizen-key-considerations/`, filename: 'traveling-abroad-as-a-non-citizen-key-considerations.html' },
  { url: `${DOMAIN}/understanding-the-rights-of-undocumented-individuals-in-the-usa/`, filename: 'understanding-the-rights-of-undocumented-individuals-in-the-usa.html' },
  { url: `${DOMAIN}/common-misconceptions-in-immigration-law/`, filename: 'common-misconceptions-in-immigration-law.html' },
  { url: `${DOMAIN}/navigating-immigration-changes-under-the-2025-trump-administration/`, filename: 'navigating-immigration-changes-under-the-2025-trump-administration.html' },

  // === TESTIMONIALS (20) ===
  { url: `${DOMAIN}/testimonial/jenny-bock/`, filename: 'testimonial-jenny-bock.html' },
  { url: `${DOMAIN}/testimonial/paul-maxon/`, filename: 'testimonial-paul-maxon.html' },
  { url: `${DOMAIN}/testimonial/laura-szwed/`, filename: 'testimonial-laura-szwed.html' },
  { url: `${DOMAIN}/testimonial/marek-zawarus/`, filename: 'testimonial-marek-zawarus.html' },
  { url: `${DOMAIN}/testimonial/frank-farmer/`, filename: 'testimonial-frank-farmer.html' },
  { url: `${DOMAIN}/testimonial/dave-ropiak/`, filename: 'testimonial-dave-ropiak.html' },
  { url: `${DOMAIN}/testimonial/herminia-maxon/`, filename: 'testimonial-herminia-maxon.html' },
  { url: `${DOMAIN}/testimonial/fredy-tay-red/`, filename: 'testimonial-fredy-tay-red.html' },
  { url: `${DOMAIN}/testimonial/nicole-noonan/`, filename: 'testimonial-nicole-noonan.html' },
  { url: `${DOMAIN}/testimonial/lukas-mchugh/`, filename: 'testimonial-lukas-mchugh.html' },
  { url: `${DOMAIN}/testimonial/vanessa-noel/`, filename: 'testimonial-vanessa-noel.html' },
  { url: `${DOMAIN}/testimonial/andrew/`, filename: 'testimonial-andrew.html' },
  { url: `${DOMAIN}/testimonial/leo-brunetti/`, filename: 'testimonial-leo-brunetti.html' },
  { url: `${DOMAIN}/testimonial/ali-jamil/`, filename: 'testimonial-ali-jamil.html' },
  { url: `${DOMAIN}/testimonial/rune-bendix-kjoelstad/`, filename: 'testimonial-rune-bendix-kjoelstad.html' },
  { url: `${DOMAIN}/testimonial/rachael-schuh/`, filename: 'testimonial-rachael-schuh.html' },
  { url: `${DOMAIN}/testimonial/anchal-kannambadi/`, filename: 'testimonial-anchal-kannambadi.html' },
  { url: `${DOMAIN}/testimonial/martin-sampson/`, filename: 'testimonial-martin-sampson.html' },
  { url: `${DOMAIN}/testimonial/agnes-kamara/`, filename: 'testimonial-agnes-kamara.html' },
  { url: `${DOMAIN}/testimonial/omar-graffie/`, filename: 'testimonial-omar-graffie.html' },

  // === CATEGORY (1) ===
  { url: `${DOMAIN}/category/blog/`, filename: 'category-blog.html' },
];

console.log(`Scraping ${urls.length} pages from ${DOMAIN}...`);

// Remove existing output if it exists
if (existsSync(OUTPUT)) {
  rmSync(OUTPUT, { recursive: true });
  console.log('Removed existing site/ directory');
}

try {
  const result = await scrape({
    urls,
    directory: OUTPUT,
    sources: [
      { selector: 'img', attr: 'src' },
      { selector: 'img', attr: 'srcset' },
      { selector: 'link[rel="stylesheet"]', attr: 'href' },
      { selector: 'script', attr: 'src' },
      { selector: 'link[rel="icon"]', attr: 'href' },
      { selector: 'link[rel="shortcut icon"]', attr: 'href' },
      { selector: 'source', attr: 'srcset' },
      { selector: 'link[rel="preload"]', attr: 'href' },
    ],
    request: {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
      }
    },
    urlFilter: (url) => {
      // Allow same-domain assets + common CDNs we need
      if (url.includes('cruzgoldlaw.com')) return true;
      return false;
    },
    filenameGenerator: 'bySiteStructure',
    maxRecursiveDepth: 1,
    maxDepth: 1,
  });
  console.log(`Done! Scraped ${result.length} resources.`);
} catch (err) {
  console.error('Scrape error:', err.message);
  if (err.errors) {
    err.errors.forEach(e => console.error('  -', e.url, e.message || ''));
  }
}
