const axios = require("axios");

const STRAPI_URL = "http://192.168.1.32:1337";
const API_ENDPOINT = `${STRAPI_URL}/api/employes`;
const IMAGE_ID = 22; // Stessa immagine per tutti

const employees = [
  { nome: "Riccardo", cognome: "Germinario", jobTitle: "Owner", annoAssunzione: "" },
  { nome: "Maurizio", cognome: "Colli Vignarelli", jobTitle: "", annoAssunzione: "" },
  { nome: "Nicolò", cognome: "Guerra", jobTitle: "Senior System Administrator", annoAssunzione: "" },
  { nome: "Marco", cognome: "D'Angelo", jobTitle: "", annoAssunzione: "" },
  { nome: "Pedro", cognome: "Nova", jobTitle: "", annoAssunzione: "" },
  { nome: "Pasquale Lino", cognome: "Schiavone", jobTitle: "", annoAssunzione: "" },
  { nome: "Dario", cognome: "Gurrieri", jobTitle: "", annoAssunzione: "" },
  { nome: "Federica", cognome: "De Iudicibus", jobTitle: "", annoAssunzione: "" },
  { nome: "Andrea Saverio", cognome: "Esposito Ferrara", jobTitle: "", annoAssunzione: "" },
  { nome: "Gabriele", cognome: "Alessi", jobTitle: "", annoAssunzione: "" },
  // Sheriyar Shakeel esiste già (id: 1), lo saltiamo
  { nome: "Roberto", cognome: "DIgnazio", jobTitle: "", annoAssunzione: "" },
  { nome: "Marco", cognome: "Rossi", jobTitle: "", annoAssunzione: "" },
  { nome: "Carmen", cognome: "Calderone", jobTitle: "", annoAssunzione: "" },
  { nome: "Corrado", cognome: "Molinatto", jobTitle: "", annoAssunzione: "" },
  { nome: "Jacopo Bruno", cognome: "Marchetti", jobTitle: "", annoAssunzione: "" },
  { nome: "Marco", cognome: "Veglia", jobTitle: "", annoAssunzione: "" },
  { nome: "Pietro", cognome: "Ceriani", jobTitle: "", annoAssunzione: "" },
  { nome: "Amministrazione", cognome: "B4US", jobTitle: "", annoAssunzione: "" },
  { nome: "Francesco", cognome: "Mura", jobTitle: "", annoAssunzione: "" },
  { nome: "Francesco", cognome: "Guerrieri", jobTitle: "", annoAssunzione: "" },
  { nome: "Martin", cognome: "Asaro", jobTitle: "", annoAssunzione: "" },
  { nome: "Marco", cognome: "Foglio", jobTitle: "", annoAssunzione: "" },
  { nome: "Damiano", cognome: "Mirante", jobTitle: "", annoAssunzione: "" },
];

async function createEmployee(employee) {
  const payload = {
    data: {
      nome: employee.nome,
      cognome: employee.cognome,
      jobTitle: employee.jobTitle,
      AnnoAssunzione: employee.annoAssunzione,
      pic: [IMAGE_ID], // relazione con l'immagine id 22
    },
  };

  try {
    const response = await axios.post(API_ENDPOINT, payload, {
      headers: { "Content-Type": "application/json" },
    });
    console.log(
      `✅ Creato: ${employee.nome} ${employee.cognome} (id: ${response.data.data.id})`
    );
    return response.data;
  } catch (error) {
    console.error(
      `❌ Errore per ${employee.nome} ${employee.cognome}:`,
      error.response?.data?.error?.message || error.message
    );
    return null;
  }
}

async function main() {
  console.log(`\n🚀 Inizio popolamento dipendenti su ${API_ENDPOINT}\n`);
  console.log(`📸 Immagine usata per tutti: id ${IMAGE_ID}\n`);
  console.log(`👥 Dipendenti da creare: ${employees.length}\n`);
  console.log("─".repeat(50));

  let created = 0;
  let failed = 0;

  for (const emp of employees) {
    const result = await createEmployee(emp);
    if (result) {
      created++;
    } else {
      failed++;
    }
    // Piccola pausa per non sovraccaricare il server
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  console.log("\n" + "─".repeat(50));
  console.log(`\n📊 Risultato finale:`);
  console.log(`   ✅ Creati: ${created}`);
  console.log(`   ❌ Falliti: ${failed}`);
  console.log(`   📋 Totale: ${employees.length}\n`);
}

main();
