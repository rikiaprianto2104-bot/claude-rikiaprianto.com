import { useEffect } from 'react';

/**
 * Set document title, meta tags and optional JSON-LD schema for SEO.
 * Tags are tagged with data-doc-meta so we can clean them up on unmount.
 */
export const useDocumentMeta = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  jsonLd,
} = {}) => {
  useEffect(() => {
    const prevTitle = document.title;
    if (title) document.title = title;

    const created = [];

    const setMeta = (selector, attrs) => {
      let el = document.head.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
        el.setAttribute('data-doc-meta', 'true');
        document.head.appendChild(el);
        created.push(el);
      } else {
        Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
      }
    };

    if (description) {
      setMeta('meta[name="description"]', { name: 'description', content: description });
      setMeta('meta[property="og:description"]', { property: 'og:description', content: description });
      setMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    }
    if (keywords && keywords.length) {
      setMeta('meta[name="keywords"]', { name: 'keywords', content: keywords.join(', ') });
    }
    if (title) {
      setMeta('meta[property="og:title"]', { property: 'og:title', content: title });
      setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    }
    if (image) {
      setMeta('meta[property="og:image"]', { property: 'og:image', content: image });
      setMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image });
      setMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    }
    if (url) {
      setMeta('meta[property="og:url"]', { property: 'og:url', content: url });
    }
    setMeta('meta[property="og:type"]', { property: 'og:type', content: type });

    let scriptEl;
    if (jsonLd) {
      scriptEl = document.createElement('script');
      scriptEl.type = 'application/ld+json';
      scriptEl.setAttribute('data-doc-meta', 'true');
      scriptEl.text = JSON.stringify(jsonLd);
      document.head.appendChild(scriptEl);
    }

    return () => {
      document.title = prevTitle;
      created.forEach((el) => el.remove());
      if (scriptEl) scriptEl.remove();
    };
  }, [title, description, keywords, image, url, type, jsonLd]);
};
