(function () {
  const STORAGE_KEY = 'apSidebarOpen';
  const MSG_TOGGLE = 'AP_TOGGLE_SIDEBAR';
  const HOST_ID = 'ap-calendar-sidebar-host';

  function isOpenFromValue(value) {
    return value === true;
  }

  function applyOpenState(root, open) {
    if (open) {
      document.documentElement.classList.add('ap-calendar-sidebar-open');
      root.querySelector('.ap-toggle')?.setAttribute('aria-expanded', 'true');
    } else {
      document.documentElement.classList.remove('ap-calendar-sidebar-open');
      root.querySelector('.ap-toggle')?.setAttribute('aria-expanded', 'false');
    }
  }

  async function persistOpen(open) {
    try {
      await chrome.storage.local.set({ [STORAGE_KEY]: open });
    } catch {
      /* ignore */
    }
  }

  async function readStoredOpen() {
    try {
      const data = await chrome.storage.local.get(STORAGE_KEY);
      return isOpenFromValue(data[STORAGE_KEY]);
    } catch {
      return false;
    }
  }

  function ensureHost() {
    let root = document.getElementById(HOST_ID);
    if (root) return root;

    root = document.createElement('div');
    root.id = HOST_ID;
    root.className = 'ap-host';

    const panel = document.createElement('div');
    panel.className = 'ap-panel';
    panel.setAttribute('role', 'complementary');
    panel.setAttribute('aria-label', 'Extension sidebar');

    const iframe = document.createElement('iframe');
    iframe.className = 'ap-frame';
    iframe.title = 'Academic Planner sidebar';
    iframe.src = chrome.runtime.getURL('src/sidebar.html');

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'ap-toggle';
    toggle.setAttribute('aria-label', 'Toggle sidebar');
    const chev = document.createElement('span');
    chev.className = 'ap-toggle-chevron';
    chev.setAttribute('aria-hidden', 'true');
    toggle.appendChild(chev);

    panel.appendChild(iframe);
    root.appendChild(panel);
    root.appendChild(toggle);
    (document.documentElement || document.body).appendChild(root);

    return root;
  }

  function wireToggle(root, getOpen, setOpen) {
    const toggle = root.querySelector('.ap-toggle');
    if (!toggle || toggle.dataset.apWired) return;
    toggle.dataset.apWired = '1';

    toggle.addEventListener('click', () => {
      const next = !getOpen();
      setOpen(next);
      persistOpen(next);
    });
  }

  let openRef = false;

  async function init() {
    if (document.getElementById(HOST_ID)) return;

    const root = ensureHost();
    openRef = await readStoredOpen();
    applyOpenState(root, openRef);

    const getOpen = () => openRef;
    const setOpen = (next) => {
      openRef = next;
      applyOpenState(root, openRef);
    };

    wireToggle(root, getOpen, setOpen);

    chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
      if (msg && msg.type === MSG_TOGGLE) {
        openRef = !openRef;
        applyOpenState(root, openRef);
        persistOpen(openRef);
        sendResponse({ open: openRef });
      }
      return undefined;
    });
  }

  void init();
})();
