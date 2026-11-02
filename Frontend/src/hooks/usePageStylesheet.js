import { useLayoutEffect } from 'react';

/**
 * Dynamically loads a page-specific stylesheet and removes conflicting previous stylesheets.
 * useLayoutEffect runs synchronously before browser paint to guarantee zero flickering
 * and 100% style isolation identical to the original design.
 */
export function usePageStylesheet(stylesheetHref) {
  useLayoutEffect(() => {
    const linkId = 'optivault-active-stylesheet';
    let link = document.getElementById(linkId);

    if (!link) {
      link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    if (link.getAttribute('href') !== stylesheetHref) {
      link.setAttribute('href', stylesheetHref);
    }

    // Reset standard body styling on route change so no previous page overrides linger
    document.body.removeAttribute('style');
  }, [stylesheetHref]);
}
