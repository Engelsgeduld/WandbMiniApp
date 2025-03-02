export const showTelegramPopup = (title, message) => {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.showPopup({
      title,
      message,
      buttons: [{ id: "ok", type: "ok" }]
    });
  }
};