// Updated utils object with fixed apiCall
const utils = {
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    showLoading() {
        document.getElementById('loading-overlay').classList.add('visible');
    },

    hideLoading() {
        document.getElementById('loading-overlay').classList.remove('visible');
    },

    async apiCall(action, data) {
        try {
            const response = await fetch(API_CONFIG.ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, data })
            });
            
            const result = await response.json();
            
            // Optional: Log API calls in development
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.log(`API ${action} Response:`, result);
            }
            
            return result;
        } catch (error) {
            console.error(`API Error (${action}):`, error);
            throw new Error('Failed to communicate with server');
        }
    },

    updateProgress(currentStep, totalSteps) {
        const progress = (currentStep / totalSteps) * 100;
        document.getElementById('progress-bar').style.width = `${progress}%`;
        
        document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
            const circle = indicator.querySelector('div');
            const classList = circle.classList;
            
            if (index + 1 === currentStep) {
                classList.replace('bg-gray-200', 'bg-blue-600');
                classList.replace('text-gray-600', 'text-white');
            } else if (index + 1 < currentStep) {
                classList.replace('bg-gray-200', 'bg-green-500');
                classList.replace('text-gray-600', 'text-white');
            } else {
                classList.replace('bg-blue-600', 'bg-gray-200');
                classList.replace('bg-green-500', 'bg-gray-200');
                classList.replace('text-white', 'text-gray-600');
            }
        });
    },

    showError(message) {
        alert(message); // You can replace this with a custom error UI component
    }
};

// Optional: Add debug mode toggle
const DEBUG_MODE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Example usage in API calls
async function makeApiCall(action, data) {
    try {
        utils.showLoading();
        const result = await utils.apiCall(action, data);
        
        if (DEBUG_MODE) {
            console.log(`${action} result:`, result);
        }
        
        return result;
    } catch (error) {
        utils.showError(error.message);
        throw error;
    } finally {
        utils.hideLoading();
    }
};

