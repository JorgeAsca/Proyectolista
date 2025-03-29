// Obtener referencias a los elementos del DOM
const lista = document.getElementById("lista") as HTMLUListElement;
const itemInput = document.getElementById("itemInput") as HTMLInputElement;

// Definición de la interfaz para un Item
interface Item {
    id: number;
    descripcion: string;
}

// Cargar la lista desde el servidor
function cargarLista(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        fetch("http://localhost:3000/items")
            .then(response => response.json())
            .then((data: { items: Item[] }) => {
                lista.innerHTML = ""; // Limpiar la lista antes de renderizar
                data.items.forEach(item => renderizarItem(item));
                resolve();
            })
            .catch(error => reject("Error al cargar la lista"));
    });
}

// Agregar un nuevo item
function agregarItem(): Promise<void> {
    const item = itemInput.value.trim();
    if (!item) return Promise.resolve();
    itemInput.value = "";

    const itemNormalizado = item.toLowerCase();
    // Verificar si ya existe en la lista
    const itemsExistentes = Array.from(document.querySelectorAll("#lista li span"))
        .map(span => (span.textContent || "").trim().toLowerCase());

    if (itemsExistentes.includes(itemNormalizado)) {
        alert("Este producto ya está en la lista.");
        return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
        fetch("http://localhost:3000/items", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ descripcion: item })
        })
            .then(response => response.json())
            .then((data: Item) => {
                renderizarItem(data);
                resolve();
            })
            .catch(error => reject("Error al agregar item"));
    });
}

// Renderizar un item en la lista
function renderizarItem(item: Item): void {
    const li = document.createElement("li");
    li.innerHTML = `
        <span id="${item.id}">${item.descripcion}</span> 
        <button class="danger" onclick="eliminarItem(${item.id}, this)">❌</button>
        <button class="edit" onclick="editarItem(${item.id}, this)">✏️</button>
    `;
    lista.appendChild(li);
}

// Eliminar un item
function eliminarItem(id: number, boton: HTMLButtonElement): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        fetch(`http://localhost:3000/items/${id}`, { method: "DELETE" })
            .then(response => response.json())
            .then(() => {
                boton.parentElement?.remove();
                resolve();
            })
            .catch(error => reject("Error al eliminar item"));
    });
}

function editarItem(id: number, boton: HTMLButtonElement): void {
    const span = boton.parentElement?.querySelector("span");
    const textoActual = span ? span.textContent?.trim() : '';
    const nuevoTexto = prompt("Editar item:", textoActual || "");

    if (!nuevoTexto) return;

    fetch(`http://localhost:3000/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descripcion: nuevoTexto })
    })
        .then(response => response.json())
        .then(() => {
            if (span) {
                span.textContent = nuevoTexto;
            }
        })
        .catch(error => console.error("Error al editar item", error));
}

// Cargar la lista al iniciar
cargarLista().catch(error => console.error(error));