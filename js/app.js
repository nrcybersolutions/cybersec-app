async function loadCategories(){

const response = await fetch("./data/categories.json")
const categories = await response.json()

const container = document.getElementById("categories")
container.innerHTML = ""

categories.forEach(cat =>{

const btn = document.createElement("button")
btn.innerText = cat.category_name

btn.onclick = () => showCategory(cat)

container.appendChild(btn)

})

}

// Load subcategories
async function showCategory(cat){

document.getElementById("details").innerHTML =
`<h3>${cat.category_name}</h3><p>${cat.description}</p>`

const response = await fetch("./data/subcategories.json")
const subs = await response.json()

const subContainer = document.getElementById("subcategories")
subContainer.innerHTML = ""

subs
.filter(s => s.category_id === cat.id)
.forEach(sub =>{

const btn = document.createElement("button")
btn.innerText = sub.subcategory_name

btn.onclick = async () => {

const res = await fetch("./data/investigation_data.json")
const data = await res.json()

const item = data.find(d => d.subcategory_id === sub.id)

if(!item){
document.getElementById("details").innerHTML = `<h3>${sub.subcategory_name}</h3>`
return
}

// 🔥 FULL DETAILS + IOC INPUT + CLICKABLE TOOLS
document.getElementById("details").innerHTML = `
<h2>${item.name}</h2>

<h3>Overview</h3>
<p>${item.overview}</p>

<h3>Indicators</h3>
<ul>${item.indicators.map(i=>`<li>${i}</li>`).join("")}</ul>

<h3>Logs to Check</h3>
<ul>${item.logs.map(i=>`<li>${i}</li>`).join("")}</ul>

<h3>IOC Input</h3>
<input id="iocInput" placeholder="Enter IP / URL / Hash"
style="width:100%; padding:8px; margin-bottom:10px;" />

<h3>Tools</h3>
<ul>
${item.tools.map(t=>`
<li>
<button onclick="openTool('${t.link}')"
style="width:100%; text-align:left;">
${t.name}
</button>
</li>
`).join("")}
</ul>

<h3>Containment</h3>
<ul>${item.containment.map(i=>`<li>${i}</li>`).join("")}</ul>

<h3>MITRE</h3>
<ul>${item.mitre.map(i=>`<li>${i}</li>`).join("")}</ul>
`

}

subContainer.appendChild(btn)

})

}

// 🔥 TOOL OPEN LOGIC
function openTool(baseUrl){

const inputBox = document.getElementById("iocInput")
const ioc = inputBox ? inputBox.value.trim() : ""

// If empty → open homepage
if(!ioc){
window.open(baseUrl, "_blank")
return
}

let finalUrl = baseUrl

// VirusTotal
if(baseUrl.includes("virustotal")){
finalUrl = `https://www.virustotal.com/gui/search/${ioc}`
}

// URLScan
else if(baseUrl.includes("urlscan")){
finalUrl = `https://urlscan.io/search/#${ioc}`
}

// Default fallback
else{
finalUrl = baseUrl
}

window.open(finalUrl, "_blank")

}

// Start app
loadCategories()
