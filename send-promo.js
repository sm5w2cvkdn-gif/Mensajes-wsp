// send-promo.js
// Envía un mensaje de plantilla de WhatsApp (promo semanal) a cada contacto en contacts.json
//
// Variables necesarias (se configuran como "Secrets" en GitHub, ver README.md):
//   WHATSAPP_TOKEN       -> Token de acceso permanente de Meta
//   PHONE_NUMBER_ID      -> El "Phone Number ID" de tu número en Meta for Developers
//   TEMPLATE_NAME        -> El nombre exacto de la plantilla aprobada por Meta (ej: "promo_semanal")
//   TEMPLATE_LANG        -> Código de idioma de la plantilla (ej: "es_AR", "es")
//   TEMPLATE_VARS        -> Las variables del mensaje separadas por "|" (ej: "Zapatillas|20%|domingo")

const fs = require("fs");

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const TEMPLATE_NAME = process.env.TEMPLATE_NAME;
const TEMPLATE_LANG = process.env.TEMPLATE_LANG || "es";
const TEMPLATE_VARS = (process.env.TEMPLATE_VARS || "")
  .split("|")
  .map((v) => v.trim())
  .filter((v) => v.length > 0);

if (!TOKEN || !PHONE_NUMBER_ID || !TEMPLATE_NAME) {
  console.error("Faltan variables de entorno obligatorias (WHATSAPP_TOKEN, PHONE_NUMBER_ID, TEMPLATE_NAME).");
  process.exit(1);
}

function loadContacts() {
  const raw = fs.readFileSync(__dirname + "/contacts.json", "utf-8");
  const data = JSON.parse(raw);
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("contacts.json está vacío o mal formado.");
  }
  return data;
}

async function sendTemplateMessage(toNumber) {
  const url = `https://graph.facebook.com/v20.0/${PHONE_NUMBER_ID}/messages`;

  const components =
    TEMPLATE_VARS.length > 0
      ? [
          {
            type: "body",
            parameters: TEMPLATE_VARS.map((text) => ({ type: "text", text })),
          },
        ]
      : [];

  const body = {
    messaging_product: "whatsapp",
    to: toNumber,
    type: "template",
    template: {
      name: TEMPLATE_NAME,
      language: { code: TEMPLATE_LANG },
      components,
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();

  if (!res.ok) {
    console.error(`❌ Error enviando a ${toNumber}:`, JSON.stringify(json));
    return { toNumber, ok: false, error: json };
  }

  console.log(`✅ Enviado a ${toNumber}`);
  return { toNumber, ok: true };
}

async function main() {
  const contacts = loadContacts();
  console.log(`Enviando promo a ${contacts.length} contactos usando la plantilla "${TEMPLATE_NAME}"...`);

  const results = [];
  for (const contact of contacts) {
    const number = typeof contact === "string" ? contact : contact.phone;
    // Pequeña pausa entre envíos para no saturar la API
    await new Promise((r) => setTimeout(r, 300));
    const result = await sendTemplateMessage(number);
    results.push(result);
  }

  const exitosos = results.filter((r) => r.ok).length;
  const fallidos = results.length - exitosos;
  console.log(`\nResumen: ${exitosos} enviados OK, ${fallidos} con error.`);

  if (fallidos > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});
