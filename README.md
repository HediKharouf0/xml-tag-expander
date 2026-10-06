# XML Tag Expander

A small Chrome extension for writing XML-tagged prompts faster. Type `:name`, press Tab, and get `<name></name>` with the cursor between the tags, similar to snippet expansion in VS Code.

## Usage

| You type | You get |
| --- | --- |
| `:instruction` + Tab | `<instruction>│</instruction>` |
| Tab again (cursor right before a closing tag) | cursor jumps past `</instruction>` |
| `:ins` + Tab | `<instruction>│</instruction>` (alias) |

`│` marks the cursor position.

Any tag name works without being declared first: `:whatever` + Tab gives `<whatever></whatever>`. Names must start with a letter and can contain letters, digits, `_`, `-` and `.`.

The colon must not be attached to a previous word, so text like `12:30` or `http:` never triggers an expansion. Tab behaves normally everywhere else.

## Install

1. Download this repository (Code > Download ZIP) and unzip it.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and select the folder that directly contains `manifest.json`.
5. Reload any tabs that were already open.

## Customize shortcuts

You can change the shortcuts: click the extension icon to see them, add new ones (e.g. `ins` → `instruction`) or remove them. Changes apply right away, no reload needed.

## Where it works

- `<textarea>` and text `<input>` fields
- `contenteditable` editors, such as the message boxes of most AI chat sites

## Files

- `manifest.json`: extension manifest (Manifest V3, `storage` permission only)
- `content.js`: the content script that handles the Tab key
- `defaults.js`: default shortcuts
- `popup.html`, `popup.js`, `popup.css`: the shortcuts popup