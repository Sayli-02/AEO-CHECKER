export const SITE_NAME = "AEO Checker";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

export const FAQS = [
  {
    q: "What is AEO?",
    a: "Answer engine optimization is the work of making your pages easy for ChatGPT, Gemini, Claude, and Perplexity to crawl, quote, and cite. It is not a replacement for search ranking. It is the set of on page signals that help a model pick you as a source when someone asks a buying question in an assistant.",
  },
  {
    q: "How does this checker work?",
    a: "We fetch your public HTML, robots.txt, llms.txt, and sitemap, then run thirty plus deterministic checks. After the score appears, Gemini writes buyer questions, answers them, and we look for your brand name. The AI step uses Gemini knowledge, not live web search, so new sites often score zero there.",
  },
  {
    q: "Why do new sites score 0% on visibility?",
    a: "Gemini answers from training data, not from a fresh crawl of your URL. If the model has not seen the brand, it will not mention you. That is expected. The on page score is the part you can change this week, and it is what makes a later mention possible once the model learns you.",
  },
  {
    q: "Does this use live search?",
    a: "No. Visibility answers come from Gemini without Google Search grounding. We keep grounding off so we are not storing or analyzing grounded search results. Treat the mention rate as a knowledge snapshot, not a live SERP. The on page audit does not call an AI model at all.",
  },
  {
    q: "Is the AEO score free?",
    a: "Yes. The on page audit is free and does not require an account. The Gemini visibility pass is also free on the Gemini API free tier when an API key is configured on the server. We cap full AI checks at three per network per hour so the quota lasts.",
  },
  {
    q: "What should I fix first?",
    a: "Allow the major AI crawlers in robots.txt, put real copy in the server HTML, and add Organization plus FAQPage JSON-LD. Then write 40 to 60 word answers under question headings. Those four moves usually lift a weak page more than rewriting slogans. The report lists the rest in priority order.",
  },
  {
    q: "Will this guarantee a ChatGPT citation?",
    a: "No tool can promise a citation. Answer engines pick a handful of sources per query and the mix changes from run to run. We measure crawlability, identity, and whether Gemini already knows the brand. That is the honest scope. Use the fix list to become easy to cite, then watch real answers over time.",
  },
  {
    q: "How do I book a full audit?",
    a: "Use the consultation form with the URL you checked and a short note on the market you want to win. We review the on page gaps, the Gemini mention pattern, and a content plan. There is no charge for the first conversation. You can also print this report and send it to your team as a PDF from the browser.",
  },
];
