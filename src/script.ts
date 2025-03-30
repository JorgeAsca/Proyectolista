
interface Item {
    id: number;
    descripcion: string;
  }
  

  const lista = document.getElementById("lista") as HTMLUListElement;
  const itemInput = document.getElementById("itemInput") as HTMLInputElement;
  
  
  function cargarLista(): Promise<void> {
    return new Promise((resolve, reject) => {
      fetch("http://localhost:3000/items")
        .then(response => {
          if (!response.ok) {
            return reject(`Error al cargar la lista: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          lista.innerHTML = ""; 
          (data.items as Item[]).forEach(item => renderizarItem(item));
          resolve();
        })
        .catch(error => reject(`Error al cargar la lista: ${error}`));
    });
  }
  
  
  function agregarItem(): Promise<void> {
    const item = itemInput.value.trim();
    if (!item) return Promise.resolve(); 
    itemInput.value = "";
  
    const itemNormalizado = item.toLowerCase();
    
    const itemsExistentes = Array.from(document.querySelectorAll("#lista li span"))
      .map(span => (span as HTMLSpanElement).textContent?.trim().toLowerCase() || "");
  
    if (itemsExistentes.includes(itemNormalizado)) {
      alert("Este producto ya está en la lista.");
      return Promise.resolve(); 
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
          renderizarItem(data as Item);
          resolve();
        })
        .catch(error => reject(`Error al agregar item: ${error}`));
    });
  }
  
 
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
  function eliminarItem(id: number, boton: HTMLElement): Promise<void> {
    return new Promise((resolve, reject) => {
      fetch(`http://localhost:3000/items/${id}`, { method: "DELETE" })
        .then(response => {
          if (!response.ok) {
            return reject(`Error al eliminar item: ${response.status}`);
          }
          return response.json();
        })
        .then(() => {
          boton.parentElement?.remove();
          resolve();
        })
        .catch(error => reject(`Error al eliminar item: ${error}`));
    });
  }
  
  function editarItem(id: number, boton: HTMLElement): void {
    const spanElement = boton.parentElement?.querySelector(`#${id}`) as HTMLSpanElement | null;
    const textoActual = spanElement?.textContent?.trim();
    const nuevoTexto = prompt("Editar item:", textoActual || "");
    if (!nuevoTexto || nuevoTexto === textoActual) return; 
  
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
  
  
  cargarLista().catch(error => console.error(error));