// Message Handler
const messageHandler = {
    showSuccessMessage(step) {
        const content = SURVEY_CONFIG.messages.success[step];
        const messageHtml = `
            <div id="success-message" class="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 transform transition-all animate-fade-in">
                    <div class="text-center">
                        <i class="${content.icon} text-6xl text-green-500 mb-4"></i>
                        <h2 class="text-2xl font-bold mb-2">${content.title}</h2>
                        <p class="text-gray-600 mb-6">${content.message}</p>
                        <button onclick="messageHandler.closeMessage()" 
                            class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-300">
                            אישור
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', messageHtml);
    },

    closeMessage() {
        const messageElement = document.getElementById('success-message');
        if (messageElement) {
            messageElement.classList.add('opacity-0');
            setTimeout(() => {
                messageElement.remove();
            }, 300);
        }
    }
};

// Form Validation Handler
const validationHandler = {
    validateEmail(email) {
        if (!email || !utils.isValidEmail(email)) {
            throw new Error(SURVEY_CONFIG.messages.errors.invalidEmail);
        }
    },

    validateManagerEmail(employeeEmail, managerEmail) {
        if (employeeEmail.toLowerCase() === managerEmail.toLowerCase()) {
            throw new Error(SURVEY_CONFIG.messages.errors.sameEmail);
        }
    },

    validatePosition(position) {
        if (!position || !SURVEY_CONFIG.roles[position]) {
            throw new Error(SURVEY_CONFIG.messages.errors.invalidRole);
        }
    },

    validateSurveyAnswers(answers, requiredQuestions) {
        const unanswered = requiredQuestions.filter(q => !answers[q]);
        if (unanswered.length > 0) {
            throw new Error(SURVEY_CONFIG.messages.errors.incompleteForm);
        }
    }
};

// Survey State Management
class SurveyState {
    constructor() {
        this.guid = null;
        this.step = 1;
        this.answers = {};
        this.employeeEmail = '';
        this.managerEmail = '';
        this.position = '';
    }

    updateState(updates) {
        Object.assign(this, updates);
    }

    getAnsweredCount() {
        return Object.keys(this.answers).length;
    }

    isComplete() {
        return this.getAnsweredCount() === this.getTotalQuestions();
    }

    getTotalQuestions() {
        return this.getQuestionsForRole(this.position).length;
    }

    getQuestionsForRole(role) {
        const questions = [];
        Object.values(SURVEY_CONFIG.categories).forEach(category => {
            Object.entries(category.questions).forEach(([id, question]) => {
                if (question.roles.includes(role)) {
                    questions.push({ id, ...question });
                }
            });
        });
        return questions;
    }
}
// Survey Form Controller
class SurveyFormController {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.originalManagerEmail = '';
        this.state = new SurveyState();
        this.initializeEventListeners();
    }

    showStep(step) {
        document.querySelectorAll('.step-content').forEach(content => {
            content.classList.add('hidden');
        });
        document.getElementById(`step-${step}`).classList.remove('hidden');
        this.currentStep = step;
        utils.updateProgress(step, this.totalSteps);
    }

    async handleEmployeeSubmit(event) {
        event.preventDefault();
        utils.showLoading();

        try {
            const email = document.getElementById('employee-email').value.trim();
            validationHandler.validateEmail(email);

            const result = await utils.apiCall('verifyEmployee', { email });

            if (result.success) {
                const { managerName, managerEmail } = result.data;
                
                // Validate manager email is different from employee
                validationHandler.validateManagerEmail(email, managerEmail);

                // Update form and state
                document.getElementById('manager-name').value = managerName;
                document.getElementById('manager-email').value = managerEmail;
                this.originalManagerEmail = managerEmail;
                
                // Update state
                this.state.updateState({
                    employeeEmail: email,
                    managerEmail: managerEmail
                });

                this.showStep(2);
            } else {
                throw new Error(result.error.message || 'Failed to verify employee');
            }
        } catch (error) {
            utils.showError(error.message);
        } finally {
            utils.hideLoading();
        }
    }

    async handleManagerEmailChange(event) {
        const managerEmail = event.target.value.trim();
        const managerNameInput = document.getElementById('manager-name');
        const employeeEmail = this.state.employeeEmail;

        try {
            validationHandler.validateEmail(managerEmail);
            validationHandler.validateManagerEmail(employeeEmail, managerEmail);

            utils.showLoading();
            const result = await utils.apiCall('verifyManager', { managerEmail });

            if (result.success) {
                managerNameInput.value = result.data.employeeDetails.name;
                this.originalManagerEmail = managerEmail;
                this.state.updateState({ managerEmail });
                messageHandler.showSuccessMessage({
                    title: 'עדכון פרטי מנהל',
                    message: 'פרטי המנהל עודכנו בהצלחה'
                });
            } else {
                throw new Error(result.error.message || 'כתובת האימייל של המנהל לא נמצאה במערכת');
            }
        } catch (error) {
            utils.showError(error.message);
            event.target.value = this.originalManagerEmail;
            managerNameInput.value = '';
        } finally {
            utils.hideLoading();
        }
    }

    async handleManagerSubmit(event) {
        event.preventDefault();
        const currentManagerEmail = document.getElementById('manager-email').value.trim();

        try {
            validationHandler.validateEmail(currentManagerEmail);
            validationHandler.validateManagerEmail(this.state.employeeEmail, currentManagerEmail);

            if (currentManagerEmail === this.originalManagerEmail) {
                this.showStep(3);
                return;
            }

            utils.showLoading();
            const result = await utils.apiCall('verifyManager', { 
                managerEmail: currentManagerEmail 
            });

            if (result.success) {
                this.state.updateState({ managerEmail: currentManagerEmail });
                this.showStep(3);
            } else {
                throw new Error(result.error.message || 'Failed to verify manager');
            }
        } catch (error) {
            utils.showError(error.message);
        } finally {
            utils.hideLoading();
        }
    }

    async handlePositionSubmit(event) {
        event.preventDefault();
        utils.showLoading();

        try {
            const formData = {
                employeeEmail: this.state.employeeEmail,
                managerEmail: this.state.managerEmail,
                position: document.getElementById('position').value,
                year: API_CONFIG.CURRENT_YEAR
            };

            // Validate position
            validationHandler.validatePosition(formData.position);

            // Check for existing submission
            const checkResult = await utils.apiCall('checkYearlySubmission', {
                employeeEmail: formData.employeeEmail,
                year: formData.year
            });

            if (checkResult.exists === "true") {
                throw new Error(SURVEY_CONFIG.messages.errors.existingSubmission);
            }

            // Create new submission
            const submissionResult = await utils.apiCall('createSubmission', formData);

            if (!submissionResult.success) {
                throw new Error(submissionResult.error?.message || 'שגיאה ביצירת השאלון');
            }

            // Update state with submission guid
            const surveyGuid = submissionResult.data.guid;
            this.state.updateState({ 
                guid: surveyGuid,
                position: formData.position 
            });

            // Show success message and redirect
            messageHandler.showSuccessMessage(1);
            setTimeout(() => {
                window.location.href = `/survey/index.html?id=${surveyGuid}`;
            }, 2000);

        } catch (error) {
            utils.showError(error.message);
        } finally {
            utils.hideLoading();
        }
    }

    initializeEventListeners() {
        // Employee email form
        document.getElementById('employee-email-form')?.addEventListener('submit',
            this.handleEmployeeSubmit.bind(this));

        // Manager email changes
        document.getElementById('manager-email')?.addEventListener('change',
            this.handleManagerEmailChange.bind(this));

        // Manager form submission
        document.getElementById('manager-details-form')?.addEventListener('submit',
            this.handleManagerSubmit.bind(this));

        // Position form submission
        document.getElementById('position-form')?.addEventListener('submit',
            this.handlePositionSubmit.bind(this));

        // Previous step buttons
        document.querySelectorAll('[onclick="prevStep()"]').forEach(button => {
            button.onclick = () => this.currentStep > 1 && this.showStep(this.currentStep - 1);
        });

        // Initialize position select
        if (typeof populatePositionSelect === 'function') {
            populatePositionSelect();
        }
    }

    // Handle back button
    handleBackButton() {
        window.addEventListener('popstate', (event) => {
            if (this.currentStep > 1) {
                event.preventDefault();
                this.showStep(this.currentStep - 1);
            }
        });
    }
}

// Export for global access
window.SurveyFormController = SurveyFormController;
// Survey Renderer Class
class SurveyRenderer {
    constructor(surveyData) {
        this.surveyData = surveyData;
        this.currentStep = surveyData.step;
        this.role = surveyData.position;
        this.answers = surveyData.answers || {};
        this.isManager = this.currentStep === 2;
        this.isReadOnly = this.currentStep === 3;
        this.employeeName = surveyData.employeeName;
    }

    async initialize() {
        try {
            await this.renderSurvey();
            this.attachEventListeners();
            this.initializeAutoSave();
        } catch (error) {
            utils.showError('Failed to initialize survey: ' + error.message);
        }
    }

    async renderSurvey() {
        const container = document.getElementById('survey-container');
        if (!container) return;

        container.innerHTML = this.generateSurveyHTML();
        container.classList.remove('hidden');
        document.getElementById('login-form-container')?.classList.add('hidden');
    }

    generateSurveyHTML() {
        return `
            <div class="max-w-4xl mx-auto">
                ${this.generateHeader()}
                ${this.generateProgressBar()}
                <form id="survey-form" class="space-y-8">
                    ${this.generateCategories()}
                    ${this.generateSubmitButton()}
                </form>
            </div>
        `;
    }

    generateHeader() {
        const headerText = this.isManager ? 
            `הערכת עובד - ${this.employeeName}` :
            'הערכה עצמית';

        return `
            <div class="bg-white p-6 rounded-lg shadow-md mb-6">
                <h1 class="text-2xl font-bold text-gray-800">${headerText}</h1>
                ${this.isManager ? `
                    <p class="text-gray-600 mt-2">אנא מלא/י את הערכת העובד/ת בהתאם להתרשמותך המקצועית</p>
                ` : ''}
            </div>
        `;
    }

    generateProgressBar() {
        const totalQuestions = this.getQuestionsForRole(this.role).length;
        const answered = Object.keys(this.answers).length;
        const progress = (answered / totalQuestions) * 100;

        return `
            <div class="mb-6 bg-white p-4 rounded-lg shadow-md">
                <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium text-blue-700">${answered} מתוך ${totalQuestions} שאלות</span>
                    <span class="text-sm font-medium text-blue-700">${Math.round(progress)}% הושלם</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5">
                    <div class="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                        style="width: ${progress}%"></div>
                </div>
            </div>
        `;
    }

    generateCategories() {
        return Object.entries(SURVEY_CONFIG.categories)
            .map(([categoryId, category]) => {
                const questions = this.getQuestionsForCategory(categoryId);
                if (questions.length === 0) return '';

                return `
                    <div class="bg-white p-6 rounded-lg shadow-md mb-6">
                        <h2 class="text-xl font-bold mb-6 flex items-center text-gray-800">
                            <i class="${category.icon} ml-2"></i>
                            ${category.title}
                        </h2>
                        <div class="space-y-8">
                            ${questions.map(q => this.generateQuestionHTML(q)).join('')}
                        </div>
                    </div>
                `;
            }).join('');
    }

    generateQuestionHTML(question) {
        return question.freeText ? 
            this.generateFreeTextQuestion(question) : 
            this.generateRatingQuestion(question);
    }

    generateRatingQuestion(question) {
        const currentValue = this.answers[question.id];
        const isDisabled = this.isReadOnly ? 'disabled' : '';

        return `
            <div class="question-container mb-6" data-question-id="${question.id}">
                <label class="block text-gray-700 font-medium mb-3">${question.text}</label>
                <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
                    ${Object.entries(SURVEY_CONFIG.ratingScale)
                        .reverse()
                        .map(([value, label]) => `
                            <label class="rating-option relative flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50
                                ${currentValue === value ? 'bg-blue-50 border-blue-500' : 'border-gray-300'}
                                ${this.isReadOnly ? 'cursor-not-allowed' : ''}"
                            >
                                <input 
                                    type="radio" 
                                    name="q_${question.id}" 
                                    value="${value}" 
                                    ${currentValue === value ? 'checked' : ''}
                                    ${isDisabled}
                                    class="absolute opacity-0 w-full h-full cursor-pointer"
                                    onchange="window.handleRatingChange(this)"
                                >
                                <span class="text-sm text-center ${currentValue === value ? 'text-blue-600 font-medium' : 'text-gray-600'}">${label}</span>
                            </label>
                        `).join('')}
                </div>
            </div>
        `;
    }

    generateFreeTextQuestion(question) {
        const currentValue = this.answers[question.id] || '';
        const isDisabled = this.isReadOnly ? 'disabled' : '';

        return `
            <div class="question-container" data-question-id="${question.id}">
                <label class="block text-gray-700 font-medium mb-3">${question.text}</label>
                <textarea name="q_${question.id}" rows="4" ${isDisabled}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${this.isReadOnly ? 'bg-gray-50' : ''}"
                    placeholder="הוסף את תשובתך כאן...">${currentValue}</textarea>
                ${this.generateComparisonView(question)}
            </div>
        `;
    }

    generateComparisonView(question) {
        if (!this.isReadOnly) return '';
        
        const employeeAnswer = this.surveyData.employeeAnswers?.[question.id];
        const managerAnswer = this.surveyData.managerAnswers?.[question.id];

        if (!employeeAnswer || !managerAnswer) return '';

        return `
            <div class="mt-4 p-4 bg-gray-50 rounded-lg">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <h4 class="text-sm font-medium text-gray-700 mb-2">הערכת עובד</h4>
                        <p class="text-gray-600">${this.formatAnswer(employeeAnswer, question.freeText)}</p>
                    </div>
                    <div>
                        <h4 class="text-sm font-medium text-gray-700 mb-2">הערכת מנהל</h4>
                        <p class="text-gray-600">${this.formatAnswer(managerAnswer, question.freeText)}</p>
                    </div>
                </div>
            </div>
        `;
    }

    formatAnswer(answer, isFreeText) {
        if (isFreeText) return answer;
        return SURVEY_CONFIG.ratingScale[answer] || answer;
    }

    generateSubmitButton() {
        if (this.isReadOnly) {
            return `
                <div class="flex justify-end space-x-4">
                    <button type="button" onclick="window.print()" 
                        class="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition duration-300">
                        <i class="fas fa-print ml-2"></i>הדפס
                    </button>
                    <button type="button" onclick="downloadExcel()" 
                        class="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition duration-300">
                        <i class="fas fa-file-excel ml-2"></i>הורד לאקסל
                    </button>
                </div>
            `;
        }

        return `
            <div class="flex justify-end">
                <button type="submit" 
                    class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition duration-300">
                    ${this.isManager ? 'שלח הערכת מנהל' : 'שלח הערכה עצמית'}
                    <i class="fas fa-paper-plane mr-2"></i>
                </button>
            </div>
        `;
    }

    attachEventListeners() {
        const form = document.getElementById('survey-form');
        if (!form) return;

        // Form submission
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubmit();
        });

        // Auto-save on input changes
        if (!this.isReadOnly) {
            form.addEventListener('change', this.handleInputChange.bind(this));
        }

        // Rating option click handlers
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const container = e.target.closest('.question-container');
                container.querySelectorAll('.rating-option').forEach(label => {
                    label.classList.remove('bg-blue-50', 'border-blue-500');
                });
                e.target.closest('.rating-option').classList.add('bg-blue-50', 'border-blue-500');
            });
        });
    }

    async handleSubmit() {
        try {
            utils.showLoading();
            
            const formData = new FormData(document.getElementById('survey-form'));
            const answers = {};
            
            formData.forEach((value, key) => {
                if (key.startsWith('q_')) {
                    answers[key.substring(2)] = value;
                }
            });

            // Validate all required questions are answered
            const requiredQuestions = this.getQuestionsForRole(this.role)
                .filter(q => !q.optional)
                .map(q => q.id);
            
            validationHandler.validateSurveyAnswers(answers, requiredQuestions);

            const response = await utils.apiCall('submitSurveyAnswers', {
                guid: this.surveyData.guid,
                step: this.currentStep,
                answers: answers
            });

            if (response.success) {
                messageHandler.showSuccessMessage(this.currentStep);
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            } else {
                throw new Error(response.error?.message || 'Failed to submit survey');
            }
        } catch (error) {
            utils.showError(error.message);
        } finally {
            utils.hideLoading();
        }
    }

    initializeAutoSave() {
        let autoSaveTimeout;
        const form = document.getElementById('survey-form');
        
        if (!form || this.isReadOnly) return;

        form.addEventListener('input', () => {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = setTimeout(async () => {
                await this.saveProgress();
            }, 1000);
        });
    }

    async saveProgress() {
        try {
            const formData = new FormData(document.getElementById('survey-form'));
            const answers = {};
            
            formData.forEach((value, key) => {
                if (key.startsWith('q_')) {
                    answers[key.substring(2)] = value;
                }
            });

            await utils.apiCall('saveDraft', {
                guid: this.surveyData.guid,
                step: this.currentStep,
                answers: answers
            });
        } catch (error) {
            console.error('Failed to auto-save:', error);
        }
    }

    getQuestionsForRole(role) {
        const questions = [];
        Object.entries(SURVEY_CONFIG.categories).forEach(([categoryId, category]) => {
            Object.entries(category.questions).forEach(([questionId, question]) => {
                if (question.roles.includes(role)) {
                    questions.push({
                        id: questionId,
                        ...question,
                        categoryId
                    });
                }
            });
        });
        return questions;
    }

    getQuestionsForCategory(categoryId) {
        const category = SURVEY_CONFIG.categories[categoryId];
        return Object.entries(category.questions)
            .filter(([_, question]) => question.roles.includes(this.role))
            .map(([id, question]) => ({ id, ...question }));
    }
}

// Export for global access
window.SurveyRenderer = SurveyRenderer;
// Comparison Report Handler
class ComparisonReportHandler {
    constructor(surveyData) {
        this.surveyData = surveyData;
        this.employeeAnswers = surveyData.employeeAnswers || {};
        this.managerAnswers = surveyData.managerAnswers || {};
        this.employeeName = surveyData.employeeName;
        this.managerName = surveyData.managerName;
        this.position = surveyData.position;
        this.year = surveyData.year;
    }

    generateComparisonData() {
        const comparisonData = {
            metadata: {
                employeeName: this.employeeName,
                managerName: this.managerName,
                position: SURVEY_CONFIG.roles[this.position],
                year: this.year,
                date: new Date().toLocaleDateString('he-IL')
            },
            categories: {}
        };

        // Generate comparison for each category
        Object.entries(SURVEY_CONFIG.categories).forEach(([categoryId, category]) => {
            const categoryQuestions = this.getQuestionsForCategory(categoryId);
            if (categoryQuestions.length === 0) return;

            comparisonData.categories[categoryId] = {
                title: category.title,
                questions: categoryQuestions.map(question => ({
                    text: question.text,
                    employeeAnswer: this.formatAnswer(this.employeeAnswers[question.id], question.freeText),
                    managerAnswer: this.formatAnswer(this.managerAnswers[question.id], question.freeText),
                    gap: this.calculateGap(this.employeeAnswers[question.id], this.managerAnswers[question.id], question.freeText)
                }))
            };
        });

        return comparisonData;
    }

    formatAnswer(answer, isFreeText) {
        if (!answer) return '-';
        if (isFreeText) return answer;
        return SURVEY_CONFIG.ratingScale[answer] || answer;
    }

    calculateGap(employeeAnswer, managerAnswer, isFreeText) {
        if (isFreeText || !employeeAnswer || !managerAnswer) return null;
        return parseInt(employeeAnswer) - parseInt(managerAnswer);
    }

    getQuestionsForCategory(categoryId) {
        const category = SURVEY_CONFIG.categories[categoryId];
        return Object.entries(category.questions)
            .filter(([_, question]) => question.roles.includes(this.position))
            .map(([id, question]) => ({
                id,
                text: question.text,
                freeText: !!question.freeText
            }));
    }

    async downloadExcel() {
        try {
            utils.showLoading();
            const comparisonData = this.generateComparisonData();
            
            // Generate Excel structure
            const workbookData = this.generateExcelStructure(comparisonData);
            
            // Call API to generate Excel file
            const response = await utils.apiCall('generateExcelReport', {
                guid: this.surveyData.guid,
                data: workbookData
            });

            if (response.success && response.data.fileUrl) {
                // Trigger download
                const link = document.createElement('a');
                link.href = response.data.fileUrl;
                link.download = `הערכת_עובד_${this.employeeName}_${this.year}.xlsx`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                throw new Error('Failed to generate Excel report');
            }
        } catch (error) {
            utils.showError('Failed to download Excel report: ' + error.message);
        } finally {
            utils.hideLoading();
        }
    }

    generateExcelStructure(comparisonData) {
        return {
            sheets: [
                {
                    name: 'הערכת עובד',
                    headers: [
                        'קטגוריה',
                        'שאלה',
                        'הערכה עצמית',
                        'הערכת מנהל',
                        'פער'
                    ],
                    data: this.flattenDataForExcel(comparisonData),
                    metadata: comparisonData.metadata
                }
            ]
        };
    }

    flattenDataForExcel(comparisonData) {
        const rows = [];
        
        Object.entries(comparisonData.categories).forEach(([_, category]) => {
            // Add category header
            rows.push([{
                value: category.title,
                style: {
                    bold: true,
                    backgroundColor: '#E5E7EB'
                }
            }]);

            // Add questions
            category.questions.forEach(question => {
                rows.push([
                    '', // Category column (empty for questions)
                    question.text,
                    question.employeeAnswer,
                    question.managerAnswer,
                    question.gap !== null ? question.gap : '-'
                ]);
            });
        });

        return rows;
    }
}

// Survey Summary Generator
class SurveySummaryGenerator {
    constructor(surveyData) {
        this.surveyData = surveyData;
    }

    generateSummary() {
        const summary = {
            averages: this.calculateAverages(),
            significantGaps: this.findSignificantGaps(),
            strengths: this.identifyStrengths(),
            improvements: this.identifyImprovements(),
            recommendations: this.generateRecommendations()
        };

        return this.formatSummaryHTML(summary);
    }

    calculateAverages() {
        // Calculate category averages for both employee and manager ratings
        const averages = {};
        Object.entries(SURVEY_CONFIG.categories).forEach(([categoryId, category]) => {
            const categoryQuestions = this.getNumericAnswersForCategory(categoryId);
            if (categoryQuestions.length > 0) {
                averages[categoryId] = {
                    title: category.title,
                    employee: this.calculateAverage(categoryQuestions.map(q => q.employeeAnswer)),
                    manager: this.calculateAverage(categoryQuestions.map(q => q.managerAnswer)),
                    gap: null
                };
                averages[categoryId].gap = averages[categoryId].employee - averages[categoryId].manager;
            }
        });
        return averages;
    }

    getNumericAnswersForCategory(categoryId) {
        const questions = [];
        const category = SURVEY_CONFIG.categories[categoryId];
        
        Object.entries(category.questions).forEach(([questionId, question]) => {
            if (!question.freeText && question.roles.includes(this.surveyData.position)) {
                const employeeAnswer = parseInt(this.surveyData.employeeAnswers[questionId]);
                const managerAnswer = parseInt(this.surveyData.managerAnswers[questionId]);
                
                if (!isNaN(employeeAnswer) && !isNaN(managerAnswer)) {
                    questions.push({ questionId, employeeAnswer, managerAnswer });
                }
            }
        });
        
        return questions;
    }

    calculateAverage(numbers) {
        return numbers.length > 0 
            ? (numbers.reduce((sum, num) => sum + num, 0) / numbers.length).toFixed(1)
            : 0;
    }

    findSignificantGaps() {
        const gaps = [];
        Object.entries(SURVEY_CONFIG.categories).forEach(([categoryId, category]) => {
            const questions = this.getNumericAnswersForCategory(categoryId);
            questions.forEach(({ questionId, employeeAnswer, managerAnswer }) => {
                const gap = employeeAnswer - managerAnswer;
                if (Math.abs(gap) >= 2) {
                    gaps.push({
                        category: category.title,
                        question: category.questions[questionId].text,
                        gap,
                        employeeRating: SURVEY_CONFIG.ratingScale[employeeAnswer],
                        managerRating: SURVEY_CONFIG.ratingScale[managerAnswer]
                    });
                }
            });
        });
        return gaps;
    }

    formatSummaryHTML(summary) {
        return `
            <div class="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 class="text-xl font-bold mb-4">סיכום הערכה</h2>
                
                <!-- Category Averages -->
                <div class="mb-6">
                    <h3 class="text-lg font-semibold mb-3">ממוצעים לפי קטגוריה</h3>
                    <div class="grid grid-cols-1 gap-4">
                        ${Object.entries(summary.averages).map(([_, data]) => `
                            <div class="p-4 bg-gray-50 rounded-lg">
                                <h4 class="font-medium mb-2">${data.title}</h4>
                                <div class="grid grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span class="text-gray-600">הערכה עצמית:</span>
                                        <span class="font-medium">${data.employee}</span>
                                    </div>
                                    <div>
                                        <span class="text-gray-600">הערכת מנהל:</span>
                                        <span class="font-medium">${data.manager}</span>
                                    </div>
                                    <div>
                                        <span class="text-gray-600">פער:</span>
                                        <span class="font-medium ${data.gap > 0 ? 'text-red-600' : 'text-green-600'}">
                                            ${data.gap > 0 ? '+' : ''}${data.gap}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Significant Gaps -->
                ${summary.significantGaps.length > 0 ? `
                    <div class="mb-6">
                        <h3 class="text-lg font-semibold mb-3">פערים משמעותיים</h3>
                        <div class="space-y-4">
                            ${summary.significantGaps.map(gap => `
                                <div class="p-4 bg-yellow-50 rounded-lg">
                                    <p class="font-medium mb-2">${gap.category} - ${gap.question}</p>
                                    <div class="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span class="text-gray-600">הערכה עצמית:</span>
                                            <span class="font-medium">${gap.employeeRating}</span>
                                        </div>
                                        <div>
                                            <span class="text-gray-600">הערכת מנהל:</span>
                                            <span class="font-medium">${gap.managerRating}</span>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the survey page or login page
    const urlParams = new URLSearchParams(window.location.search);
    const surveyId = urlParams.get('id');

    if (surveyId) {
        initializeSurvey();
    } else {
        new SurveyFormController();
    }

    // Initialize download handlers
    window.downloadExcel = async function() {
        const comparisonHandler = new ComparisonReportHandler(window.surveyData);
        await comparisonHandler.downloadExcel();
    };
});
// Survey Initialization Functions
async function initializeSurvey() {
    const urlParams = new URLSearchParams(window.location.search);
    const surveyGuid = urlParams.get('id');
    
    if (!surveyGuid) {
        window.location.href = '/login';
        return;
    }

    try {
        utils.showLoading();
        const response = await utils.apiCall('getSurveyStatus', {
            guid: surveyGuid
        });

        if (!response.success) {
            throw new Error('Failed to load survey status');
        }

        // Store survey data globally for access by other components
        window.surveyData = response.data;
        
        // Initialize the appropriate survey view based on step
        await loadSurveyStep(response.data.step, response.data);
    } catch (error) {
        utils.showError(error.message);
        console.error('Survey initialization failed:', error);
    } finally {
        utils.hideLoading();
    }
}

// Load appropriate survey step
async function loadSurveyStep(step, surveyData) {
    const renderer = new SurveyRenderer(surveyData);
    await renderer.initialize();

    // Show/hide appropriate UI elements
    document.getElementById('login-form-container')?.classList.add('hidden');
    document.getElementById('survey-container')?.classList.remove('hidden');

    // Update page title based on step
    updatePageTitle(step, surveyData);
}

// Update page title based on survey step
function updatePageTitle(step, surveyData) {
    const titles = {
        1: 'הערכה עצמית',
        2: `הערכת עובד - ${surveyData.employeeName}`,
        3: 'סיכום והשוואה'
    };

    document.title = `${titles[step] || 'שאלון הערכה'} - ABRA`;
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the survey page or login page
    const urlParams = new URLSearchParams(window.location.search);
    const surveyId = urlParams.get('id');

    if (surveyId) {
        initializeSurvey().catch(error => {
            console.error('Failed to initialize survey:', error);
            utils.showError('Failed to load survey. Please try again.');
        });
    } else {
        new SurveyFormController();
    }

    // Initialize download handlers
    window.downloadExcel = async function() {
        try {
            utils.showLoading();
            const comparisonHandler = new ComparisonReportHandler(window.surveyData);
            await comparisonHandler.downloadExcel();
        } catch (error) {
            utils.showError('Failed to download Excel file: ' + error.message);
        } finally {
            utils.hideLoading();
        }
    };
});

// Export necessary functions to global scope
window.initializeSurvey = initializeSurvey;
window.loadSurveyStep = loadSurveyStep;