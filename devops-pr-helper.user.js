// ==UserScript==
// @name         DevOps PR Helpers
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Toggle <details> for DevOpsBot and add quick-insert buttons in PR comments
// @match        https://dev.azure.com/rndexperience/RnDExperienceV4/_git/RnDExperienceV4/pullrequest/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  /** ------------------ Toggle Details ------------------ **/
  function addToggleButton(span) {
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
      )?.nextElementSibling;
      if (!commentBlock) return;

      const detailsElements = Array.from(
        commentBlock.querySelectorAll("details")
      );
      if (!detailsElements.length) return;

      const anyClosed = detailsElements.some((el) => !el.hasAttribute("open"));

      detailsElements.forEach((el) => {
        if (anyClosed) el.setAttribute("open", "");
        else el.removeAttribute("open");
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

  /** ------------------ Insert Text Buttons ------------------ **/
  function addInsertButton(span) {
    if (span.dataset.hasButton) return;
    span.dataset.hasButton = "true";

    // Button definitions: { name: displayed text, value: text to insert }
    const buttons = [
      {
        name: "useCallback",
        value: "Please use useCallback() to increase performance ",
      },
      {
        name: "useMemo",
        value: "Please use useMemo() to increase performance ",
      },
      { name: "unused", value: "It's seems unused " },
      {
        name: "scss import",
        value: "The scss import should be isolated at the end. ",
      },
    ];

    buttons.forEach(({ name, value }) => {
      const btn = document.createElement("button");
      btn.textContent = name;
      btn.style.marginLeft = "6px";
      btn.style.padding = "4px 10px";
      btn.style.fontSize = "13px";
      btn.style.fontWeight = "500";
      btn.style.color = "#000"; // black text
      btn.style.backgroundColor = "#e6f0ff"; // light blue background
      btn.style.border = "1px solid #99c2ff"; // subtle border
      btn.style.borderRadius = "4px";
      btn.style.cursor = "pointer";
      btn.style.transition = "all 0.2s ease";

      // Hover effect
      btn.addEventListener("mouseover", () => {
        btn.style.backgroundColor = "#cce0ff";
      });
      btn.addEventListener("mouseout", () => {
        btn.style.backgroundColor = "#e6f0ff";
      });

      span.appendChild(btn);

      btn.addEventListener("click", () => {
        const spanId = span.id;
        if (!spanId) return;

        const textarea = document.querySelector(
          `textarea[aria-describedby="${spanId}"]`
        );
        if (!textarea) return;

        textarea.focus();
        document.execCommand("insertText", false, value);
      });
    });
  }

  function scanMarkdownSpans(root = document) {
    const spans = root.querySelectorAll('span[id^="__bolt-form-item-"]');
    spans.forEach((span) => addInsertButton(span));
  }
  /** ------------------ Initial Scan ------------------ **/
  scanComments();
  scanMarkdownSpans();

  /** ------------------ Observe Lazy Load ------------------ **/
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          scanComments(node);
          scanMarkdownSpans(node);
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
})();
