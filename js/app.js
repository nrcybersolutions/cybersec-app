// LOAD CATEGORIES
async function loadCategories() {
  const res = await fetch("data/categories.json");
  const categories = await res.json();

  const container = document.getElementById("categories");
  container.innerHTML = "";

  categories.forEach(cat => {
    const btn = document.createElement("button");
    btn.innerText = cat.category_name;
    btn.onclick = () => showCategory(cat);
    container.appendChild(btn);
  });
}

// LOAD SUBCATEGORIES
async function showCategory(cat) {
  document.getElementById("details").innerHTML =
    `<h3>${cat.category_name}</h3><p>${cat.description}</p>`;

  const res = await fetch("data/subcategories.json");
  const subs = await res.json();

  const subContainer = document.getElementById("subcategories");
  subContainer.innerHTML = "";

  subs
    .filter(s => s.category_id === cat.id)
    .forEach(sub => {
      const btn = document.createElement("button");
      btn.innerText = sub.subcategory_name;
      btn.onclick = () => showInvestigation(sub);
      subContainer.appendChild(btn);
    });
}

// LOAD INVESTIGATION
async function showInvestigation(sub) {
  
// 🔥 STUDY INDEX
if (sub.category_id === 7) {
  renderStudy(sub);
  return;
}
  
  const res = await fetch("data/investigation_data.json");
  const data = await res.json();

  const item = data.find(d => d.subcategory_id === sub.id);

  let html = `<h2>${sub.subcategory_name}</h2>`;
  html += `<div id="tabs"></div><div id="tabContent"></div>`;

  document.getElementById("details").innerHTML = html;

  const tabsDiv = document.getElementById("tabs");

  // 🔥 OSINT DIRECT VIEW
  if (sub.category_id === 5) {
    renderIOCGuideDirect(sub);
    return;
  }

  // EXISTING TABS
  if (item) {
    item.sections.forEach((sec, index) => {
      const btn = document.createElement("button");
      btn.innerText = sec.title;
      btn.onclick = () => renderSection(sec);
      tabsDiv.appendChild(btn);

      if (index === 0) renderSection(sec);
    });
  }
}

// RENDER SECTION
function renderSection(section) {
  let html = `<h3>${section.title}</h3>`;

  // TEXT
  if (section.type === "text") {
    html += `<p>${section.content}</p>`;
  }

  // LIST
  if (section.type === "list") {
    html += `<ul>${section.content.map(i => `<li>${i}</li>`).join("")}</ul>`;
  }

  // TOOLS
  if (section.type === "tools") {
    html += `
      <input id="iocInput" placeholder="Enter IOC"
      oninput="filterTools()" style="width:100%; padding:8px;" />

      <p id="iocType"></p>

      <ul id="toolsList">
        ${section.content.map(t => `
          <li data-type="${t.type}">
            <button title="${t.desc || ""}" onclick="openTool('${t.link}')">
              ${t.name}
            </button>
          </li>
        `).join("")}
      </ul>
    `;
  }

  document.getElementById("tabContent").innerHTML = html + getNotesHTML();
  loadNotes();
}

// 🔥 OSINT DIRECT RENDER
async function renderIOCGuideDirect(sub) {
  const res = await fetch("data/ioc_guide.json");
  const data = await res.json();

  const map = {
    "IP Tools": "ip",
    "Domain Tools": "domain",
    "URL Tools": "url",
    "Hash Tools": "hash",
    "Email Tools": "email"
  };

  const type = map[sub.subcategory_name];
  const guide = data.find(i => i.type === type);

  if (!guide) {
    document.getElementById("details").innerHTML =
      `<p>No data for ${sub.subcategory_name}</p>`;
    return;
  }

  const html = `
    <h2>${sub.subcategory_name}</h2>

    <h3>Where to Check</h3>
    <ul>${guide.where_to_check.map(i => `<li>${i}</li>`).join("")}</ul>

    <h3>What to Check</h3>
    <ul>${guide.what_to_check.map(i => `<li>${i}</li>`).join("")}</ul>

    <h3>Recommended Tools</h3>
    <ul>
      ${guide.tools.map(t => `
        <li>
          <button onclick="window.open('${t.link}')">${t.name}</button>
        </li>
      `).join("")}
    </ul>
  `;

  document.getElementById("details").innerHTML = html + getNotesHTML();
  loadNotes();
}

