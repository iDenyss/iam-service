kbv-mbez-bth
Diego Quioza
22:49
# Convención de commits — OCTOMATION

## 1. Estructura del mensaje

Usaremos **Conventional Commits** para mantener un historial claro, consistente y fácil de revisar.

```text
<tipo>(<alcance>): <descripción breve>
```

- **tipo:** categoría del cambio.
- **alcance:** módulo o servicio afectado (opcional).
- **descripción:** qué se hizo, en minúsculas y en modo imperativo o descriptivo breve.

Ejemplo:

```text
feat(tenants): agregar endpoint para crear empresas
```

## 2. Palabras clave principales

| Tipo | Cuándo usarlo | Ejemplo |
|---|---|---|
| `feat` | Nueva funcionalidad | `feat(iam): agregar autenticación JWT` |
| `fix` | Corrección de errores | `fix(tenants): corregir conexión a PostgreSQL` |
| `docs` | Documentación | `docs(api): documentar endpoints` |
| `style` | Formato sin cambiar lógica | `style(frontend): ordenar estilos CSS` |
| `refactor` | Reestructuración sin cambiar comportamiento | `refactor(billing): separar lógica de negocio` |
| `perf` | Mejora de rendimiento | `perf(api): optimizar consultas SQL` |
| `test` | Agregar o modificar pruebas | `test(iam): cubrir validación de tokens` |
| `build` | Dependencias o proceso de compilación | `build(tenants): actualizar dependencias` |
| `ci` | Integración y despliegue continuo | `ci(github): agregar workflow de pruebas` |
| `chore` | Mantenimiento general | `chore(repo): limpiar archivos temporales` |
| `revert` | Revertir un commit anterior | `revert: revertir cambio de autenticación` |

## 3. Alcances recomendados para OCTOMATION

Usa el nombre del módulo afectado:

- `frontend`: Next.js.
- `platform`: plataforma principal.
- `iam`: identidad y acceso.
- `tenants`: gestión de empresas y tenants.
- `billing`: facturación.
- `transactions`: transacciones.
- `database`: configuración y acceso a datos.
- `docker`: contenedores y entorno local.
- `deps`: dependencias.
- `docs`: documentación.
- `repo`: configuración del repositorio principal y submódulos.

Ejemplos:

```text
feat(frontend): crear pantalla de inicio de sesión
fix(iam): validar expiración del token
feat(tenants): implementar gestión de empresas
feat(billing): registrar planes de suscripción
feat(transactions): consultar historial de operaciones
build(docker): configurar servicios para desarrollo local
chore(repo): actualizar referencias de submódulos
```

## 4. Palabras para describir acciones

Puedes combinar los tipos anteriores con estos verbos:

| Acción | Palabras sugeridas |
|---|---|
| Crear | `agregar`, `crear`, `implementar` |
| Corregir | `corregir`, `solucionar`, `validar` |
| Mejorar | `optimizar`, `mejorar`, `simplificar` |
| Modificar | `actualizar`, `ajustar`, `adaptar` |
| Eliminar | `eliminar`, `remover`, `limpiar` |
| Documentar | `documentar`, `describir`, `especificar` |
| Probar | `agregar pruebas`, `cubrir`, `verificar` |
| Configurar | `configurar`, `establecer`, `integrar` |

## 5. Reglas de escritura

1. Usa un solo tipo principal por commit.
2. Escribe la descripción en minúsculas, salvo nombres propios o siglas.
3. No termines la descripción con punto.
4. Sé específico: explica qué cambia, no solo que hubo cambios.
5. Evita mensajes genéricos como `cambios`, `actualización` o `arreglos`.
6. Procura que cada commit represente una unidad lógica pequeña.
7. Si el cambio rompe compatibilidad, utiliza `!` y explica el impacto.

Ejemplo de cambio incompatible:

```text
feat(api)!: cambiar formato de respuesta de autenticación
```

## 6. Commits en repositorios con submódulos

OCTOMATION utiliza un repositorio principal y varios submódulos Git. Los cambios deben registrarse en el repositorio correspondiente.

**Dentro del submódulo:**

```text
feat(tenants): agregar endpoint de empresas
```

**En el repositorio principal, cuando cambia la referencia del submódulo:**

```text
chore(repo): actualizar referencia del submódulo tenants
```

Si modificas `.gitmodules`:

```text
fix(repo): corregir URL del submódulo frontend
```

Recuerda que actualizar un submódulo en el repositorio
