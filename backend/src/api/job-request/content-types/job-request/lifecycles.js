// src/api/job-request/content-types/job-request/lifecycles.js

module.exports = {
  async afterCreate(event) {
    const { result } = event;

    const fullEntry = await strapi.documents("api::job-request.job-request").findOne({
      documentId: result.documentId,
      populate: "*"
    });

    // Il CV è ora un link SharePoint (campo cvUrl), non serve più costruire URL Strapi

    await fetch(process.env.POWER_AUTOMATE_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": process.env.WEBHOOK_SECRET,
      },
      body: JSON.stringify({
        event: "entry.create",
        model: "job-request",
        entry: fullEntry,
      }),
    });
  },
};
