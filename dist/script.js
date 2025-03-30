"use strict";
// Obtener referencias a los elementos del DOM con tipado específico
const lista = document.getElementById("lista");
const itemInput = document.getElementById("itemInput");
// Cargar la lista desde el servidor
function cargarLista() {
    return new Promise((resolve, reject) => {
        fetch("http://localhost:3000/items")
            .then(response => {
            if (!response.ok) {
                return reject(`Error al cargar la lista: ${response.status}`);
            }
            return response.json();
        })
            .then(data => {
            lista.innerHTML = ""; // Limpiar la lista antes de renderizar
            data.items.forEach(item => renderizarItem(item));
            resolve();
        })
            .catch(error => reject(`Error al cargar la lista: ${error}`));
    });
}
// Agregar un nuevo item
function agregarItem() {
    const item = itemInput.value.trim();
    if (!item)
        return Promise.resolve(); // No hacer nada si el input está vacío
    itemInput.value = "";
    const itemNormalizado = item.toLowerCase();
    // Verificar si ya existe en la lista
    const itemsExistentes = Array.from(document.querySelectorAll("#lista li span"))
        .map(span => { var _a; return ((_a = span.textContent) === null || _a === void 0 ? void 0 : _a.trim().toLowerCase()) || ""; });
    if (itemsExistentes.includes(itemNormalizado)) {
        alert("Este producto ya está en la lista.");
        return Promise.resolve(); // Salir sin agregar
    }
    return new Promise((resolve, reject) => {
        fetch("http://localhost:3000/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ descripcion: item })
        })
            .then(response => {
            if (!response.ok) {
                return reject(`Error al agregar item: ${response.status}`);
            }
            return response.json();
        })
            .then(data => {
            renderizarItem(data);
            resolve();
        })
            .catch(error => reject(`Error al agregar item: ${error}`));
    });
}
// Renderizar un item en la lista
function renderizarItem(item) {
    const li = document.createElement("li");
    li.innerHTML = `
          <span id="${item.id}">${item.descripcion}</span>
          <button class="danger" onclick="eliminarItem(${item.id}, this)">❌</button>
          <button class="edit" onclick="editarItem(${item.id}, this)">✏️</button>
      `;
    lista.appendChild(li);
}
// Eliminar un item
function eliminarItem(id, boton) {
    return new Promise((resolve, reject) => {
        fetch(`http://localhost:3000/items/${id}`, { method: "DELETE" })
            .then(response => {
            if (!response.ok) {
                return reject(`Error al eliminar item: ${response.status}`);
            }
            return response.json();
        })
            .then(() => {
            var _a;
            (_a = boton.parentElement) === null || _a === void 0 ? void 0 : _a.remove();
            resolve();
        })
            .catch(error => reject(`Error al eliminar item: ${error}`));
    });
}
function editarItem(id, boton) {
    var _a, _b;
    const spanElement = (_a = boton.parentElement) === null || _a === void 0 ? void 0 : _a.querySelector(`#${id}`);
    const textoActual = (_b = spanElement === null || spanElement === void 0 ? void 0 : spanElement.textContent) === null || _b === void 0 ? void 0 : _b.trim();
    const nuevoTexto = prompt("Editar item:", textoActual || "");
    if (!nuevoTexto || nuevoTexto === textoActual)
        return; // No hacer nada si se cancela o no hay cambios
    fetch(`http://localhost:3000/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descripcion: nuevoTexto })
    })
        .then(response => {
        if (!response.ok) {
            console.error(`Error al editar item: ${response.status}`);
            return;
        }
        return response.json();
    })
        .then(data => {
        if (spanElement) {
            spanElement.textContent = nuevoTexto;
        }
    })
        .catch(error => console.error("Error al editar item", error));
}
// Cargar la lista al iniciar
cargarLista().catch(error => console.error(error));
