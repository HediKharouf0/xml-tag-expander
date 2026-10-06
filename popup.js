const list = document.getElementById("list");
const empty = document.getElementById("empty");
const form = document.getElementById("add");
const aliasInput = document.getElementById("alias");
const tagInput = document.getElementById("tag");
const error = document.getElementById("error");

let aliases = {};

function render() {
  list.replaceChildren();
  const names = Object.keys(aliases).sort();
  for (const name of names) {
    const row = document.createElement("tr");

    const a = document.createElement("td");
    a.textContent = ":" + name;
    const t = document.createElement("td");
    t.textContent = `<${aliases[name]}>`;

    const remove = document.createElement("button");
    remove.className = "remove";
    remove.title = "Remove";
    remove.textContent = "×";
    remove.addEventListener("click", () => {
      delete aliases[name];
      save();
    });
    const r = document.createElement("td");
    r.append(remove);

    row.append(a, t, r);
    list.append(row);
  }
  empty.hidden = names.length > 0;
}

function save() {
  chrome.storage.sync.set({ aliases }, render);
}

function showError(msg) {
  error.textContent = msg;
  error.hidden = !msg;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const alias = aliasInput.value.trim().replace(/^:/, "");
  const tag = tagInput.value.trim().replace(/^<\/?|\/?>$/g, "");

  if (!NAME.test(alias) || !NAME.test(tag)) {
    showError("Names must start with a letter and contain only letters, digits, _ - .");
    return;
  }
  showError("");
  aliases[alias] = tag;
  save();
  form.reset();
  aliasInput.focus();
});

document.getElementById("reset").addEventListener("click", () => {
  aliases = { ...DEFAULT_ALIASES };
  save();
});

chrome.storage.sync.get({ aliases: DEFAULT_ALIASES }, (data) => {
  aliases = data.aliases;
  render();
});
