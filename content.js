// XML Tag Expander
//   :name + Tab   ->  <name>|</name>     (| = cursor)
//   Tab again     ->  jumps past the closing tag
//
// Works in <textarea>, text <input> and contenteditable editors (chat boxes).

// Aliases are edited from the popup. Anything not listed expands to itself.
let ALIASES = DEFAULT_ALIASES;

chrome.storage.sync.get({ aliases: DEFAULT_ALIASES }, (data) => {
  ALIASES = data.aliases;
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.aliases) {
    ALIASES = changes.aliases.newValue || DEFAULT_ALIASES;
  }
});

// ":" must not be glued to a previous word, so "12:30" or "http:" never trigger.
const TRIGGER = /(?<![\w:]):([A-Za-z][\w.-]*)$/;
const CLOSING = /^<\/[A-Za-z][\w.-]*>/;

function resolveTag(name) {
  return Object.hasOwn(ALIASES, name) ? ALIASES[name] : name;
}

function deepActiveElement() {
  let el = document.activeElement;
  while (el && el.shadowRoot && el.shadowRoot.activeElement) {
    el = el.shadowRoot.activeElement;
  }
  return el;
}

function isTextField(el) {
  if (!el || el.readOnly || el.disabled) return false;
  if (el.tagName === "TEXTAREA") return true;
  if (el.tagName === "INPUT") {
    try {
      return el.selectionStart !== null; // null for email, number, etc.
    } catch {
      return false;
    }
  }
  return false;
}

function handleTextField(el) {
  const pos = el.selectionStart;
  if (pos !== el.selectionEnd) return false;

  const before = el.value.slice(0, pos);
  const after = el.value.slice(pos);

  const trig = before.match(TRIGGER);
  if (trig) {
    const tag = resolveTag(trig[1]);
    const open = `<${tag}>`;
    const text = `${open}</${tag}>`;
    const from = pos - trig[0].length;

    el.setSelectionRange(from, pos);
    // execCommand keeps the page's undo history and notifies frameworks (React etc.)
    if (!document.execCommand("insertText", false, text)) {
      el.setRangeText(text, from, pos, "end");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    const caret = from + open.length;
    el.setSelectionRange(caret, caret);
    return true;
  }

  const closing = after.match(CLOSING);
  if (closing) {
    const target = pos + closing[0].length;
    el.setSelectionRange(target, target);
    return true;
  }
  return false;
}

function handleEditable() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return false;

  const node = sel.anchorNode;
  const offset = sel.anchorOffset;
  if (!node || node.nodeType !== Node.TEXT_NODE) return false;

  const before = node.textContent.slice(0, offset);
  const after = node.textContent.slice(offset);

  const trig = before.match(TRIGGER);
  if (trig) {
    const tag = resolveTag(trig[1]);
    const close = `</${tag}>`;
    const text = `<${tag}>${close}`;

    const range = document.createRange();
    range.setStart(node, offset - trig[0].length);
    range.setEnd(node, offset);
    sel.removeAllRanges();
    sel.addRange(range);

    document.execCommand("insertText", false, text);
    for (let i = 0; i < close.length; i++) {
      sel.modify("move", "backward", "character");
    }
    return true;
  }

  const closing = after.match(CLOSING);
  if (closing) {
    for (let i = 0; i < closing[0].length; i++) {
      sel.modify("move", "forward", "character");
    }
    return true;
  }
  return false;
}

window.addEventListener(
  "keydown",
  (e) => {
    if (e.key !== "Tab") return;
    if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.isComposing || e.keyCode === 229) return; // IME composition in progress

    const el = deepActiveElement();
    let handled = false;
    if (isTextField(el)) handled = handleTextField(el);
    else if (el && el.isContentEditable) handled = handleEditable();

    if (handled) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  },
  true
);
