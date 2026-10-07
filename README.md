# Portfolio · Gerard Josep Ramon Catasus

Web estática (HTML + CSS + JS, sin frameworks ni build). Bilingüe ES/EN, tema claro/oscuro, interfaz tipo menú de juego.

## Estructura

```
index.html            Contenido: hero, 4 juegos, sobre mí, contacto
css/styles.css        Estilos base (maquetación, componentes)
css/skin-menu.css     Estilo "menú" (paleta crema, barras de título, animaciones). Es el que se usa
js/main.js            Idioma, tema, menú, galerías, visor, contadores, animaciones de scroll
assets/games/<juego>/ Capturas de cada juego (1.jpg, 2.jpg…)
cv/Gerard-Catasus-CV.pdf   CV descargable
.claude/serve.ps1     Servidor local para previsualizar (no hace falta para publicar)
```

## Editar

- Los textos bilingües van en pares: `<span lang="es">…</span><span lang="en">…</span>`.
- Capturas: cada juego carga `assets/games/<juego>/1.jpg … N.jpg` (la 1 es la portada).
  Para añadir una, guarda el siguiente número y sube `data-n` en el bloque `data-gallery` de `index.html`.
- Los avisos «✎ Pendiente» marcan lo que aún falta por rellenar (búscalos en `index.html`).
- Cuando Geometrical y Konboys salgan, actualiza su estado (la insignia `badge soon` y la fila «Estado»).
- Para cambiar el CV, sustituye `cv/Gerard-Catasus-CV.pdf` (mismo nombre).

## Vista previa local

Con Python: `python -m http.server 5500`. Con Node: `npx serve`.
Sin ninguno (Windows):

```powershell
powershell -ExecutionPolicy Bypass -File .claude/serve.ps1
```

y abre <http://localhost:5500>.

## Publicar gratis

**GitHub Pages:** sube estos archivos a un repositorio (con `index.html` en la raíz) y activa
*Settings → Pages → Deploy from a branch → `main` / `(root)`*.

**Netlify:** arrastra la carpeta a <https://app.netlify.com/drop>. No necesita comando de build.
