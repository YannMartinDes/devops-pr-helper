// ==UserScript==
// @name         DevOps PR Helpers
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Toggle <details> for DevOpsBot and add quick-insert buttons in PR comments (unified style)
// @match        https://dev.azure.com/rndexperience/RnDExperienceV4/_git/RnDExperienceV4/pullrequest/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  /** ------------------ Common Button Style ------------------ **/
  function styleButton(btn) {
    Object.assign(btn.style, {
      marginLeft: "6px",
      padding: "4px 10px",
      fontSize: "13px",
      fontWeight: "500",
      color: "#000", // black text
      backgroundColor: "#e6f0ff", // light blue background
      border: "1px solid #99c2ff",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "all 0.2s ease",
    });

    btn.addEventListener("mouseover", () => {
      btn.style.backgroundColor = "#cce0ff";
    });
    btn.addEventListener("mouseout", () => {
      btn.style.backgroundColor = "#e6f0ff";
    });
  }

  /** ------------------ Toggle Details ------------------ **/
  function addToggleButton(span) {
    if (span.dataset.hasButton) return;
    span.dataset.hasButton = "true";

    const btn = document.createElement("button");
    btn.textContent = "Toggle Details";
    styleButton(btn);

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

    const buttons = [
      { name: "useCallback", value: "Please use useCallback() to increase performance " },
      { name: "useMemo", value: "Please use useMemo() to increase performance " },
      { name: "unused", value: "It's seems unused " },
      { name: "scss import", value: "The scss import should be isolated at the end. " },
      { name: "dictionary", value: "Please use dictionary key. " },
    ];

    buttons.forEach(({ name, value }) => {
      const btn = document.createElement("button");
      btn.textContent = name;
      styleButton(btn);
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
