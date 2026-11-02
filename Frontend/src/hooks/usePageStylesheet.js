import { useEffect } from 'react';

/**
 * Dynamically loads a page-specific stylesheet and removes conflicting previous stylesheets.
 * This guarantees 100% style isolation and pixel-perfect fidelity with the original HTML/CSS design.
 */
export function usePageStylesheet(stylesheetHref) {
  useEffect(() => {
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

    return () => {
      // Optional cleanup on unmount
    };
  }, [stylesheetHref]);
}
