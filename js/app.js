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

// LOAD INVESTIGATION (DYNAMIC)
async function showInvestigation(sub) {
  const res = await fetch("data/investigation_data.json");
  const data = await res.json();

  const item = data.find(d => d.subcategory_id === sub.id);

  if (!item) {
    document.getElementById("details").innerHTML =
      `<h3>${sub.subcategory_name}</h3>`;
    return;
  }

  let html = `<h2>${item.name}</h2>`;

  // Tabs
  html += `<div id="tabs"></div><div id="tabContent"></div>`;

  document.getElementById("details").innerHTML = html;

  const tabsDiv = document.getElementById("tabs");
  const contentDiv = document.getElementById("tabContent");

  item.sections.forEach((sec, index) => {

    // Create tab button
    const btn = document.createElement("button");
    btn.innerText = sec.title;

    btn.onclick = () => renderSection(sec);

    tabsDiv.appendChild(btn);

    // Auto open first tab
    if (index === 0) renderSection(sec);

  });
}

// RENDER SECTION
function renderSection(section) {

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
            <button onclick="openTool('${t.link}')">${t.name}</button>
          </li>
        `).join("")}
      </ul>
    `;
  }

  document.getElementById("tabContent").innerHTML = html;
}

// IOC TYPE
function detectIOCType(ioc) {
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(ioc)) return "ip";
  if (ioc.startsWith("http")) return "url";
  if (ioc.length >= 32) return "hash";
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

// INIT
loadCategories();