// NOTES HTML (Reusable)
function getNotesHTML() {
  return `
    <div style="margin-top:20px;">
      <button onclick="toggleNotes()">Show / Hide Notes</button>

      <div id="notesContainer" style="display:none; margin-top:10px;">
        <h3>Notes</h3>

        <textarea id="noteInput" placeholder="Add investigation note..."
          style="width:100%; height:80px;"></textarea>

        <button onclick="saveNote()">Save Note</button>

        <ul id="notesList"></ul>
      </div>
    </div>
  `;
}

// TOGGLE NOTES
function toggleNotes() {
  const div = document.getElementById("notesContainer");
  if (!div) return;

  div.style.display = div.style.display === "none" ? "block" : "none";
}

// SAVE NOTE
function saveNote() {
  const input = document.getElementById("noteInput");
  const text = input.value.trim();

  if (!text) return;

  let notes = JSON.parse(localStorage.getItem("soc_notes")) || [];

  notes.push({
    text: text,
    date: new Date().toLocaleString()
  });

  localStorage.setItem("soc_notes", JSON.stringify(notes));
  input.value = "";

  loadNotes();
}

// LOAD NOTES
function loadNotes() {
  const notes = JSON.parse(localStorage.getItem("soc_notes")) || [];
  const list = document.getElementById("notesList");

  if (!list) return;

  list.innerHTML = notes.map((n, index) => `
    <li>
      ${n.text}<br>
      <small>${n.date}</small><br>
      <button onclick="deleteNote(${index})">Delete</button>
    </li>
  `).join("");
}

// DELETE NOTE
function deleteNote(index) {
  let notes = JSON.parse(localStorage.getItem("soc_notes")) || [];
  notes.splice(index, 1);
  localStorage.setItem("soc_notes", JSON.stringify(notes));
  loadNotes();
}

// IOC TYPE DETECTION
function detectIOCType(ioc) {
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(ioc)) return "ip";
  if (ioc.startsWith("http")) return "url";
  if (ioc.length >= 32) return "hash";
  if (ioc.includes("@")) return "email";
  if (ioc.includes(".")) return "domain";
  return "unknown";
}

// FILTER TOOLS
window.filterTools = function() {
  const ioc = document.getElementById("iocInput").value.trim();
  const type = detectIOCType(ioc);

  document.getElementById("iocType").innerText =
    ioc ? "Detected: " + type : "";

  document.querySelectorAll("#toolsList li").forEach(li => {
    const t = li.getAttribute("data-type");
    li.style.display = (!ioc || t === "all" || t === type) ? "block" : "none";
  });
};

// OPEN TOOL
window.openTool = function(baseUrl) {
  const ioc = document.getElementById("iocInput")?.value.trim();

  if (!ioc) {
    window.open(baseUrl);
    return;
  }

  let url = baseUrl;

  if (baseUrl.includes("virustotal"))
    url = `https://www.virustotal.com/gui/search/${ioc}`;
  else if (baseUrl.includes("urlscan"))
    url = `https://urlscan.io/search/#${ioc}`;

  window.open(url);
};

async function renderStudy(sub) {
  const res = await fetch("data/study_data.json");
  const data = await res.json();

  const item = data.find(d => d.title === sub.subcategory_name);

  if (!item) return;

  let html = `
    <h2>${item.title}</h2>

    <p><b>Status:</b> ${item.status}</p>

    ${item.link ? `
      <p>
        <button onclick="window.open('${item.link}')">
          Open Study Notes
        </button>
      </p>
    ` : ""}
  `;

  // sections (optional)
  item.sections?.forEach(sec => {
    html += `<h3>${sec.title}</h3>`;
    html += `<p>${sec.content}</p>`;
  });

  document.getElementById("details").innerHTML = html + `
    <div style="margin-top:20px;">
      <h3>Notes</h3>

      <textarea id="noteInput" placeholder="Add study note..."
        style="width:100%; height:80px;"></textarea>

      <button onclick="saveNote()">Save Note</button>

      <ul id="notesList"></ul>
    </div>
  `;

  loadNotes();
}

// INIT
loadCategories();
