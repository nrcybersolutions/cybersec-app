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

window.openTool = function(baseUrl){

const inputBox = document.getElementById("iocInput")
const ioc = inputBox ? inputBox.value.trim() : ""

if(!ioc){
window.open(baseUrl, "_blank")
return
}

const type = detectIOCType(ioc)

let finalUrl = baseUrl

// 🔥 Smart mapping

if(baseUrl.includes("virustotal")){
finalUrl = `https://www.virustotal.com/gui/search/${ioc}`
}

else if(baseUrl.includes("urlscan")){
finalUrl = `https://urlscan.io/search/#${ioc}`
}

else if(baseUrl.includes("phishtank")){
finalUrl = `https://phishtank.com/search.php?query=${ioc}`
}

// Optional future (example)
else if(baseUrl.includes("shodan") && type === "ip"){
finalUrl = `https://www.shodan.io/host/${ioc}`
}

window.open(finalUrl, "_blank")


function detectIOCType(ioc){

// IP
if(/^(?:\d{1,3}\.){3}\d{1,3}$/.test(ioc)){
return "ip"
}

// URL
if(ioc.startsWith("http")){
return "url"
}

// Domain
if(ioc.includes(".") && !ioc.includes(" ")){
return "domain"
}

// Hash (basic)
if(ioc.length >= 32){
return "hash"
}

return "unknown"
}

}





// Start app
loadCategories()
