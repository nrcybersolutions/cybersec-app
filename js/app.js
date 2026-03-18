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
  const res = await fetch("data/investigation_data.json");
  const data = await res.json();

  const item = data.find(d => d.subcategory_id === sub.id);

  document.getElementById("details").innerHTML = `

  <h2>${item.name}</h2>

  <!-- TABS -->
  <div>
    <button onclick="showTab('overview')">Overview</button>
    <button onclick="showTab('tools')">Tools</button>
    <button onclick="showTab('logs')">Logs</button>
    <button onclick="showTab('indicators')">Indicators</button>
    <button onclick="showTab('mitre')">MITRE</button>
    <button onclick="showTab('notes')">Notes</button>
  </div>

  <!-- OVERVIEW -->
  <div id="tab-overview" class="tab">
    <p>${item.overview}</p>
  </div>

  <!-- INDICATORS -->
  <div id="tab-indicators" class="tab" style="display:none;">
    <ul>${item.indicators.map(i => `<li>${i}</li>`).join("")}</ul>
  </div>

  <!-- LOGS -->
  <div id="tab-logs" class="tab" style="display:none;">
    <ul>${item.logs.map(i => `<li>${i}</li>`).join("")}</ul>
  </div>

  <!-- TOOLS -->
  <div id="tab-tools" class="tab" style="display:none;">

    <input id="iocInput" placeholder="Enter IOC"
    oninput="filterTools()" style="width:100%; padding:8px;" />

    <p id="iocType"></p>

    <ul id="toolsList">
      ${item.tools.map(t => `
        <li data-type="${t.type}">
          <button onclick="openTool('${t.link}')">${t.name}</button>
        </li>
      `).join("")}
    </ul>

  </div>

  <!-- MITRE -->
  <div id="tab-mitre" class="tab" style="display:none;">
    <ul>${item.mitre.map(i => `<li>${i}</li>`).join("")}</ul>
  </div>

  <!-- NOTES -->
  <div id="tab-notes" class="tab" style="display:none;">
    <textarea id="notesBox" style="width:100%; height:100px;"></textarea>
    <button onclick="saveNotes('${item.name}')">Save Notes</button>
  </div>

  `;
}

// TAB SWITCH
window.showTab = function(tab) {
  document.querySelectorAll(".tab").forEach(t => t.style.display = "none");
  document.getElementById("tab-" + tab).style.display = "block";
};

// IOC DETECTION
function detectIOCType(ioc) {
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(ioc)) return "ip";
  if (ioc.startsWith("http")) return "url";
  if (ioc.length >= 32) return "hash";
  if (ioc.includes(".")) return "domain";
  return "unknown";
}

// TOOL FILTER
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

// TOOL OPEN
window.openTool = function(baseUrl) {
  const ioc = document.getElementById("iocInput").value.trim();

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

// SAVE NOTES
window.saveNotes = function(name) {
  const notes = document.getElementById("notesBox").value;
  localStorage.setItem("notes_" + name, notes);
  alert("Notes saved");
};

// GLOBAL SEARCH
window.globalSearch = async function() {
  const query = document.getElementById("globalSearch").value.toLowerCase();

  const res = await fetch("data/subcategories.json");
  const subs = await res.json();

  const filtered = subs.filter(s =>
    s.subcategory_name.toLowerCase().includes(query)
  );

  const container = document.getElementById("subcategories");
  container.innerHTML = "";

  filtered.forEach(sub => {
    const btn = document.createElement("button");
    btn.innerText = sub.subcategory_name;
    btn.onclick = () => showInvestigation(sub);
    container.appendChild(btn);
  });
};

// INIT
loadCategories();
