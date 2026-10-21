# Club Ecuestre María Antonia - Sitio Web Oficial

Respaldo completo y mirror estático del sitio web del **Club Ecuestre María Antonia** (Los Ángeles, Región del Biobío, Chile), optimizado y desplegado en **GitHub Pages**.

## 🌐 Dominio y Despliegue
- **GitHub Pages URL:** `https://estromback.github.io/club-ecuestre-maria-antonia/`
- **Dominio personalizado:** `https://clubecuestremariaantonia.cl/`

### Configuración DNS para vincular el dominio personalizado:
Para activar definitivamente el dominio `clubecuestremariaantonia.cl`:
1. En tu proveedor DNS (Cloudflare, cPanel o registrador NIC Chile):
   - Crear 4 registros tipo **A** para `@`:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
   - Crear un registro **CNAME** para `www` apuntando a:
     - `estromback.github.io`
2. En GitHub -> Settings -> Pages:
   - Confirmar Custom domain: `clubecuestremariaantonia.cl`
   - Activar la casilla **Enforce HTTPS**.

## 📁 Estructura del Sitio
- `index.html`: Página principal del club.
- `planes/`: Sección de planes y modalidades.
- `tienda/`: Catálogo de servicios y tienda.
- `nuestro-equipo/`: Profesores y staff del club.
- `nuestra-mision-y-valores/`: Identidad y filosofía institucional.
- `historia/`: Historia del club e instalaciones.
- `producto/`: Fichas detalladas de cada plan.
- `carrito/`: Carrito y checkout estático.
- `wp-content/`: Todos los estilos (CSS), scripts (JS), tipografías (Comfortaa, Quicksand) e imágenes.
- `images/`: Respaldo completo de fotografías y diplomas en alta resolución.
- `videos/`: Videos institucionales MP4.
