# Envío automático de promo semanal por WhatsApp (gratis)

Este sistema manda tu promo semanal a tu lista de clientes automáticamente,
usando la API oficial de Meta y GitHub Actions como "reloj" gratuito.
No necesitás pagar hosting ni ninguna plataforma externa.

## Qué necesitás tener antes de empezar

1. Una cuenta de **Meta Business** (ya la tenés).
2. Tu número conectado a la **WhatsApp Cloud API** (Meta for Developers → producto WhatsApp).
3. Una cuenta de **GitHub** (gratis): https://github.com/signup
4. Una **plantilla de mensaje** de categoría "Marketing" ya aprobada por Meta.

---

## Paso 1: Conseguir tus 3 datos de Meta

En [developers.facebook.com](https://developers.facebook.com) → tu app → WhatsApp → Introducción:

- **Phone Number ID**
- **Token de acceso permanente**: en vez del token temporal (que expira en 24hs),
  generá uno permanente en: Configuración de la app → Usuarios del sistema →
  crear un usuario del sistema → generar token con permisos `whatsapp_business_messaging`
  y `whatsapp_business_management`.
- **Nombre y idioma de tu plantilla aprobada** (ej: `promo_semanal`, idioma `es_AR`)

## Paso 2: Subir este proyecto a GitHub

1. Entrá a GitHub, creá un repositorio nuevo (puede ser privado).
2. Subí estos 3 archivos manteniendo la carpeta `.github/workflows/`:
   - `send-promo.js`
   - `contacts.json`
   - `.github/workflows/send-weekly-promo.yml`
3. Podés arrastrar los archivos directamente desde la web de GitHub ("Add file" → "Upload files").

## Paso 3: Cargar tus datos secretos (nunca van en el código)

En tu repositorio: **Settings → Secrets and variables → Actions → New repository secret**.
Creá estos 5 secrets:

| Nombre | Valor de ejemplo |
|---|---|
| `WHATSAPP_TOKEN` | el token permanente que generaste |
| `PHONE_NUMBER_ID` | el ID de tu número |
| `TEMPLATE_NAME` | `promo_semanal` |
| `TEMPLATE_LANG` | `es_AR` |
| `TEMPLATE_VARS` | `Zapatillas|20%|domingo` (las variables de tu plantilla, separadas por `\|`) |

## Paso 4: Cargar tu lista de clientes reales

Editá el archivo `contacts.json` y poné los números reales de tus clientes,
con código de país, sin espacios ni el símbolo "+". Ejemplo para Argentina:

```json
[
  "5491122334455",
  "5491133445566"
]
```

## Paso 5: ¡Listo! Ya se manda solo

El workflow está configurado para correr **todos los lunes a las 10:00 (hora Argentina)**.
No tenés que hacer nada más — GitHub lo ejecuta solo, gratis, todas las semanas.

### Para cambiar el texto de la promo cada semana

Como Meta exige plantillas pre-aprobadas para mensajes de marketing, tenés 2 opciones:

- **Más simple**: dejá la plantilla con variables (producto, descuento, fecha) y
  cada semana solo actualizás el secret `TEMPLATE_VARS` con los nuevos valores
  (Settings → Secrets → editar `TEMPLATE_VARS`).
- **Más flexible**: aprobá 2-3 plantillas distintas en Meta y cambiás el secret
  `TEMPLATE_NAME` según cuál quieras usar esa semana.

### Para probarlo manualmente sin esperar al lunes

En GitHub: pestaña **Actions** → click en "Enviar promo semanal por WhatsApp" →
botón **"Run workflow"**. Así probás que todo funcione antes de confiar en el automatismo.

### Para cambiar el día/hora de envío

Editá la línea `cron` en `.github/workflows/send-weekly-promo.yml`.
Podés generar el valor correcto en https://crontab.guru (recordá que el horario
del cron está en UTC, 3 horas adelantado respecto a Argentina).

---

## Límites a tener en cuenta

- Meta te da **1000 conversaciones gratis por mes**; si tu lista es más grande
  o mandás más seguido, empieza a cobrar por conversación (revisá tarifas en
  la sección de precios de Meta for Developers).
- Los mensajes de marketing solo se pueden mandar con plantillas aprobadas —
  no podés escribir cualquier texto libre.
- Si un cliente te responde, esa respuesta **no aparece en ninguna app** —
  quedaría "perdida" salvo que en el futuro agreguemos un webhook para leerla.
  Si eso te importa, avisame y lo sumamos como paso 2 del proyecto.
