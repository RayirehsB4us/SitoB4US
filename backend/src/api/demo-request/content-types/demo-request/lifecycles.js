// src/api/demo-request/content-types/demo-request/lifecycles.js

module.exports = {
  async afterCreate(event) {
    const { result } = event;

    const fullEntry = await strapi.entityService.findOne(
      "api::demo-request.demo-request",
      result.id,
      {
        populate: "*", // Popola TUTTE le relazioni
      },
    );

    await fetch(process.env.POWER_AUTOMATE_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": process.env.WEBHOOK_SECRET,
      },
      body: JSON.stringify({
        event: "entry.create",
        model: "demo-request",
        entry: fullEntry,
      }),
    });
  },
};
