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
    `<h3>${cat.category_name}</h3><p>${cat.description || ""}</p>`;

  const res = await fetch("data/subcategories.json");
  const subs = await res.json();

  const subContainer = document.getElementById("subcategories");
  subContainer.innerHTML = "";

  const filteredSubs = const filtered = subs.filter(s => s.category_id === cat.id);

// GROUPING LOGIC
const groups = {
  "Fundamentals": filtered.filter(s => s.id >= 101 && s.id <= 108),
  "Frameworks": filtered.filter(s => [109, 110].includes(s.id)),
  "Career & Skills": filtered.filter(s => [111,112,113,114].includes(s.id)),
  "Books": filtered.filter(s => s.id >= 115)
};

// RENDER GROUPS
Object.keys(groups).forEach(groupName => {
  if (groups[groupName].length === 0) return;

  const header = document.createElement("h4");
  header.innerText = groupName;
  header.style.marginTop = "10px";
  subContainer.appendChild(header);

  groups[groupName].forEach(sub => {
    const btn = document.createElement("button");
    btn.innerText = sub.subcategory_name;
    btn.onclick = () => showInvestigation(sub);
    subContainer.appendChild(btn);
  });
});

  // 🔥 AUTO LOAD FIRST
  if (filteredSubs.length > 0) {
    showInvestigation(filteredSubs[0]);
  }
}

// LOAD INVESTIGATION / STUDY / OSINT
async function showInvestigation(sub) {

  // 🔥 STUDY INDEX
  if (sub.category_id === 7) {
    renderStudy(sub);
    return;
  }

  // 🔥 OSINT DIRECT VIEW
  if (sub.category_id === 5) {
    renderIOCGuideDirect(sub);
    return;
  }

  const res = await fetch("data/investigation_data.json");
  const data = await res.json();

  const item = data.find(d => d.subcategory_id === sub.id);

  let html = `<h2>${sub.subcategory_name}</h2>`;
  html += `<div id="tabs"></div><div id="tabContent"></div>`;

  document.getElementById("details").innerHTML = html;

  const tabsDiv = document.getElementById("tabs");

  if (item) {
    item.sections.forEach((sec, index) => {
      const btn = document.createElement("button");
      btn.innerText = sec.title;
      btn.onclick = () => renderSection(sec, sub.subcategory_name);
      tabsDiv.appendChild(btn);

      if (index === 0) renderSection(sec, sub.subcategory_name);
    });
  }
}

// RENDER SECTION
function renderSection(section, subName) {
  let html = `<h3>${section.title}</h3>`;

  if (section.type === "text") {
    html += `<p>${section.content}</p>`;
  }

  if (section.type === "list") {
    html += `<ul>${section.content.map(i => `<li>${i}</li>`).join("")}</ul>`;
  }

  if (section.type === "tools") {
    html += `
      <input id="iocInput" placeholder="Enter IOC"
      oninput="filterTools()" style="width:100%; padding:8px;" />

      <p id="iocType"></p>

      <ul id="toolsList">
        ${section.content.map(t => `
          <li data-type="${t.type}">
            <button onclick="openTool('${t.link}')">
              ${t.name}
            </button>
          </li>
        `).join("")}
      </ul>
    `;
  }

  document.getElementById("tabContent").innerHTML =
    html + getNotesHTML(subName);

  loadNotes(subName);
}

// 🔥 OSINT DIRECT
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

  if (!guide) return;

  const html = `
    <h2>${sub.subcategory_name}</h2>

    <h3>Where to Check</h3>
    <ul>${guide.where_to_check.map(i => `<li>${i}</li>`).join("")}</ul>

    <h3>What to Check</h3>
    <ul>${guide.what_to_check.map(i => `<li>${i}</li>`).join("")}</ul>

    <h3>Recommended Tools</h3>
    <ul>
      ${guide.tools.map(t => `
        <li><button onclick="window.open('${t.link}')">${t.name}</button></li>
      `).join("")}
    </ul>
  `;

  document.getElementById("details").innerHTML =
    html + getNotesHTML(sub.subcategory_name);

  loadNotes(sub.subcategory_name);
}

// 🔥 STUDY INDEX (FIXED WITH ID)
async function renderStudy(sub) {
  const res = await fetch("data/study_data.json");
  const data = await res.json();

  console.log("SUB:", sub);
console.log("DATA:", data);

const item = data.find(d => d.id === sub.id);

console.log("MATCHED ITEM:", item);

  if (!item) {
    document.getElementById("details").innerHTML =
      `<h3>No data found for ${sub.subcategory_name}</h3>`;
    return;
  }

  let html = `
    <h2>${item.title}</h2>
    <p><b>Status:</b> ${item.status}</p>
  `;

  if (item.link) {
    html += `
      <button onclick="window.open('${item.link}')">
        Open Study Notes
      </button>
    `;
  }

  item.sections?.forEach(sec => {
    html += `<h3>${sec.title}</h3>`;
    html += `<p>${sec.content}</p>`;
  });

  document.getElementById("details").innerHTML =
    html + getNotesHTML(item.title);

  loadNotes(item.title);
}

// NOTES UI
function getNotesHTML(key) {
  return `
    <div style="margin-top:20px;">
      <h3>Notes</h3>

      <textarea id="noteInput" placeholder="Add note..."
        style="width:100%; height:80px;"></textarea>

      <button onclick="saveNote('${key}')">Save Note</button>

      <ul id="notesList"></ul>
    </div>
  `;
}

// SAVE NOTE
function saveNote(key) {
  const input = document.getElementById("noteInput");
  const text = input.value.trim();

  if (!text) return;

  let notes = JSON.parse(localStorage.getItem("soc_notes")) || {};

  if (!notes[key]) notes[key] = [];

  notes[key].push({
    text: text,
    date: new Date().toLocaleString()
  });

  localStorage.setItem("soc_notes", JSON.stringify(notes));
  input.value = "";

  loadNotes(key);
}

// LOAD NOTES
function loadNotes(key) {
  const notes = JSON.parse(localStorage.getItem("soc_notes")) || {};
  const list = document.getElementById("notesList");

  if (!list) return;

  const current = notes[key] || [];

  list.innerHTML = current.map(n => `
    <li>
      ${n.text}<br>
      <small>${n.date}</small>
    </li>
  `).join("");
}

// IOC DETECTION
function detectIOCType(ioc) {
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(ioc)) return "ip";
  if (ioc.startsWith("http")) return "url";
  if (ioc.length >= 32) return "hash";
  if (ioc.includes("@")) return "email";
  if (ioc.includes(".")) return "domain";
  return "unknown";
}

// FILTER TOOLS
window.filterTools = function () {
  const ioc = document.getElementById("iocInput").value.trim();
  const type = detectIOCType(ioc);

  document.getElementById("iocType").innerText =
    ioc ? "Detected: " + type : "";

  document.querySelectorAll("#toolsList li").forEach(li => {
    const t = li.getAttribute("data-type");
    li.style.display =
      (!ioc || t === "all" || t === type) ? "block" : "none";
  });
};

// OPEN TOOL
window.openTool = function (baseUrl) {
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

// INIT
loadCategories();
