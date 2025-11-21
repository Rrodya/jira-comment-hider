// Функция для скрытия комментариев от указанного пользователя
function hideComments(username) {
  if (!username || !username.trim()) {
    return;
  }

  // Находим все комментарии
  const comments = document.querySelectorAll('.issue-data-block.activity-comment');
  
  comments.forEach(comment => {
    // Ищем ссылку с именем пользователя внутри комментария
    const userLinks = comment.querySelectorAll('a.user-hover.user-avatar');
    
    let shouldHide = false;
    
    userLinks.forEach(link => {
      // Получаем текст имени пользователя из ссылки
      const linkText = link.textContent.trim();
      
      // Проверяем, совпадает ли имя пользователя
      if (linkText === username.trim()) {
        shouldHide = true;
      }
    });
    
    // Скрываем комментарий, если он от указанного пользователя
    if (shouldHide) {
      comment.style.display = 'none';
      comment.setAttribute('data-hidden-by-extension', 'true');
    }
  });
}

// Функция для показа всех комментариев
function showAllComments() {
  const hiddenComments = document.querySelectorAll('[data-hidden-by-extension="true"]');
  hiddenComments.forEach(comment => {
    comment.style.display = '';
    comment.removeAttribute('data-hidden-by-extension');
  });
}

// Основная функция обработки
async function processComments() {
  const result = await chrome.storage.sync.get(['enabled', 'username']);
  const enabled = result.enabled !== false; // по умолчанию включено
  const username = result.username || '';

  if (enabled && username) {
    hideComments(username);
  } else {
    showAllComments();
  }
}

// Обработка новых комментариев, которые могут появиться динамически
const observer = new MutationObserver(() => {
  processComments();
});

// Начальная обработка при загрузке страницы
processComments();

// Наблюдение за изменениями DOM
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Обработка сообщений от popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateSettings') {
    if (request.enabled && request.username) {
      hideComments(request.username);
    } else {
      showAllComments();
    }
    sendResponse({ success: true });
  }
  return true;
});

