const TOKEN = "[TOKEN OF TELEGRAM BOT]";
const CHAT_ID = "[CHAT ID]";

function onFormSubmit(e) {
  if (!e || !e.response) return; // sicurezza se eseguito manualmente

  try {
    const formResponse = e.response;
    const itemResponses = formResponse.getItemResponses();

    // --- 1) MESSAGGIO HTML PER TELEGRAM ---
    let htmlMsg = "<b>📩 Nuova risposta al Modulo</b>\n\n";

    itemResponses.forEach(r => {
      htmlMsg += `<b>${r.getItem().getTitle()}:</b>\n${r.getResponse()}\n\n`;
    });

    UrlFetchApp.fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        chat_id: CHAT_ID,
        text: htmlMsg,
        parse_mode: "HTML"
      })
    });

    // --- 2) PDF CON TUTTE LE RISPOSTE ---
    let pdfContent = "Nuova risposta al modulo\n\n";
    itemResponses.forEach(r => {
      pdfContent += `${r.getItem().getTitle()}:\n${r.getResponse()}\n\n`;
    });

    const doc = DocumentApp.create("Risposta Modulo");
    const body = doc.getBody();
    body.clear();
    body.appendParagraph(pdfContent);
    doc.saveAndClose();

    const pdfBlob = DriveApp.getFileById(doc.getId())
      .getAs("application/pdf")
      .setName("risposta_modulo.pdf");

    DriveApp.getFileById(doc.getId()).setTrashed(true);

  } catch (err) {
    console.error("Errore:", err);
  }
}
