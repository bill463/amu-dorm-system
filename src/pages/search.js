import { getAllStudents } from '../utils/data.js';

export const render = `
<div class="container" style="max-width: 800px; margin: 0 auto;">
    <div style="margin-bottom: 2rem; text-align: center;">
        <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">Find Students</h1>
        <p style="color: var(--text-secondary);">Search for students by name or ID</p>
    </div>

    <div class="card" style="margin-bottom: 2rem;">
        <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
            <input type="text" id="search-input" placeholder="Enter name or ID..." 
                style="flex: 1; padding: 1rem; border: 1px solid var(--border-color); border-radius: var(--border-radius); font-size: 1.1rem;">
        </div>
        <div id="search-stats" style="color: var(--text-secondary); font-size: 0.9rem;"></div>
    </div>

    <div id="search-results" style="display: grid; gap: 1rem;">
        <!-- Results will appear here -->
        <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
            Enter a search term to begin
        </div>
    </div>
</div>
`;

export const init = async () => {
    const input = document.getElementById('search-input');
    const resultsContainer = document.getElementById('search-results');
    const statsContainer = document.getElementById('search-stats');

    let allStudents = [];
    try {
        allStudents = await getAllStudents();
    } catch (e) {
        console.error(e);
        if (resultsContainer) resultsContainer.innerHTML = '<p style="padding: 2rem; text-align: center; color: var(--danger-color);">Failed to load student directory.</p>';
    }

    const doSearch = (query) => {
        if (!query.trim()) {
            resultsContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                    Enter a search term to begin
                </div>
            `;
            statsContainer.textContent = '';
            return;
        }

        const lowerQuery = query.toLowerCase();
        const matches = allStudents.filter(s =>
            s.name.toLowerCase().includes(lowerQuery) ||
            s.id.toLowerCase().includes(lowerQuery)
        );

        statsContainer.textContent = `Found ${matches.length} matches`;

        if (matches.length === 0) {
            resultsContainer.innerHTML = `
                <div class="card" style="text-align: center; padding: 2rem;">
                    <p style="color: var(--text-secondary);">No students found matching "${query}"</p>
                </div>
            `;
        } else {
            resultsContainer.innerHTML = matches.map(student => `
                <a href="#/profile?id=${student.id}" class="card" style="
                    display: flex; align-items: center; gap: 1.5rem; 
                    text-decoration: none; color: inherit;
                    transition: transform 0.2s, box-shadow 0.2s;
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='var(--shadow-md)'"
                  onmouseout="this.style.transform='none'; this.style.boxShadow='var(--shadow-sm)'">
                    
                    <div style="
                        width: 60px; height: 60px; 
                        border-radius: 50%; 
                        background-color: var(--surface-hover);
                        background-image: ${student.profilePicture ? `url(${student.profilePicture})` : 'none'};
                        background-size: cover;
                        background-position: center;
                        display: flex; align-items: center; justify-content: center;
                        font-size: 1.5rem; color: var(--primary-color);
                        flex-shrink: 0;
                    ">
                        ${student.profilePicture ? '' : student.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div style="flex: 1;">
                        <h3 style="margin: 0; color: var(--primary-color);">${student.name}</h3>
                        <p style="margin: 0.25rem 0 0; color: var(--text-secondary); font-size: 0.9rem;">
                            ID: ${student.id} • ${student.department || 'No Dept'}
                        </p>
                    </div>
                    
                    <div style="color: var(--text-secondary);">
                        ➔
                    </div>
                </a>
            `).join('');
        }
    };

    if (input) {
        input.addEventListener('input', (e) => {
            doSearch(e.target.value);
        });
    }
};
