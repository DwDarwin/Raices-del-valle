## ~~~~~~~~~~~~~~~~~~RAICES DEL VALLE ~~~~~~~~~~~~~~~~~~
---

## INTEGRANTES:

- Amanda Chindoy
- Diego Moreno
- Evelyn Pascual
- Darwin Noriega

---

## 1. OBJETIVO DEL PROYECTO 

Raices del valle es un aplicativo web orientado a la inclusion de los territorios y campesinos que tengan productos de valor para ser comercializados, raices del valle busca eliminar los intermediarios creando un enlace directo entre los agricultores y los clientes.

---

## 2. RESUMEN DEL PROYECTO

* ARQUITECTURA 

frontend: (en construccion)
* HTML
* CSS
* JavaScript 

Backend (por construir)

* Java
* Spring Boot

Base de datos (por construir)

* MySql


Contruccion del Frontend: El frondend se construye con Html5, CSS3 y la interactividad con JavaScript.
* Los documentos HTML se dividen por paginas funcionales teniendo como integrador la pagina index.html y las paginas dentro de la carpeta "pages".
* Los documentos CSS en carpeta CSS, se creo hoja de estilos para cada pagina y una hoja de estilo general para integrar los componentes generales y paleta de colores. 
* La carpeta JS guarda los script para las funcionalidades de las paginas
* la carpeta SERVICE las funcionalidades del formulario de contactos
* ASSETS para guardas las imagens y logos.


```text
Raices del valle/
├── index.html
└── assets/
    ├── css/
    │   ├── admin.css
    │   ├── contacto.css
    │   ├── equipo.css
    │   ├── finca.css
    │   ├── footer.css
    │   ├── header.css
    │   ├── home.css
    │   ├── nosotros.css
    │   └── styles.css
    ├── js/
    │   ├── components/
    │   │   ├── menuMobile.js
    │   │   └── product.Card.js
    │   ├── page/
    │   │   ├── contacto.js
    │   │   ├── home.js
    │   │   └── mercado.js
    │   ├── admin.js
    │   ├── app.js
    │   ├── data.js
    │   └── store.js
    ├── page/
    │   ├── admin.html
    │   ├── contacto.html
    │   ├── equipo.html
    │   ├── footer.html
    │   └── header.html
    └── service/
        └── contacto.js
```
  
---

## 3. ESTRUCTURA Y ORGANIZACION DE LA APLICACION

1. Landig page, principal (inicio)

Esta pagina mantiene el banner principal, muestra informacion relevante sore el objetivo de la aplicacion, trae a la vista los productos mas destacados.
Permite el acceso a una vista mas detallada de las familias que se encuentran detras de los productos que se comercializan

2. Mercado (en construccion)


3. Nosotros

Nos permite acercarnos un poco mas a la pagina y sus creadores 
 

4. La finca (en construccion)


5. Contacto

En esta pagina se encuentra un espacio para quienes esten interesados en hacer parte de RAICES DEL VALLE se comuniquen con el administrador. 

6. Administrdor 

La pagina administrador permite a quien administra la pagina poder interactuar con todos los componentes y tiene los permisos para ejercer un CRUDS. 

---

## 4. PERSISTENCIA DE DATOS (BD aun no implementada)

Se estan almacenando datos de pruebas definidos en JavaScript para que se muestren en las vistas correspondientes 