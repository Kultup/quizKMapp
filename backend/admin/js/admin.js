// Quiz App Admin Panel JavaScript
class QuizAdmin {
    constructor() {
        this.apiBaseUrl = '/api';
        this.authToken = localStorage.getItem('adminToken');
        this.currentPage = 'dashboard';
        this.currentUser = null;
        this.charts = {}; // Store chart instances for proper cleanup
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuth();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Sidebar toggle
        document.getElementById('sidebar-toggle').addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Menu navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                this.navigateToPage(page);
            });
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModal();
            });
        });

        // Question form
        document.getElementById('question-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleQuestionSubmit();
        });

        // Category form
        document.getElementById('category-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCategorySubmit();
        });

        // City form
        document.getElementById('city-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCitySubmit();
        });

        // Institution form
        document.getElementById('institution-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleInstitutionSubmit(e);
        });

        // Position form
        document.getElementById('position-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePositionSubmit();
        });

        // Add question button
        document.getElementById('add-question-btn').addEventListener('click', () => {
            this.openQuestionModal();
        });

        // Add category button
        document.getElementById('add-category-btn').addEventListener('click', () => {
            this.openCategoryModal();
        });

        // Export buttons
        document.getElementById('export-users-btn').addEventListener('click', () => {
            this.exportUsers();
        });

        document.getElementById('export-quiz-btn').addEventListener('click', () => {
            this.exportQuiz();
        });

        // Generate quiz button
        document.getElementById('generate-quiz-btn').addEventListener('click', () => {
            this.generateQuiz();
        });

        // Save settings button
        document.getElementById('save-settings-btn').addEventListener('click', () => {
            this.saveSettings();
        });

        // Search functionality
        document.getElementById('questions-search').addEventListener('input', (e) => {
            this.searchQuestions(e.target.value);
        });

        document.getElementById('users-search').addEventListener('input', (e) => {
            this.searchUsers(e.target.value);
        });

        // Cities management
        document.getElementById('add-city-btn').addEventListener('click', () => {
            this.openCityModal();
        });

        // Institutions management
        document.getElementById('add-institution-btn').addEventListener('click', () => {
            this.openInstitutionModal();
        });

        // Positions management
        document.getElementById('add-position-btn').addEventListener('click', () => {
            this.openPositionModal();
        });

        // Player Stats management
        document.getElementById('refresh-stats-btn').addEventListener('click', () => {
            this.loadPlayerStats();
        });

        document.getElementById('stats-period').addEventListener('change', () => {
            this.loadPlayerStats();
        });

        document.getElementById('stats-category').addEventListener('change', () => {
            this.loadPlayerStats();
        });

        document.getElementById('player-search').addEventListener('input', (e) => {
            this.searchPlayers(e.target.value);
        });

        document.getElementById('prev-stats-page').addEventListener('click', () => {
            this.previousStatsPage();
        });

        document.getElementById('next-stats-page').addEventListener('click', () => {
            this.nextStatsPage();
        });
    }

    async checkAuth() {
        if (!this.authToken) {
            this.showLoginModal();
            return;
        }

        try {
            const response = await this.apiCall('/auth/profile', 'GET');
            this.currentUser = response.user;
            this.showAdminPanel();
        } catch (error) {
            console.error('Auth check failed:', error);
            this.showLoginModal();
        }
    }

    async handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('login-error');

        try {
            const response = await this.apiCall('/auth/login', 'POST', {
                email,
                password
            });

            this.authToken = response.token;
            this.currentUser = response.user;
            localStorage.setItem('adminToken', this.authToken);
            
            this.closeModal();
            this.showAdminPanel();
            this.showToast('Успішний вхід!', 'success');
        } catch (error) {
            errorDiv.textContent = error.message || 'Помилка входу';
            this.showToast('Помилка входу', 'error');
        }
    }

    handleLogout() {
        this.authToken = null;
        this.currentUser = null;
        localStorage.removeItem('adminToken');
        this.showLoginModal();
        this.showToast('Ви вийшли з системи', 'success');
    }

    showLoginModal() {
        document.getElementById('login-modal').classList.add('show');
        document.getElementById('admin-panel').style.display = 'none';
        document.getElementById('loading-screen').style.display = 'none';
    }

    showAdminPanel() {
        console.log('Showing admin panel...');
        document.getElementById('login-modal').classList.remove('show');
        document.getElementById('admin-panel').style.display = 'flex';
        document.getElementById('user-name').textContent = 
            `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        document.getElementById('loading-screen').style.display = 'none';
        
        // Initialize dashboard as the default active page
        console.log('Initializing dashboard as default page...');
        this.navigateToPage('dashboard');
        console.log('Admin panel shown successfully');
    }

    navigateToPage(page) {
        console.log(`Navigating to page: ${page}`);
        
        // Update active menu item
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.style.display = 'none';
        });

        // Show selected page
        document.getElementById(`${page}-page`).style.display = 'block';
        document.getElementById('page-title').textContent = this.getPageTitle(page);

        this.currentPage = page;
        console.log(`Page ${page} is now active`);

        // Load page data
        switch (page) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'questions':
                this.loadQuestions();
                break;
            case 'categories':
                this.loadCategories();
                break;
            case 'users':
                this.loadUsers();
                break;
            case 'player-stats':
                this.loadPlayerStats();
                break;
            case 'cities':
                this.loadCities();
                break;
            case 'institutions':
                this.loadInstitutions();
                break;
            case 'positions':
                this.loadPositions();
                break;
            case 'quizzes':
                this.loadQuizzes();
                break;
            case 'reports':
                this.loadReports();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    getPageTitle(page) {
        const titles = {
            dashboard: 'Дашборд',
            questions: 'Управління питаннями',
            categories: 'Управління категоріями',
            users: 'Управління користувачами',
            'player-stats': 'Статистика гравців',
            cities: 'Управління містами',
            institutions: 'Управління закладами',
            positions: 'Управління посадами',
            quizzes: 'Управління квізами',
            reports: 'Звіти',
            settings: 'Налаштування'
        };
        return titles[page] || 'Сторінка';
    }

    async loadDashboard() {
        try {
            console.log('Loading dashboard...');
            const stats = await this.apiCall('/admin/dashboard', 'GET');
            console.log('Dashboard stats received:', stats);
            
            // Update stats cards
            console.log('Updating stats cards...');
            const totalUsersEl = document.getElementById('total-users');
            const totalQuestionsEl = document.getElementById('total-questions');
            const totalQuizzesEl = document.getElementById('total-quizzes');
            const avgScoreEl = document.getElementById('avg-score');
            
            if (!totalUsersEl || !totalQuestionsEl || !totalQuizzesEl || !avgScoreEl) {
                throw new Error('Required dashboard elements not found');
            }
            
            totalUsersEl.textContent = stats.users.total_users || 0;
            totalQuestionsEl.textContent = stats.questions.total_questions || 0;
            totalQuizzesEl.textContent = stats.quizzes.total_quizzes || 0;
            avgScoreEl.textContent = Math.round(stats.attempts.avg_score || 0) + '%';
            
            console.log('Stats cards updated successfully');

            // Load charts
            console.log('Loading charts...');
            this.loadCharts(stats);
            console.log('Charts loaded successfully');
            
            // Load recent activity
            console.log('Loading recent activity...');
            this.loadRecentActivity();
            console.log('Dashboard loaded successfully');
        } catch (error) {
            console.error('Error loading dashboard:', error);
            console.error('Error stack:', error.stack);
            this.showToast('Помилка завантаження дашборду: ' + error.message, 'error');
        }
    }

    loadCharts(stats) {
        try {
            console.log('Creating users chart...');
            
            // Destroy existing chart if it exists
            if (this.charts.usersChart) {
                console.log('Destroying existing users chart...');
                this.charts.usersChart.destroy();
                this.charts.usersChart = null;
            }
            
            const usersChartEl = document.getElementById('users-chart');
            if (!usersChartEl) {
                throw new Error('Users chart element not found');
            }
            
            if (typeof Chart === 'undefined') {
                throw new Error('Chart.js library not loaded');
            }
            
            const usersCtx = usersChartEl.getContext('2d');
            this.charts.usersChart = new Chart(usersCtx, {
                type: 'line',
                data: {
                    labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'],
                    datasets: [{
                        label: 'Активні користувачі',
                        data: [stats.users.active_users || 5, stats.users.new_users_30_days || 3, 4, 6, 3, 7, stats.users.total_users || 5],
                        borderColor: '#007bff',
                        backgroundColor: 'rgba(0, 123, 255, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
            console.log('Users chart created successfully');
        } catch (error) {
            console.error('Error creating charts:', error);
            throw error;
        }
    }

    async loadQuestions() {
        try {
            const response = await this.apiCall('/admin/questions', 'GET');
            this.renderQuestionsTable(response.questions);
        } catch (error) {
            console.error('Error loading questions:', error);
            this.showToast('Помилка завантаження питань', 'error');
        }
    }

    renderQuestionsTable(questions) {
        const tbody = document.querySelector('#questions-table tbody');
        tbody.innerHTML = questions.map(question => `
            <tr>
                <td>${question.id || 'N/A'}</td>
                <td>${question.question_text ? question.question_text.substring(0, 50) + '...' : 'Немає тексту'}</td>
                <td>${question.category_name || 'Немає категорії'}</td>
                <td>${question.difficulty_level || 'Немає рівня'}</td>
                <td>
                    <span class="status-badge ${question.is_active ? 'status-active' : 'status-inactive'}">
                        ${question.is_active ? 'Активне' : 'Неактивне'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="admin.editQuestion(${question.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="admin.deleteQuestion(${question.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async loadCategories() {
        try {
            const response = await this.apiCall('/admin/categories', 'GET');
            this.renderCategoriesGrid(response.categories);
        } catch (error) {
            console.error('Error loading categories:', error);
            this.showToast('Помилка завантаження категорій', 'error');
        }
    }

    renderCategoriesGrid(categories) {
        const grid = document.querySelector('.categories-grid');
        grid.innerHTML = categories.map(category => `
            <div class="category-card">
                <h3>${category.name}</h3>
                <p>${category.description || 'Немає опису'}</p>
                <div class="category-stats">
                    <span>${category.question_count || 0} питань</span>
                    <span class="status-badge ${category.is_active ? 'status-active' : 'status-inactive'}">
                        ${category.is_active ? 'Активна' : 'Неактивна'}
                    </span>
                </div>
                <div class="action-buttons">
                    <button class="btn btn-primary" onclick="admin.editCategory(${category.id})">
                        <i class="fas fa-edit"></i> Редагувати
                    </button>
                    <button class="btn btn-danger" onclick="admin.deleteCategory(${category.id})">
                        <i class="fas fa-trash"></i> Видалити
                    </button>
                </div>
            </div>
        `).join('');
    }

    async loadUsers() {
        try {
            const response = await this.apiCall('/admin/users', 'GET');
            this.renderUsersTable(response.users);
        } catch (error) {
            console.error('Error loading users:', error);
            this.showToast('Помилка завантаження користувачів', 'error');
        }
    }

    renderUsersTable(users) {
        const tbody = document.querySelector('#users-table tbody');
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.first_name} ${user.last_name}</td>
                <td>${user.city}</td>
                <td>${user.position}</td>
                <td>${user.total_score || 0}</td>
                <td>${user.tests_completed || 0}</td>
                <td>
                    <span class="status-badge ${user.is_active ? 'status-active' : 'status-inactive'}">
                        ${user.is_active ? 'Активний' : 'Неактивний'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="admin.viewUserStats(${user.id})">
                            <i class="fas fa-chart-line"></i>
                        </button>
                        <button class="action-btn delete" onclick="admin.deactivateUser(${user.id})">
                            <i class="fas fa-user-times"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async loadQuizzes() {
        try {
            const response = await this.apiCall('/admin/quizzes', 'GET');
            this.renderQuizzesList(response.quizzes);
        } catch (error) {
            console.error('Error loading quizzes:', error);
            this.showToast('Помилка завантаження квізів', 'error');
        }
    }

    renderQuizzesList(quizzes) {
        const list = document.querySelector('.quizzes-list');
        list.innerHTML = quizzes.map(quiz => `
            <div class="quiz-card">
                <h3>Квіз від ${new Date(quiz.quiz_date).toLocaleDateString('uk-UA')}</h3>
                <p>Питань: ${quiz.questions ? Object.keys(quiz.questions).length : 0}</p>
                <p>Статус: ${quiz.is_sent ? 'Відправлено' : 'Не відправлено'}</p>
            </div>
        `).join('');
    }

    async loadCities() {
        try {
            const response = await this.apiCall('/cities', 'GET');
            this.renderCitiesTable(response.data);
        } catch (error) {
            console.error('Error loading cities:', error);
            this.showToast('Помилка завантаження міст', 'error');
        }
    }

    renderCitiesTable(cities) {
        const tbody = document.querySelector('#cities-table tbody');
        tbody.innerHTML = cities.map(city => `
            <tr>
                <td>${city.name}</td>
                <td>${city.region || '-'}</td>
                <td>${city.country || '-'}</td>
                <td>
                    <span class="status ${city.isActive ? 'active' : 'inactive'}">
                        ${city.isActive ? 'Активне' : 'Неактивне'}
                    </span>
                </td>
                <td>${new Date(city.createdAt).toLocaleDateString('uk-UA')}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="admin.editCity('${city._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="admin.deleteCity('${city._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async loadInstitutions() {
        try {
            const response = await this.apiCall('/institutions', 'GET');
            this.renderInstitutionsTable(response.data);
        } catch (error) {
            console.error('Error loading institutions:', error);
            this.showToast('Помилка завантаження закладів', 'error');
        }
    }

    renderInstitutionsTable(institutions) {
        const tbody = document.querySelector('#institutions-table tbody');
        tbody.innerHTML = institutions.map(institution => `
            <tr>
                <td>${institution.name}</td>
                <td>${institution.city?.name || '-'}</td>
                <td>
                    <span class="status ${institution.isActive ? 'active' : 'inactive'}">
                        ${institution.isActive ? 'Активний' : 'Неактивний'}
                    </span>
                </td>
                <td>${new Date(institution.createdAt).toLocaleDateString('uk-UA')}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="admin.editInstitution('${institution._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="admin.deleteInstitution('${institution._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async loadPositions() {
        try {
            const response = await this.apiCall('/positions', 'GET');
            this.renderPositionsTable(response.positions);
        } catch (error) {
            console.error('Error loading positions:', error);
            this.showToast('Помилка завантаження посад', 'error');
        }
    }

    renderPositionsTable(positions) {
        const tbody = document.querySelector('#positions-table tbody');
        tbody.innerHTML = positions.map(position => `
            <tr>
                <td>${position.name}</td>
                <td>${position.category}</td>
                <td>${position.description || '-'}</td>
                <td>
                    <span class="status ${position.isActive ? 'active' : 'inactive'}">
                        ${position.isActive ? 'Активна' : 'Неактивна'}
                    </span>
                </td>
                <td>${new Date(position.createdAt).toLocaleDateString('uk-UA')}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="admin.editPosition('${position._id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="admin.deletePosition('${position._id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    loadReports() {
        // Reports page is already set up with buttons
        console.log('Reports page loaded');
    }

    loadSettings() {
        // Load current settings
        document.getElementById('quiz-send-time').value = '12:00';
        document.getElementById('quiz-deadline-time').value = '00:00';
        document.getElementById('quiz-questions-count').value = '5';
    }

    openQuestionModal(questionId = null) {
        const modal = document.getElementById('question-modal');
        const title = document.getElementById('question-modal-title');
        
        if (questionId) {
            title.textContent = 'Редагувати питання';
            this.loadQuestionData(questionId);
        } else {
            title.textContent = 'Додати питання';
            this.clearQuestionForm();
        }
        
        modal.classList.add('show');
    }

    openCategoryModal(categoryId = null) {
        const modal = document.getElementById('category-modal');
        const title = document.getElementById('category-modal-title');
        
        if (categoryId) {
            title.textContent = 'Редагувати категорію';
            this.loadCategoryData(categoryId);
        } else {
            title.textContent = 'Додати категорію';
            this.clearCategoryForm();
        }
        
        modal.classList.add('show');
    }

    openCityModal(cityId = null) {
        const modal = document.getElementById('city-modal');
        const title = document.getElementById('city-modal-title');
        
        if (cityId) {
            title.textContent = 'Редагувати місто';
            document.getElementById('city-id').value = cityId;
            // Load city data for editing
            this.loadCityData(cityId);
        } else {
            title.textContent = 'Додати місто';
            this.clearCityForm();
        }
        
        modal.classList.add('show');
    }

    openInstitutionModal(institutionId = null) {
        const modal = document.getElementById('institution-modal');
        const title = document.getElementById('institution-modal-title');
        
        if (institutionId) {
            title.textContent = 'Редагувати заклад';
            document.getElementById('institution-id').value = institutionId;
            // Load institution data for editing
            this.loadInstitutionData(institutionId);
        } else {
            title.textContent = 'Додати заклад';
            this.clearInstitutionForm();
        }
        
        // Load cities for the dropdown
        this.loadCitiesForDropdown();
        modal.classList.add('show');
    }

    openPositionModal(positionId = null) {
        const modal = document.getElementById('position-modal');
        const title = document.getElementById('position-modal-title');
        
        if (positionId) {
            title.textContent = 'Редагувати посаду';
            document.getElementById('position-id').value = positionId;
            // Load position data for editing
            this.loadPositionData(positionId);
        } else {
            title.textContent = 'Додати посаду';
            this.clearPositionForm();
        }
        
        modal.classList.add('show');
    }

    closeModal() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }

    async handleQuestionSubmit() {
        const formData = {
            categoryId: parseInt(document.getElementById('question-category').value),
            questionText: document.getElementById('question-text').value,
            optionA: document.getElementById('option-a').value,
            optionB: document.getElementById('option-b').value,
            optionC: document.getElementById('option-c').value,
            optionD: document.getElementById('option-d').value,
            correctAnswer: document.getElementById('correct-answer').value,
            explanation: document.getElementById('explanation').value,
            difficultyLevel: parseInt(document.getElementById('difficulty-level').value)
        };

        const questionId = document.getElementById('question-id').value;

        try {
            if (questionId) {
                await this.apiCall(`/admin/questions/${questionId}`, 'PUT', formData);
                this.showToast('Питання оновлено!', 'success');
            } else {
                await this.apiCall('/admin/questions', 'POST', formData);
                this.showToast('Питання додано!', 'success');
            }
            
            this.closeModal();
            this.loadQuestions();
        } catch (error) {
            console.error('Error saving question:', error);
            this.showToast('Помилка збереження питання', 'error');
        }
    }

    async handleCategorySubmit() {
        const formData = {
            name: document.getElementById('category-name').value,
            description: document.getElementById('category-description').value
        };

        const categoryId = document.getElementById('category-id').value;

        try {
            if (categoryId) {
                await this.apiCall(`/admin/categories/${categoryId}`, 'PUT', formData);
                this.showToast('Категорію оновлено!', 'success');
            } else {
                await this.apiCall('/admin/categories', 'POST', formData);
                this.showToast('Категорію додано!', 'success');
            }
            
            this.closeModal();
            this.loadCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            this.showToast('Помилка збереження категорії', 'error');
        }
    }

    async handleCitySubmit() {
        const formData = {
            name: document.getElementById('city-name').value,
            region: document.getElementById('city-region').value,
            country: document.getElementById('city-country').value
        };

        const cityId = document.getElementById('city-id').value;

        try {
            if (cityId) {
                await this.apiCall(`/cities/${cityId}`, 'PUT', formData);
                this.showToast('Місто оновлено!', 'success');
            } else {
                await this.apiCall('/cities', 'POST', formData);
                this.showToast('Місто додано!', 'success');
            }
            
            this.closeModal();
            this.loadCities();
        } catch (error) {
            console.error('Error saving city:', error);
            this.showToast('Помилка збереження міста', 'error');
        }
    }

    async handleInstitutionSubmit(event) {
        event.preventDefault();
        try {
            const institutionId = document.getElementById('institution-id').value;
            const name = document.getElementById('institution-name').value.trim();
            const city = document.getElementById('institution-city').value;
            const type = (document.getElementById('institution-type')?.value || 'школа');
        
            const formData = { name, city, type };
        
            if (!name || !city) {
                alert('Будь ласка, заповніть назву та місто.');
                return;
            }
        
            if (institutionId) {
                await this.apiCall(`/institutions/${institutionId}`, 'PUT', formData);
            } else {
                await this.apiCall('/institutions', 'POST', formData);
            }
        
            this.closeModal();
            await this.loadInstitutions();
        } catch (error) {
            console.error('Помилка збереження закладу:', error);
            alert('Помилка збереження закладу');
        }
    }

    async handlePositionSubmit() {
        const formData = {
            name: document.getElementById('position-name').value,
            category: document.getElementById('position-category').value,
            // level removed
            description: document.getElementById('position-description').value
        };
    
        const positionId = document.getElementById('position-id').value;
    
        try {
            if (positionId) {
                await this.apiCall(`/positions/${positionId}`, 'PUT', formData);
                this.showToast('Посаду оновлено!', 'success');
            } else {
                await this.apiCall('/positions', 'POST', formData);
                this.showToast('Посаду додано!', 'success');
            }
            
            this.closeModal();
            this.loadPositions();
        } catch (error) {
            console.error('Error saving position:', error);
            this.showToast('Помилка збереження посади', 'error');
        }
    }

    async deleteQuestion(id) {
        if (!confirm('Ви впевнені, що хочете видалити це питання?')) {
            return;
        }

        try {
            await this.apiCall(`/admin/questions/${id}`, 'DELETE');
            this.showToast('Питання видалено!', 'success');
            this.loadQuestions();
        } catch (error) {
            console.error('Error deleting question:', error);
            this.showToast('Помилка видалення питання', 'error');
        }
    }

    async deleteCategory(id) {
        if (!confirm('Ви впевнені, що хочете видалити цю категорію?')) {
            return;
        }

        try {
            await this.apiCall(`/admin/categories/${id}`, 'DELETE');
            this.showToast('Категорію видалено!', 'success');
            this.loadCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            this.showToast('Помилка видалення категорії', 'error');
        }
    }

    async deactivateUser(id) {
        if (!confirm('Ви впевнені, що хочете деактивувати цього користувача?')) {
            return;
        }

        try {
            await this.apiCall(`/admin/users/${id}/deactivate`, 'PUT');
            this.showToast('Користувача деактивовано!', 'success');
            this.loadUsers();
        } catch (error) {
            console.error('Error deactivating user:', error);
            this.showToast('Помилка деактивації користувача', 'error');
        }
    }

    async exportUsers() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/admin/reports/users`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'users_report.xlsx';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                this.showToast('Звіт завантажено!', 'success');
            } else {
                throw new Error('Помилка завантаження звіту');
            }
        } catch (error) {
            console.error('Error exporting users:', error);
            this.showToast('Помилка експорту користувачів', 'error');
        }
    }

    async exportQuiz() {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        if (!startDate || !endDate) {
            this.showToast('Оберіть діапазон дат', 'error');
            return;
        }

        try {
            const response = await fetch(`${this.apiBaseUrl}/admin/reports/quiz?startDate=${startDate}&endDate=${endDate}`, {
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'quiz_report.xlsx';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                this.showToast('Звіт завантажено!', 'success');
            } else {
                throw new Error('Помилка завантаження звіту');
            }
        } catch (error) {
            console.error('Error exporting quiz:', error);
            this.showToast('Помилка експорту квізів', 'error');
        }
    }

    async generateQuiz() {
        try {
            await this.apiCall('/admin/generate-quiz', 'POST');
            this.showToast('Квіз згенеровано!', 'success');
            this.loadQuizzes();
        } catch (error) {
            console.error('Error generating quiz:', error);
            this.showToast('Помилка генерації квізу', 'error');
        }
    }

    async saveSettings() {
        const settings = {
            quizSendTime: document.getElementById('quiz-send-time').value,
            quizDeadlineTime: document.getElementById('quiz-deadline-time').value,
            quizQuestionsCount: parseInt(document.getElementById('quiz-questions-count').value)
        };

        try {
            await this.apiCall('/admin/settings', 'PUT', settings);
            this.showToast('Налаштування збережено!', 'success');
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showToast('Помилка збереження налаштувань', 'error');
        }
    }

    searchQuestions(query) {
        // Implement search functionality
        console.log('Searching questions:', query);
    }

    searchUsers(query) {
        // Implement search functionality
        console.log('Searching users:', query);
    }

    toggleSidebar() {
        document.querySelector('.sidebar').classList.toggle('open');
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const icon = toast.querySelector('.toast-icon');
        const messageEl = toast.querySelector('.toast-message');

        toast.className = `toast ${type}`;
        icon.className = `toast-icon fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`;
        messageEl.textContent = message;

        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    async apiCall(endpoint, method = 'GET', data = null) {
        const url = `${this.apiBaseUrl}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.authToken}`
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        
        if (!response.ok) {
            let errorPayload = null;
            try {
                errorPayload = await response.json();
            } catch (_) {
                throw new Error('API Error');
            }
            const msg = errorPayload.message 
                || errorPayload.error 
                || (Array.isArray(errorPayload.errors) ? (errorPayload.errors[0]?.msg || errorPayload.errors[0]?.message) : null)
                || `HTTP ${response.status}`;
            throw new Error(msg);
        }

        return await response.json();
    }

    // Helper methods for form handling
    clearQuestionForm() {
        document.getElementById('question-form').reset();
        document.getElementById('question-id').value = '';
    }

    clearCategoryForm() {
        document.getElementById('category-form').reset();
        document.getElementById('category-id').value = '';
    }

    clearCityForm() {
        document.getElementById('city-form').reset();
        document.getElementById('city-id').value = '';
        document.getElementById('city-country').value = 'Україна';
    }

    clearInstitutionForm() {
        document.getElementById('institution-form').reset();
        document.getElementById('institution-id').value = '';
    }

    clearPositionForm() {
        document.getElementById('position-form').reset();
        document.getElementById('position-id').value = '';
    }

    async loadQuestionData(id) {
        try {
            const question = await this.apiCall(`/admin/questions/${id}`, 'GET');
            document.getElementById('question-id').value = question.id;
            document.getElementById('question-category').value = question.category_id;
            document.getElementById('question-text').value = question.question_text;
            document.getElementById('option-a').value = question.option_a;
            document.getElementById('option-b').value = question.option_b;
            document.getElementById('option-c').value = question.option_c;
            document.getElementById('option-d').value = question.option_d;
            document.getElementById('correct-answer').value = question.correct_answer;
            document.getElementById('explanation').value = question.explanation || '';
            document.getElementById('difficulty-level').value = question.difficulty_level;
        } catch (error) {
            console.error('Error loading question data:', error);
            this.showToast('Помилка завантаження даних питання', 'error');
        }
    }

    async loadCityData(id) {
        try {
            const cityResp = await this.apiCall(`/cities/${id}`, 'GET');
            const city = cityResp?.data || cityResp;
            document.getElementById('city-id').value = city._id;
            document.getElementById('city-name').value = city.name;
            document.getElementById('city-region').value = city.region || '';
            document.getElementById('city-country').value = city.country || 'Україна';
        } catch (error) {
            console.error('Error loading city data:', error);
            this.showToast('Помилка завантаження даних міста', 'error');
        }
    }

    async loadInstitutionData(id) {
        try {
            const instResp = await this.apiCall(`/institutions/${id}`, 'GET');
            const institution = instResp?.data || instResp;
            document.getElementById('institution-id').value = institution._id;
            document.getElementById('institution-name').value = institution.name;
            // If city is populated object, use its _id; otherwise use raw value
            const cityId = typeof institution.city === 'object' && institution.city?._id 
                ? institution.city._id 
                : institution.city;
            document.getElementById('institution-city').value = cityId || '';
        } catch (error) {
            console.error('Error loading institution data:', error);
            this.showToast('Помилка завантаження даних закладу', 'error');
        }
    }

    async loadCitiesForDropdown() {
        try {
            const resp = await this.apiCall('/cities', 'GET');
            const cities = resp?.data || resp;
            const citySelect = document.getElementById('institution-city');
            citySelect.innerHTML = '<option value="">Оберіть місто</option>';
            (cities || []).forEach(city => {
                const option = document.createElement('option');
                option.value = city._id;
                option.textContent = city.name;
                citySelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading cities for dropdown:', error);
        }
    }

    async loadCategoryData(id) {
        try {
            const category = await this.apiCall(`/admin/categories/${id}`, 'GET');
            document.getElementById('category-id').value = category.id;
            document.getElementById('category-name').value = category.name;
            document.getElementById('category-description').value = category.description || '';
        } catch (error) {
            console.error('Error loading category data:', error);
            this.showToast('Помилка завантаження даних категорії', 'error');
        }
    }

    editQuestion(id) {
        this.openQuestionModal(id);
    }

    editCategory(id) {
        this.openCategoryModal(id);
    }

    async loadRecentActivity() {
        try {
            // For now, we'll create some mock data since there's no specific endpoint
            // In a real implementation, you would call an API endpoint like /admin/recent-activity
            const mockActivity = [
                {
                    id: 1,
                    type: 'user_registration',
                    message: 'Новий користувач зареєструвався',
                    user: 'user@example.com',
                    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
                },
                {
                    id: 2,
                    type: 'quiz_completed',
                    message: 'Користувач завершив квіз',
                    user: 'test@example.com',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
                },
                {
                    id: 3,
                    type: 'question_added',
                    message: 'Додано нове питання',
                    user: 'admin@quizapp.com',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
                }
            ];

            const activityList = document.getElementById('recent-activity-list');
            if (!activityList) {
                console.warn('Recent activity list element not found');
                return;
            }

            activityList.innerHTML = '';

            if (mockActivity.length === 0) {
                activityList.innerHTML = '<p class="no-activity">Немає останньої активності</p>';
                return;
            }

            mockActivity.forEach(activity => {
                const activityItem = document.createElement('div');
                activityItem.className = 'activity-item';
                
                const timeAgo = this.getTimeAgo(new Date(activity.timestamp));
                
                activityItem.innerHTML = `
                    <div class="activity-icon">
                        <i class="fas ${this.getActivityIcon(activity.type)}"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-message">${activity.message}</div>
                        <div class="activity-meta">
                            <span class="activity-user">${activity.user}</span>
                            <span class="activity-time">${timeAgo}</span>
                        </div>
                    </div>
                `;
                
                activityList.appendChild(activityItem);
            });
        } catch (error) {
            console.error('Error loading recent activity:', error);
            const activityList = document.getElementById('recent-activity-list');
            if (activityList) {
                activityList.innerHTML = '<p class="error">Помилка завантаження активності</p>';
            }
        }
    }

    getActivityIcon(type) {
        const icons = {
            'user_registration': 'fa-user-plus',
            'quiz_completed': 'fa-check-circle',
            'question_added': 'fa-plus-circle',
            'user_login': 'fa-sign-in-alt',
            'quiz_created': 'fa-clipboard-list',
            'default': 'fa-info-circle'
        };
        return icons[type] || icons.default;
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
            return 'щойно';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} хв тому`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} год тому`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} дн тому`;
        }
    }

    viewUserStats(id) {
        // Implement user stats view
        console.log('Viewing user stats for:', id);
    }

    // Player Stats Methods
    async loadPlayerStats() {
        try {
            console.log('Loading player stats...');
            
            const period = document.getElementById('stats-period').value;
            const category = document.getElementById('stats-category').value;
            
            // Load categories for filter
            await this.loadCategoriesForFilter();
            
            // Load player statistics
            const params = new URLSearchParams({
                period,
                category,
                page: this.currentStatsPage || 1,
                limit: 20
            });
            
            const response = await this.apiCall(`/admin/player-stats?${params}`, 'GET');
            
            // Update summary cards
            this.updateStatsSummary(response.summary);
            
            // Update player stats table
            this.updatePlayerStatsTable(response.players);
            
            // Update pagination
            this.updateStatsPagination(response.pagination);
            
            // Load charts
            await this.loadPlayerStatsCharts();
            
            console.log('Player stats loaded successfully');
        } catch (error) {
            console.error('Error loading player stats:', error);
            this.showToast('Помилка завантаження статистики', 'error');
        }
    }

    async loadCategoriesForFilter() {
        try {
            const response = await this.apiCall('/admin/categories', 'GET');
            const categorySelect = document.getElementById('stats-category');
            
            // Clear existing options except "all"
            categorySelect.innerHTML = '<option value="all">Всі категорії</option>';
            
            response.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading categories for filter:', error);
        }
    }

    updateStatsSummary(summary) {
        document.getElementById('total-active-players').textContent = summary.activePlayers;
        document.getElementById('avg-score-all').textContent = `${summary.avgScoreAll}%`;
        document.getElementById('total-quizzes-completed').textContent = summary.totalQuizzesCompleted;
        document.getElementById('avg-streak').textContent = summary.avgStreak;
    }

    updatePlayerStatsTable(players) {
        const tbody = document.querySelector('#player-stats-table tbody');
        tbody.innerHTML = '';

        if (players.length === 0) {
            tbody.innerHTML = '<tr><td colspan="11" class="text-center">Немає даних</td></tr>';
            return;
        }

        players.forEach((player, index) => {
            const row = document.createElement('tr');
            
            const rankClass = player.rank <= 3 ? `rank-${player.rank}` : 'rank-other';
            
            // Calculate accuracy from average score (assuming average_score is percentage)
            const accuracy = player.average_score ? Math.round(player.average_score) : 0;
            const accuracyClass = accuracy >= 80 ? 'high' : accuracy >= 60 ? 'medium' : 'low';
            
            const lastQuizDate = player.last_quiz_date ? 
                new Date(player.last_quiz_date).toLocaleDateString('uk-UA') : 'Ніколи';

            row.innerHTML = `
                <td>
                    <span class="rank-badge ${rankClass}">${player.rank}</span>
                </td>
                <td>
                    <div class="player-name">${player.full_name || 'Невідомо'}</div>
                    <div class="player-location">${player.city || 'Невідомо'}</div>
                </td>
                <td>${player.city || 'Невідомо'}</td>
                <td>${player.position || 'Невідомо'}</td>
                <td><span class="score-value">${player.total_score || 0}</span></td>
                <td>${player.quizzes_completed || 0}</td>
                <td><span class="score-value">${accuracy}%</span></td>
                <td><span class="accuracy-value ${accuracyClass}">${accuracy}%</span></td>
                <td><span class="streak-value">0</span></td>
                <td><span class="last-quiz-date">${lastQuizDate}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="admin.viewPlayerDetails('${player._id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
    }

    updateStatsPagination(pagination) {
        document.getElementById('stats-page-info').textContent = 
            `Сторінка ${pagination.currentPage} з ${pagination.totalPages}`;
        
        document.getElementById('prev-stats-page').disabled = pagination.currentPage <= 1;
        document.getElementById('next-stats-page').disabled = pagination.currentPage >= pagination.totalPages;
        
        this.currentStatsPage = pagination.currentPage;
        this.totalStatsPages = pagination.totalPages;
    }

    async loadPlayerStatsCharts() {
        try {
            const period = document.getElementById('stats-period').value;
            const category = document.getElementById('stats-category').value;
            
            const params = new URLSearchParams({ period, category });
            const response = await this.apiCall(`/admin/player-stats/charts?${params}`, 'GET');
            
            // Destroy existing charts
            if (this.charts.scoreDistribution) {
                this.charts.scoreDistribution.destroy();
            }
            if (this.charts.categoryActivity) {
                this.charts.categoryActivity.destroy();
            }
            
            // Create score distribution chart
            this.createScoreDistributionChart(response.scoreDistribution);
            
            // Create category activity chart
            this.createCategoryActivityChart(response.categoryActivity);
            
        } catch (error) {
            console.error('Error loading player stats charts:', error);
        }
    }

    createScoreDistributionChart(data) {
        const ctx = document.getElementById('score-distribution-chart').getContext('2d');
        
        this.charts.scoreDistribution = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.map(item => item.range),
                datasets: [{
                    label: 'Кількість тестів',
                    data: data.map(item => item.count),
                    backgroundColor: [
                        '#e74c3c',
                        '#f39c12',
                        '#f1c40f',
                        '#2ecc71',
                        '#27ae60'
                    ],
                    borderColor: [
                        '#c0392b',
                        '#e67e22',
                        '#f39c12',
                        '#27ae60',
                        '#229954'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    createCategoryActivityChart(data) {
        const ctx = document.getElementById('category-activity-chart').getContext('2d');
        
        this.charts.categoryActivity = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.map(item => item.category),
                datasets: [{
                    data: data.map(item => item.quizCount),
                    backgroundColor: [
                        '#3498db',
                        '#e74c3c',
                        '#2ecc71',
                        '#f39c12',
                        '#9b59b6',
                        '#1abc9c',
                        '#34495e'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    searchPlayers(query) {
        const rows = document.querySelectorAll('#player-stats-table tbody tr');
        
        rows.forEach(row => {
            const playerName = row.cells[1].textContent.toLowerCase();
            const city = row.cells[2].textContent.toLowerCase();
            const position = row.cells[3].textContent.toLowerCase();
            
            const searchQuery = query.toLowerCase();
            const matches = playerName.includes(searchQuery) || 
                          city.includes(searchQuery) || 
                          position.includes(searchQuery);
            
            row.style.display = matches ? '' : 'none';
        });
    }

    previousStatsPage() {
        if (this.currentStatsPage > 1) {
            this.currentStatsPage--;
            this.loadPlayerStats();
        }
    }

    nextStatsPage() {
        if (this.currentStatsPage < this.totalStatsPages) {
            this.currentStatsPage++;
            this.loadPlayerStats();
        }
    }

    viewPlayerDetails(playerId) {
        // Implement player details view
        console.log('Viewing player details for:', playerId);
        this.showToast('Функція перегляду деталей гравця в розробці', 'info');
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.admin = new QuizAdmin();
});
