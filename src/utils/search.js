import { apiCall } from './api.js';
import { getAllRooms, getAllStudents } from './data.js';

export const initGlobalSearch = () => {
  // Create UI
  const searchModal = document.createElement('div');
  searchModal.id = 'global-search-modal';
  searchModal.style.cssText = `
        display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); z-index: 10000;
        justify-content: center; padding-top: 10vh;
    `;

  searchModal.innerHTML = `
        <div class="search-container" style="width: 90%; max-width: 600px; animation: slideDown 0.2s ease-out;">
            <div class="card" style="padding: 0; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
                <div style="padding: 1.25rem; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: 1rem; background: #fff;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" id="global-search-input" placeholder="Search students, rooms, or actions..." style="border: none; outline: none; width: 100%; font-size: 1.1rem; background: transparent;">
                    <div style="background: var(--surface-hover); padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; color: var(--text-secondary); font-weight: 700; border: 1px solid var(--border-color);">ESC</div>
                </div>
                <div id="search-results" style="max-height: 400px; overflow-y: auto; background: #fcfcfc;">
                    <div style="padding: 2rem; text-align: center; color: var(--text-secondary);">
                        <p style="font-size: 0.9rem;">Type to search...</p>
                        <div style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 1rem;">
                            <span class="search-tag">#students</span>
                            <span class="search-tag">#rooms</span>
                            <span class="search-tag">#blocks</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <style>
            @keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            .search-tag { font-size: 0.75rem; background: #eee; padding: 2px 8px; border-radius: 12px; }
            .search-result-item { padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-color); cursor: pointer; transition: background 0.2s; display: flex; align-items: center; gap: 1rem; text-decoration: none; color: inherit; }
            .search-result-item:hover { background: var(--surface-hover); }
            .search-result-item mark { background: #fef08a; color: inherit; padding: 0 2px; border-radius: 2px; }
        </style>
    `;

  document.body.appendChild(searchModal);

  const input = document.getElementById('global-search-input');
  const resultsContainer = document.getElementById('search-results');

  const closeModal = () => {
    searchModal.style.display = 'none';
    input.value = '';
  };

  // Shortcut: Ctrl + K or Cmd + K
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchModal.style.display = 'flex';
      input.focus();
    }
    if (e.key === 'Escape') closeModal();
  });

  searchModal.addEventListener('click', (e) => {
    if (e.target === searchModal) closeModal();
  });

  let debounceTimer;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const query = input.value.trim().toLowerCase();
      if (query.length < 2) {
        resultsContainer.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-secondary);">Keep typing...</div>';
        return;
      }

      resultsContainer.innerHTML = '<div style="padding: 2rem; text-align: center;"><div class="skeleton" style="height: 20px; width: 100px; margin: 0 auto;"></div></div>';

      try {
        const [rooms, students] = await Promise.all([getAllRooms(), getAllStudents()]);

        const filteredRooms = rooms.filter(r =>
          r.id.toLowerCase().includes(query) ||
          r.block.toLowerCase().includes(query) ||
          `block ${r.block}`.toLowerCase().includes(query)
        ).slice(0, 5);

        const filteredStudents = students.filter(s =>
          s.id.toLowerCase().includes(query) ||
          s.name.toLowerCase().includes(query) ||
          (s.department && s.department.toLowerCase().includes(query))
        ).slice(0, 5);

        let html = '';

        if (filteredRooms.length > 0) {
          html += `<div style="padding: 0.5rem 1.25rem; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; background: #f8fafc; border-bottom: 1px solid var(--border-color);">Rooms</div>`;
          filteredRooms.forEach(r => {
            html += `
                            <a href="#/search?q=${r.id}" class="search-result-item" onclick="document.getElementById('global-search-modal').style.display='none'">
                                <div style="width: 32px; height: 32px; border-radius: 8px; background: #e0f2fe; color: #0369a1; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem;">${r.block}</div>
                                <div>
                                    <div style="font-weight: 600;">Room ${r.id}</div>
                                    <div style="font-size: 0.8rem; color: var(--text-secondary);">Block ${r.block} • ${r.occupants?.length || 0}/${r.capacity} Occupied</div>
                                </div>
                            </a>
                        `;
          });
        }

        if (filteredStudents.length > 0) {
          html += `<div style="padding: 0.5rem 1.25rem; font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; background: #f8fafc; border-bottom: 1px solid var(--border-color);">Students</div>`;
          filteredStudents.forEach(s => {
            html += `
                            <a href="#/search?q=${s.id}" class="search-result-item" onclick="document.getElementById('global-search-modal').style.display='none'">
                                <div style="width: 32px; height: 32px; border-radius: 50%; background: #f0fdf4; color: #15803d; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem;">${s.name.charAt(0)}</div>
                                <div>
                                    <div style="font-weight: 600;">${s.name}</div>
                                    <div style="font-size: 0.8rem; color: var(--text-secondary);">${s.id} • ${s.department || 'No Dept'}</div>
                                </div>
                            </a>
                        `;
          });
        }

        if (!html) {
          html = '<div style="padding: 2rem; text-align: center; color: var(--text-secondary);">No results found.</div>';
        }

        resultsContainer.innerHTML = html;
      } catch (e) {
        resultsContainer.innerHTML = '<div style="padding: 2rem; text-align: center; color: red;">Search failed.</div>';
      }
    }, 300);
  });
};
