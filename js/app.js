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

btn.onclick = () =>{
document.getElementById("details").innerHTML =
`<h3>${sub.subcategory_name}</h3>`
}

subContainer.appendChild(btn)

})

}

loadCategories()
