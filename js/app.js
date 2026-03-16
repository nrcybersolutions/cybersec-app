async function loadCategories(){

const response = await fetch("data/categories.json")
const categories = await response.json()

const container = document.getElementById("categories")

categories.forEach(cat =>{

const btn = document.createElement("button")
btn.innerText = cat.category_name

btn.onclick = () => showCategory(cat)

container.appendChild(btn)

})

}

function showCategory(cat){

const details = document.getElementById("details")

details.innerHTML = `
<h3>${cat.category_name}</h3>
<p>${cat.description}</p>
`

}

loadCategories()
