// Загрузка сохраненных настроек
async function loadSettings() {
  const result = await chrome.storage.sync.get(['enabled', 'username']);
  const enabled = result.enabled !== false; // по умолчанию включено
  const username = result.username || '';

  document.getElementById('enabled-toggle').checked = enabled;
  document.getElementById('username-input').value = username;
  
  updateCurrentSettings(enabled, username);
}

// Сохранение настроек
async function saveSettings() {
  const enabled = document.getElementById('enabled-toggle').checked;
  const username = document.getElementById('username-input').value.trim();

  await chrome.storage.sync.set({
    enabled: enabled,
    username: username
  });

  // Обновляем текущие настройки
  updateCurrentSettings(enabled, username);

  // Показываем сообщение об успехе
  const statusMessage = document.getElementById('status-message');
  statusMessage.textContent = 'Настройки сохранены!';
  statusMessage.className = 'status-message success';
  
  setTimeout(() => {
    statusMessage.textContent = '';
    statusMessage.className = 'status-message';
  }, 2000);

  // Отправляем сообщение content script для обновления
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'updateSettings',
        enabled: enabled,
        username: username
      });
    }
  } catch (error) {
    // Игнорируем ошибки, если content script еще не загружен
    console.log('Content script not ready yet');
  }
}

// Обновление отображения текущих настроек
function updateCurrentSettings(enabled, username) {
  const currentSettings = document.getElementById('current-settings');
  if (enabled && username) {
    currentSettings.innerHTML = `
      <div class="setting-item">
        <span class="setting-label">Статус:</span>
        <span class="setting-value enabled">Включено</span>
      </div>
      <div class="setting-item">
        <span class="setting-label">Пользователь:</span>
        <span class="setting-value">${escapeHtml(username)}</span>
      </div>
    `;
  } else if (enabled && !username) {
    currentSettings.innerHTML = `
      <div class="setting-item">
        <span class="setting-label">Статус:</span>
        <span class="setting-value enabled">Включено</span>
      </div>
      <div class="setting-item">
        <span class="setting-label">Пользователь:</span>
        <span class="setting-value warning">Не указан</span>
      </div>
    `;
  } else {
    currentSettings.innerHTML = `
      <div class="setting-item">
        <span class="setting-label">Статус:</span>
        <span class="setting-value disabled">Выключено</span>
      </div>
    `;
  }
}

// Экранирование HTML для безопасности
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Обработчики событий
document.addEventListener('DOMContentLoaded', loadSettings);
document.getElementById('save-btn').addEventListener('click', saveSettings);
document.getElementById('enabled-toggle').addEventListener('change', () => {
  // Автоматически сохраняем при изменении тогла
  saveSettings();
});

// Автосохранение при вводе (с задержкой)
let saveTimeout;
document.getElementById('username-input').addEventListener('input', () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveSettings, 1000);
});

