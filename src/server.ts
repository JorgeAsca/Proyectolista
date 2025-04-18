// Importaciones de modulos 
import express, { Request, Response } from 'express'; // Crea app web en node.js
import cors from 'cors'; // 
import fs from 'fs';
import path from 'path';

const app = express();
//Crea una instancia de la aplicación Express. Esta instancia (`app`) es el corazón de nuestro servidor web.
// Definicion de el puerto 
const PORT = 3000;

// Define la estructura del el "Item" en la Lista.jsom 
interface Item {
  id: number;
  descripcion: string;
}

interface ListaItems {
  items: Item[];
}

// Configuracionde Middleware = Software que permite la comucicacion entre apps y S.O
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public'))); // Comstruye la ruta absoluta que contiene archivos estaticos

// Rutas de la Api De
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(process.cwd(), 'views', 'index.html'));
});


app.get('/items', async (req: Request, res: Response) => {
  try {
    const data = await leerArchivoJson();
    res.json(data);
  } catch (error) {
    console.error("Error al leer el archivo JSON:", error);
    res.status(500).json({ error: 'Error al leer el archivo' });
  }
});


app.post('/items', async (req: Request, res: Response) => {
  const { descripcion } = req.body;
  if (!descripcion) {
    res.status(400).json({ error: 'Descripción del item es requerida' });
    return;
  }

  const nuevoItem: Item = { id: Date.now(), descripcion };

  try {
    const data = await leerArchivoJson();
    data.items.push(nuevoItem);
    await escribirArchivoJson(data);
    res.json(nuevoItem);
  } catch (error) {
    console.error("Error al agregar el item:", error);
    res.status(500).json({ error: 'Error al agregar el item' });
  }
});


app.delete('/items/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    const data = await leerArchivoJson();
    const index = data.items.findIndex(item => item.id === id);
    if (index === -1) {
      res.status(404).json({ error: 'Item no encontrado' });
      return;
    }
    data.items.splice(index, 1);
    await escribirArchivoJson(data);
    res.json({ message: 'Item eliminado' });
  } catch (error) {
    console.error("Error al eliminar el item:", error);
    res.status(500).json({ error: 'Error al eliminar el item' });
  }
});


app.put('/items/:id', async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { descripcion } = req.body;

  if (!descripcion) {
    res.status(400).json({ error: 'Descripción del item es requerida' });
    return;
  }

  try {
    const data = await leerArchivoJson();
    const item = data.items.find(item => item.id === id);
    if (!item) {
      res.status(404).json({ error: 'Item no encontrado' });
      return;
    }
    item.descripcion = descripcion;
    await escribirArchivoJson(data);
    res.json({ message: 'Item actualizado' });
  } catch (error) {
    console.error("Error al actualizar el item:", error);
    res.status(500).json({ error: 'Error al actualizar el item' });
  }
});


const leerArchivoJson = (): Promise<ListaItems> => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(process.cwd(), 'lista.json'), 'utf8', (err, data) => {
      if (err) {
        console.error("Error al leer el archivo:", err);
        return reject(err);
      }
      try {
        resolve(JSON.parse(data) as ListaItems);
      } catch (parseError) {
        console.error("Error al parsear el archivo JSON:", parseError);
        reject(parseError);
      }
    });
  });
};


const escribirArchivoJson = (data: ListaItems): Promise<void> => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path.join(process.cwd(), 'lista.json'), JSON.stringify(data, null, 2), 'utf8', (err) => {
      if (err) {
        console.error("Error al escribir el archivo:", err);
        return reject(err);
      }
      resolve();
    });
  });
};


app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});