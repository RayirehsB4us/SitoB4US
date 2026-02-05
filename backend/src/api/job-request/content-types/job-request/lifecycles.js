// src/api/job-request/content-types/job-request/lifecycles.js

module.exports = {
  async afterCreate(event) {
    const { result } = event;

    const fullEntry = await strapi.entityService.findOne(
      "api::job-request.job-request",
      result.id,
      {
        populate: "*",
      },
    );

    // Costruisci URL completo per i file CV
    const baseUrl = process.env.STRAPI_API_URL.replace(/\/$/, ""); // Rimuove slash finale

    if (fullEntry.cv && fullEntry.cv.length > 0) {
      fullEntry.cv = fullEntry.cv.map((file) => ({
        ...file,
        url: `${baseUrl}${file.url}`,
      }));
    }

    await fetch(process.env.POWER_AUTOMATE_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": process.env.WEBHOOK_SECRET,
      },
      body: JSON.stringify({
        event: "entry.create",
        model: "job-request", // Era "demo-request", corretto
        entry: fullEntry,
      }),
    });
  },
};
