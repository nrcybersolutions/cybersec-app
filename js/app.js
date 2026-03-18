// ================= LOAD CATEGORIES =================
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
    console.error(e);
    document.getElementById("categories").innerText = "Error loading categories";
  }
}

// ================= LOAD SUBCATEGORIES =================
async function showCategory(cat) {
  try {
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

  } catch (e) {
    console.error(e);
  }
}

// ================= LOAD INVESTIGATION =================
async function showInvestigation(sub) {
  try {
    const res = await fetch("data/investigation_data.json");
    const data = await res.json();

    const item = data.find(d => d.subcategory_id === sub.id);

    if (!item) {
      document.getElementById("details").innerHTML =
        `<h3>${sub.subcategory_name}</h3>`;
      return;
    }

    document.getElementById("details").innerHTML = `

      <h2>${item.name}</h2>

      <!-- Tabs -->
      <div style="margin-bottom:10px;">
        <button onclick="showTab('overview')">Overview</button>
        <button onclick="showTab('indicators')">Indicators</button>
        <button onclick="showTab('logs')">Logs</button>
        <button onclick="showTab('tools')">Tools</button>
        <button onclick="showTab('mitre')">MITRE</button>
      </div>

      <!-- OVERVIEW -->
      <div id="tab-overview" class="tab">
        <h3>Overview</h3>
        <p>${item.overview}</p>
      </div>

      <!-- INDICATORS -->
      <div id="tab-indicators" class="tab" style="display:none;">
        <h3>Indicators</h3>
        <ul>${item.indicators.map(i => `<li>${i}</li>`).join("")}</ul>
      </div>

      <!-- LOGS -->
      <div id="tab-logs" class="tab" style="display:none;">
        <h3>Logs</h3>
        <ul>${item.logs.map(i => `<li>${i}</li>`).join("")}</ul>
      </div>

      <!-- TOOLS -->
      <div id="tab-tools" class="tab" style="display:none;">

        <h3>IOC Input</h3>
        <input id="iocInput" placeholder="Enter IP / URL / Hash"
        style="width:100%; padding:8px; margin-bottom:10px;" />

        <h3>Tools</h3>
        <ul>
          ${item.tools.map(t => `
            <li>
              <button onclick="openTool('${t.link}')"
              style="width:100%; text-align:left;">
                ${t.name}
              </button>
            </li>
          `).join("")}
        </ul>

      </div>

      <!-- MITRE -->
      <div id="tab-mitre" class="tab" style="display:none;">
        <h3>MITRE</h3>
        <ul>${item.mitre.map(i => `<li>${i}</li>`).join("")}</ul>
      </div>

    `;

  } catch (e) {
    console.error(e);
  }
}

// ================= TAB SWITCH =================
window.showTab = function(tabName) {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.style.display = "none";
  });

  const activeTab = document.getElementById("tab-" + tabName);
  if (activeTab) activeTab.style.display = "block";
};

// ================= IOC DETECTION =================
function detectIOCType(ioc) {
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(ioc)) return "ip";
  if (ioc.startsWith("http")) return "url";
  if (ioc.length >= 32) return "hash";
  if (ioc.includes(".")) return "domain";
  return "unknown";
}

// ================= TOOL OPEN =================
window.openTool = function(baseUrl) {

  const input = document.getElementById("iocInput");
  const ioc = input ? input.value.trim() : "";

  if (!ioc) {
    window.open(baseUrl, "_blank");
    return;
  }

  let finalUrl = baseUrl;
  const type = detectIOCType(ioc);

  if (baseUrl.includes("virustotal")) {
    finalUrl = `https://www.virustotal.com/gui/search/${ioc}`;
  } else if (baseUrl.includes("urlscan")) {
    finalUrl = `https://urlscan.io/search/#${ioc}`;
  } else if (baseUrl.includes("phishtank")) {
    finalUrl = `https://phishtank.com/search.php?query=${ioc}`;
  } else if (baseUrl.includes("shodan") && type === "ip") {
    finalUrl = `https://www.shodan.io/host/${ioc}`;
  }

  window.open(finalUrl, "_blank");
};

// ================= INIT =================
loadCategories();
