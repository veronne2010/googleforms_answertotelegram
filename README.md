# Google Forms → Telegram Bot

Automatically send Google Forms responses to a Telegram bot, both as formatted messages and PDF attachments.

## Description

This Google Apps Script intercepts every new response submitted to a Google Form and:
1. Sends a **formatted HTML message** to your Telegram bot
2. Generates and sends a **PDF** with all the answers

## Setup

### 1. Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send the command `/newbot`
3. Follow the instructions and **save the TOKEN** you receive
4. To get your CHAT_ID:
   - Send a message to your bot
   - Open in browser: `https://api.telegram.org/bot[TOKEN]/getUpdates`
   - Look for the value `"chat":{"id":123456789}`

### 2. Configure Google Forms

1. Open your Google Form
2. Click the three dots menu (top right) → **Script editor**
3. Delete any existing code and paste the script from this project
4. Replace `[TOKEN OF TELEGRAM BOT]` with your bot token
5. Replace `[CHAT ID]` with your chat ID

### 3. Set up the Trigger

1. In the Apps Script editor, click the **clock icon** (Triggers) in the left sidebar
2. Click **+ Add Trigger** (bottom right)
3. Configure:
   - Function: `onFormSubmit`
   - Event source: `From form`
   - Event type: `On form submit`
4. Click **Save** and authorize the required permissions

## Code

```javascript
const TOKEN = "[TOKEN OF TELEGRAM BOT]";
const CHAT_ID = "[CHAT ID]";

function onFormSubmit(e) {
  if (!e || !e.response) return; // safety check if run manually
  
  try {
    const formResponse = e.response;
    const itemResponses = formResponse.getItemResponses();
    
    // --- 1) HTML MESSAGE FOR TELEGRAM ---
    let htmlMsg = "<b>📩 New Form Response</b>\n\n";
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
    
    // --- 2) PDF WITH ALL RESPONSES ---
    let pdfContent = "New Form Response\n\n";
    itemResponses.forEach(r => {
      pdfContent += `${r.getItem().getTitle()}:\n${r.getResponse()}\n\n`;
    });
    
    const doc = DocumentApp.create("Form Response");
    const body = doc.getBody();
    body.clear();
    body.appendParagraph(pdfContent);
    doc.saveAndClose();
    
    const pdfBlob = DriveApp.getFileById(doc.getId())
      .getAs("application/pdf")
      .setName("form_response.pdf");
    
    DriveApp.getFileById(doc.getId()).setTrashed(true);
    
  } catch (err) {
    console.error("Error:", err);
  }
}
```

## Features

- **Real-time notifications**: Instant Telegram message when someone submits the form
- **HTML formatting**: Clean, readable message format with bold labels
- **PDF generation**: Automatic PDF creation for archival purposes
- **Error handling**: Built-in error management and logging
- **Automatic cleanup**: Temporary Google Docs are automatically deleted

## Customization

### Change Message Format

Modify the `htmlMsg` section to customize the Telegram message:

```javascript
let htmlMsg = "<b>🎉 Custom Title</b>\n\n";
// Add custom fields or formatting
```

### Change PDF Name

Update the PDF filename:

```javascript
.setName("custom_name.pdf");
```

### Add PDF to Telegram

To also send the PDF via Telegram, add this after the PDF generation:

```javascript
UrlFetchApp.fetch(`https://api.telegram.org/bot${TOKEN}/sendDocument`, {
  method: "post",
  payload: {
    chat_id: CHAT_ID,
    document: pdfBlob
  }
});
```

## Troubleshooting

- **Not receiving messages**: Check that TOKEN and CHAT_ID are correct
- **Permission errors**: Make sure you've authorized the script when setting up the trigger
- **Trigger not working**: Verify the trigger is set to "On form submit" (not "On open")

## License

MIT License - Feel free to use and modify this project

## Contributing

Contributions, issues, and feature requests are welcome!

---

Made with ❤️ for automating form responses
