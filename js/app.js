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

// 🔥 FULL DETAILS WITH CLICKABLE TOOLS
document.getElementById("details").innerHTML = `
<h2>${item.name}</h2>

<h3>Overview</h3>
<p>${item.overview}</p>

<h3>Indicators</h3>
<ul>${item.indicators.map(i=>`<li>${i}</li>`).join("")}</ul>

<h3>Logs to Check</h3>
<ul>${item.logs.map(i=>`<li>${i}</li>`).join("")}</ul>

<h3>Tools</h3>
<ul>
${item.tools.map(t=>`
<li>
<a href="${t.link}" target="_blank" style="color:#38bdf8;">
${t.name}
</a>
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

// Start app
loadCategories()
