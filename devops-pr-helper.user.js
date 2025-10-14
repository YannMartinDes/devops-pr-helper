// ==UserScript==
// @name         DevOps PR Helpers
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Toggle all <details> open/closed for DevOpsBot comments, lazy loaded content supported
// @match        https://dev.azure.com/rndexperience/RnDExperienceV4/_git/RnDExperienceV4/pullrequest/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  function addToggleButton(span) {
    // Éviter les doublons
    if (span.dataset.hasButton) return;
    span.dataset.hasButton = "true";

    const btn = document.createElement("button");
    btn.textContent = "Toggle Details";
    btn.style.marginLeft = "8px";
    btn.style.padding = "2px 6px";
    btn.style.fontSize = "12px";
    btn.style.cursor = "pointer";

    span.parentNode.appendChild(btn);

    btn.addEventListener("click", () => {
      const commentBlock = span.closest(
        ".repos-discussion-comment-header"
      ).nextElementSibling;
      if (!commentBlock) return;

      const detailsElements = Array.from(
        commentBlock.querySelectorAll("details")
      );
      if (detailsElements.length === 0) return;

      // Déterminer si au moins un est fermé
      const anyClosed = detailsElements.some((el) => !el.hasAttribute("open"));

      // Si au moins un est fermé → ouvrir tous, sinon fermer tous
      detailsElements.forEach((el) => {
        if (anyClosed) {
          el.setAttribute("open", "");
        } else {
          el.removeAttribute("open");
        }
      });
    });
  }

  function scanComments(root = document) {
    const emailSpans = root.querySelectorAll("span.font-weight-semibold");
    emailSpans.forEach((span) => {
      if (span.textContent.trim() === "devopsbot@doriane.com") {
        addToggleButton(span);
      }
    });
  }

  // Scanner la page au chargement initial
  scanComments();

  // Observer les changements dans le DOM pour lazy load
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          scanComments(node);
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
