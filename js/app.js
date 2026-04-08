// LOAD CATEGORIES
async function loadCategories() {
  try {
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

  } catch (e) {
    console.error("Error loading categories:", e);
  }
}

// LOAD SUBCATEGORIES
async function showCategory(cat) {

  const subContainer = document.getElementById("subcategories");
  const details = document.getElementById("details");

  subContainer.innerHTML = "";
  details.innerHTML = `
  <h3>${cat.category_name}</h3>
  <p>Select a subcategory to view details</p>
`;

  try {
    const res = await fetch("data/subcategories.json");
    const subs = await res.json();

    const filteredSubs = subs.filter(s => s.category_id === cat.id);

    // 🔥 GROUPING ONLY FOR STUDY INDEX
    if (cat.id === 7) {

      const groups = {
        "Fundamentals": filteredSubs.filter(s => s.id >= 101 && s.id <= 108),
        "Frameworks": filteredSubs.filter(s => [109,110].includes(s.id)),
        "Career & Skills": filteredSubs.filter(s => [111,112,113,114].includes(s.id)),
        "Books": filteredSubs.filter(s => s.id >= 115)
      };

      Object.keys(groups).forEach(groupName => {
        if (groups[groupName].length === 0) return;

        const header = document.createElement("h4");
        header.innerText = groupName;

        const groupDiv = document.createElement("div");
        groupDiv.style.display = "none";

        header.onclick = () => {
          groupDiv.style.display =
            groupDiv.style.display === "none" ? "block" : "none";
        };

        subContainer.appendChild(header);
        subContainer.appendChild(groupDiv);

        groups[groupName].forEach(sub => {
          const btn = document.createElement("button");
          btn.innerText = sub.subcategory_name;
          btn.onclick = () => showInvestigation(sub);
          groupDiv.appendChild(btn);
        });
      });

    } else {

      // NORMAL FLOW
      filteredSubs.forEach(sub => {
        const btn = document.createElement("button");
        btn.innerText = sub.subcategory_name;
        btn.onclick = () => showInvestigation(sub);
        subContainer.appendChild(btn);
      });
    }

 

  } catch (e) {
    console.error("Error loading subcategories:", e);
  }
}

// LOAD INVESTIGATION / STUDY / OSINT
async function showInvestigation(sub) {

  // 🔥 NEW: IOC FULL VIEW
if (sub.subcategory_name.toLowerCase().includes("domain")) {
  console.log("DOMAIN VIEW TRIGGERED");
  renderIOCFullView("domain");
  return;
}

  if (sub.category_id === 7) {
    renderStudy(sub);
    return;
  }

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

// OSINT DIRECT
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

// STUDY INDEX
async function renderStudy(sub) {
  const res = await fetch("data/study_data.json");
  const data = await res.json();

  const item = data.find(d => d.id === sub.id);

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
      <textarea id="noteInput" placeholder="Add note..."></textarea>
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
    text,
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

  list.innerHTML = current.map((n, index) => `
    <li style="margin-bottom:10px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span>${n.text}</span>
        <button onclick="deleteNote('${key}', ${index})"
          style="font-size:10px; padding:2px 6px; margin-left:10px;">
          🗑
        </button>
      </div>
      <small>${n.date}</small>
    </li>
  `).join("");
}

function deleteNote(key, index) {
  let notes = JSON.parse(localStorage.getItem("soc_notes")) || {};

  if (!notes[key]) return;

  notes[key].splice(index, 1);

  localStorage.setItem("soc_notes", JSON.stringify(notes));

  loadNotes(key);
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

async function renderIOCFullView(type) {
  const res = await fetch("data/ioc_full_view.json");
  const data = await res.json();

  const item = data.find(d => d.type === type);
  if (!item) return;

  let html = `
    <div style="display:flex; gap:15px;">

      <!-- COLUMN 1 -->
      <div style="width:15%;">
        <h2>${item.label}</h2>
      </div>

      <!-- COLUMN 2 -->
      <div style="width:35%;">
        <h3>Key Highlights</h3>
        ${item.highlighted.map(sec => `
          <div style="margin-bottom:10px;">
            <b style="color:#60a5fa;">[${sec.tab}]</b>
            <ul>
              ${sec.points.map(p => `<li>${p}</li>`).join("")}
            </ul>
          </div>
        `).join("")}
      </div>

      <!-- COLUMN 3 -->
      <div style="width:50%;">
        <h3>Detailed Analysis</h3>
        ${item.details.map(sec => `
          <div style="margin-bottom:15px;">
            <b style="color:#34d399;">[${sec.tab}]</b>
            <ul>
              ${sec.points.map(p => `<li>${p}</li>`).join("")}
            </ul>
          </div>
        `).join("")}
      </div>

    </div>
  `;

  document.getElementById("details").innerHTML = html;
}



// INIT
loadCategories();
