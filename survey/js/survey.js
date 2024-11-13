// Core utilities and configurations
const getConfig = () => {
    if (!window.API_CONFIG || !window.SURVEY_CONFIG) {
        console.error('Required configurations not found. Make sure config.js is loaded first.');
        return false;
    }
    return true;
};

const DEBUG_MODE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Utility functions
const utils = {
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    showLoading() {
        document.getElementById('loading-overlay')?.classList.add('visible');
    },

    hideLoading() {
        document.getElementById('loading-overlay')?.classList.remove('visible');
    },

    async apiCall(action, data) {
        try {
            const response = await fetch(API_CONFIG.ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, data })
            });
            
            const result = await response.json();
            
            if (DEBUG_MODE) {
                console.log(`API ${action} Response:`, result);
            }
            
            return result;
        } catch (error) {
            console.error(`API Error (${action}):`, error);
            throw new Error('Failed to communicate with server');
        }
    },

    getDomElement(id) {
        const element = document.getElementById(id);
        if (!element && DEBUG_MODE) {
            console.warn(`Element with id '${id}' not found`);
        }
        return element;
    },

    showError(message) {
        alert(message); // Can be replaced with a custom error UI component
    },

    updateElementClasses(element, { add = [], remove = [], replace = {} }) {
        if (add.length) element.classList.add(...add);
        if (remove.length) element.classList.remove(...remove);
        Object.entries(replace).forEach(([oldClass, newClass]) => {
            element.classList.replace(oldClass, newClass);
        });
    },

    async safeApiCall(action, data, errorMessage = 'Operation failed') {
        try {
            utils.showLoading();
            const result = await utils.apiCall(action, data);
            
            if (!result.success) {
                throw new Error(result.error?.message || errorMessage);
            }
            
            return result;
        } catch (error) {
            utils.showError(error.message);
            throw error;
        } finally {
            utils.hideLoading();
        }
    }
};

// Message handler for success and error messages
const messageHandler = {
    showSuccessMessage(step) {
        const content = SURVEY_CONFIG.messages.success[step];
        if (!content) return;

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
        const messageElement = utils.getDomElement('success-message');
        if (messageElement) {
            utils.updateElementClasses(messageElement, { add: ['opacity-0'] });
            setTimeout(() => messageElement.remove(), 300);
        }
    }
};

// Form validation handler
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
        this.currentStep = 1;
        this.totalSteps = 3;
    }

    updateState(updates) {
        Object.assign(this, updates);
        this.notifyStateChange();
    }

    notifyStateChange() {
        const event = new CustomEvent('surveyStateChanged', { detail: this });
        window.dispatchEvent(event);
    }
}

// Survey Form Controller
class SurveyFormController {
    constructor() {
        this.state = new SurveyState();
        this.originalManagerEmail = '';
        this.initializeEventListeners();
        this.boundHandlers = {
            handleEmployeeSubmit: this.handleEmployeeSubmit.bind(this),
            handleManagerEmailChange: this.handleManagerEmailChange.bind(this),
            handleManagerSubmit: this.handleManagerSubmit.bind(this),
            handlePositionSubmit: this.handlePositionSubmit.bind(this)
        };
    }

    showStep(step) {
        const stepContents = document.querySelectorAll('.step-content');
        stepContents.forEach(content => content.classList.add('hidden'));
        
        const currentStep = utils.getDomElement(`step-${step}`);
        if (currentStep) {
            currentStep.classList.remove('hidden');
            this.state.currentStep = step;
            utils.updateProgress(step, this.state.totalSteps);
        }
    }

    async handleEmployeeSubmit(event) {
        event.preventDefault();
        
        try {
            const email = utils.getDomElement('employee-email')?.value.trim();
            validationHandler.validateEmail(email);

            const result = await utils.safeApiCall('verifyEmployee', { email });
            
            if (result.success) {
                const { managerName, managerEmail } = result.data;
                validationHandler.validateManagerEmail(email, managerEmail);

                // Update UI
                utils.getDomElement('manager-name').value = managerName;
                utils.getDomElement('manager-email').value = managerEmail;
                
                // Update state
                this.originalManagerEmail = managerEmail;
                this.state.updateState({
                    employeeEmail: email,
                    managerEmail: managerEmail
                });

                this.showStep(2);
            }
        } catch (error) {
            utils.showError(error.message);
        }
    }

    async handleManagerEmailChange(event) {
        const managerEmail = event.target.value.trim();
        const managerNameInput = utils.getDomElement('manager-name');
        
        try {
            validationHandler.validateEmail(managerEmail);
            validationHandler.validateManagerEmail(this.state.employeeEmail, managerEmail);

            const result = await utils.safeApiCall('verifyManager', { managerEmail });
            
            if (result.success) {
                managerNameInput.value = result.data.employeeDetails.name;
                this.originalManagerEmail = managerEmail;
                this.state.updateState({ managerEmail });
                messageHandler.showSuccessMessage({
                    title: 'עדכון פרטי מנהל',
                    message: 'פרטי המנהל עודכנו בהצלחה'
                });
            }
        } catch (error) {
            utils.showError(error.message);
            event.target.value = this.originalManagerEmail;
            managerNameInput.value = '';
        }
    }

    async handleManagerSubmit(event) {
        event.preventDefault();
        
        try {
            const currentManagerEmail = utils.getDomElement('manager-email')?.value.trim();
            
            if (!currentManagerEmail) {
                throw new Error('נא להזין כתובת אימייל של המנהל');
            }

            validationHandler.validateEmail(currentManagerEmail);
            validationHandler.validateManagerEmail(this.state.employeeEmail, currentManagerEmail);

            if (currentManagerEmail === this.originalManagerEmail) {
                this.showStep(3);
                return;
            }

            const result = await utils.safeApiCall('verifyManager', { 
                managerEmail: currentManagerEmail 
            });

            if (result.success) {
                this.state.updateState({ managerEmail: currentManagerEmail });
                this.showStep(3);
            }
        } catch (error) {
            utils.showError(error.message);
        }
    }

    async handlePositionSubmit(event) {
        event.preventDefault();
        
        try {
            const formData = {
                employeeEmail: this.state.employeeEmail,
                managerEmail: this.state.managerEmail,
                position: utils.getDomElement('position')?.value,
                year: API_CONFIG.CURRENT_YEAR
            };

            validationHandler.validatePosition(formData.position);

            // Check for existing submission
            const checkResult = await utils.safeApiCall('checkYearlySubmission', {
                employeeEmail: formData.employeeEmail,
                year: formData.year
            });

            if (checkResult.exists === "true") {
                throw new Error(SURVEY_CONFIG.messages.errors.existingSubmission);
            }

            const submissionResult = await utils.safeApiCall('createSubmission', formData);

            if (submissionResult.success) {
                const surveyGuid = submissionResult.data.guid;
                this.state.updateState({ 
                    guid: surveyGuid,
                    position: formData.position 
                });

                messageHandler.showSuccessMessage(1);
                setTimeout(() => {
                    window.location.href = `/survey/index.html?id=${surveyGuid}`;
                }, 2000);
            }
        } catch (error) {
            utils.showError(error.message);
        }
    }

    initializeEventListeners() {
        // Form submissions
        const forms = {
            'employee-email-form': this.boundHandlers.handleEmployeeSubmit,
            'manager-details-form': this.boundHandlers.handleManagerSubmit,
            'position-form': this.boundHandlers.handlePositionSubmit
        };

        Object.entries(forms).forEach(([id, handler]) => {
            utils.getDomElement(id)?.addEventListener('submit', handler);
        });

        // Manager email change
        utils.getDomElement('manager-email')?.addEventListener('change',
            this.boundHandlers.handleManagerEmailChange);

        // Previous step buttons
        document.querySelectorAll('[onclick="prevStep()"]').forEach(button => {
            button.onclick = () => this.state.currentStep > 1 && 
                this.showStep(this.state.currentStep - 1);
        });

        // Back button handling
        window.addEventListener('popstate', () => {
            if (this.state.currentStep > 1) {
                this.showStep(this.state.currentStep - 1);
            }
        });

        // Initialize position select if function exists
        if (typeof populatePositionSelect === 'function') {
            populatePositionSelect();
        }
    }
}

// Make controller available globally
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
        this.autoSaveTimeout = null;
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
        const container = utils.getDomElement('survey-container');
        if (!container) return;

        container.innerHTML = this.generateSurveyHTML();
        container.classList.remove('hidden');
        utils.getDomElement('login-form-container')?.classList.add('hidden');
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
            `הערכת עובד - ${this.employeeName}` : 'הערכה עצמית';

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
        const questions = this.getQuestionsForRole(this.role);
        const totalQuestions = questions.length;
        const answered = Object.keys(this.answers).length;
        const progress = totalQuestions > 0 ? (answered / totalQuestions) * 100 : 0;

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
                if (!questions.length) return '';

                return this.generateCategoryHTML(category, questions);
            })
            .filter(Boolean)
            .join('');
    }

    generateCategoryHTML(category, questions) {
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
                    ${this.generateRatingOptions(question.id, currentValue, isDisabled)}
                </div>
                ${this.generateComparisonView(question)}
            </div>
        `;
    }

    generateRatingOptions(questionId, currentValue, isDisabled) {
        return Object.entries(SURVEY_CONFIG.ratingScale)
            .reverse()
            .map(([value, label]) => {
                const isSelected = currentValue === value;
                const optionClasses = [
                    'rating-option',
                    'relative flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50',
                    isSelected ? 'bg-blue-50 border-blue-500' : 'border-gray-300',
                    this.isReadOnly ? 'cursor-not-allowed' : ''
                ].filter(Boolean).join(' ');

                return `
                    <label class="${optionClasses}">
                        <input 
                            type="radio" 
                            name="q_${questionId}" 
                            value="${value}" 
                            ${isSelected ? 'checked' : ''}
                            ${isDisabled}
                            class="absolute opacity-0 w-full h-full cursor-pointer"
                            onchange="window.handleRatingChange(this)"
                        >
                        <span class="text-sm text-center ${isSelected ? 'text-blue-600 font-medium' : 'text-gray-600'}">${label}</span>
                    </label>
                `;
            })
            .join('');
    }

    generateFreeTextQuestion(question) {
        const currentValue = this.answers[question.id] || '';
        const isDisabled = this.isReadOnly ? 'disabled' : '';

        return `
            <div class="question-container" data-question-id="${question.id}">
                <label class="block text-gray-700 font-medium mb-3">${question.text}</label>
                <textarea 
                    name="q_${question.id}" 
                    rows="4" 
                    ${isDisabled}
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                        ${this.isReadOnly ? 'bg-gray-50' : ''}"
                    placeholder="הוסף את תשובתך כאן..."
                >${currentValue}</textarea>
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
        if (!answer) return '-';
        return isFreeText ? answer : (SURVEY_CONFIG.ratingScale[answer] || answer);
    }

    generateSubmitButton() {
        if (this.isReadOnly) {
            return `
                <div class="flex justify-end space-x-4">
                    <button type="button" onclick="window.print()" 
                        class="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition duration-300">
                        <i class="fas fa-print ml-2"></i>הדפס
                    </button>
                    <button type="button" onclick="window.downloadExcel()" 
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
        const form = utils.getDomElement('survey-form');
        if (!form) return;

        form.addEventListener('submit', this.handleSubmit.bind(this));

        if (!this.isReadOnly) {
            form.addEventListener('change', this.handleInputChange.bind(this));
        }
    }

    handleInputChange(event) {
        const questionId = event.target.name?.replace('q_', '');
        if (questionId) {
            this.answers[questionId] = event.target.value;
            this.updateProgressBar();
            this.triggerAutoSave();
        }
    }

    triggerAutoSave() {
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => this.saveProgress(), 1000);
    }

    async saveProgress() {
        try {
            const answers = this.gatherFormAnswers();
            await utils.apiCall('saveDraft', {
                guid: this.surveyData.guid,
                step: this.currentStep,
                answers
            });
        } catch (error) {
            console.error('Auto-save failed:', error);
        }
    }

    gatherFormAnswers() {
        const form = utils.getDomElement('survey-form');
        if (!form) return {};

        const formData = new FormData(form);
        const answers = {};
        
        formData.forEach((value, key) => {
            if (key.startsWith('q_')) {
                answers[key.substring(2)] = value;
            }
        });

        return answers;
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        try {
            const answers = this.gatherFormAnswers();
            const requiredQuestions = this.getQuestionsForRole(this.role)
                .filter(q => !q.optional)
                .map(q => q.id);

            validationHandler.validateSurveyAnswers(answers, requiredQuestions);

            const response = await utils.safeApiCall('submitSurveyAnswers', {
                guid: this.surveyData.guid,
                step: this.currentStep,
                answers
            });

            if (response.success) {
                messageHandler.showSuccessMessage(this.currentStep);
                setTimeout(() => window.location.reload(), 2000);
            }
        } catch (error) {
            utils.showError(error.message);
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

// Make renderer available globally
window.SurveyRenderer = SurveyRenderer;

// Initialize survey when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const surveyId = urlParams.get('id');

    if (surveyId) {
        initializeSurvey().catch(error => {
            console.error('Survey initialization failed:', error);
            utils.showError('Failed to load survey. Please try again.');
        });
    } else {
        new SurveyFormController();
    }
});
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
        return {
            metadata: this.generateMetadata(),
            categories: this.generateCategoriesComparison()
        };
    }

    generateMetadata() {
        return {
            employeeName: this.employeeName,
            managerName: this.managerName,
            position: SURVEY_CONFIG.roles[this.position],
            year: this.year,
            date: new Date().toLocaleDateString('he-IL')
        };
    }

    generateCategoriesComparison() {
        const categories = {};
        Object.entries(SURVEY_CONFIG.categories).forEach(([categoryId, category]) => {
            const categoryQuestions = this.getQuestionsForCategory(categoryId);
            if (categoryQuestions.length > 0) {
                categories[categoryId] = this.generateCategoryComparison(category, categoryQuestions);
            }
        });
        return categories;
    }

    generateCategoryComparison(category, questions) {
        return {
            title: category.title,
            questions: questions.map(question => ({
                text: question.text,
                employeeAnswer: this.formatAnswer(this.employeeAnswers[question.id], question.freeText),
                managerAnswer: this.formatAnswer(this.managerAnswers[question.id], question.freeText),
                gap: this.calculateGap(
                    this.employeeAnswers[question.id], 
                    this.managerAnswers[question.id], 
                    question.freeText
                )
            }))
        };
    }

    formatAnswer(answer, isFreeText) {
        if (!answer) return '-';
        return isFreeText ? answer : (SURVEY_CONFIG.ratingScale[answer] || answer);
    }

    calculateGap(employeeAnswer, managerAnswer, isFreeText) {
        if (isFreeText || !employeeAnswer || !managerAnswer) return null;
        const empVal = parseInt(employeeAnswer);
        const mgrVal = parseInt(managerAnswer);
        return !isNaN(empVal) && !isNaN(mgrVal) ? empVal - mgrVal : null;
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
            const workbookData = this.generateExcelStructure(comparisonData);
            
            const response = await utils.safeApiCall('generateExcelReport', {
                guid: this.surveyData.guid,
                data: workbookData
            });

            if (response.success && response.data.fileUrl) {
                this.triggerDownload(response.data.fileUrl);
            }
        } catch (error) {
            utils.showError('Failed to download Excel report: ' + error.message);
        } finally {
            utils.hideLoading();
        }
    }

    triggerDownload(fileUrl) {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = `הערכת_עובד_${this.employeeName}_${this.year}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    generateExcelStructure(comparisonData) {
        return {
            sheets: [{
                name: 'הערכת עובד',
                headers: this.getExcelHeaders(),
                data: this.flattenDataForExcel(comparisonData),
                metadata: comparisonData.metadata
            }]
        };
    }

    getExcelHeaders() {
        return [
            'קטגוריה',
            'שאלה',
            'הערכה עצמית',
            'הערכת מנהל',
            'פער'
        ];
    }

    flattenDataForExcel(comparisonData) {
        const rows = [];
        
        Object.entries(comparisonData.categories).forEach(([_, category]) => {
            // Add category header
            rows.push(this.createCategoryHeaderRow(category.title));

            // Add questions
            category.questions.forEach(question => {
                rows.push(this.createQuestionRow(question));
            });
        });

        return rows;
    }

    createCategoryHeaderRow(title) {
        return [{
            value: title,
            style: {
                bold: true,
                backgroundColor: '#E5E7EB'
            }
        }];
    }

    createQuestionRow(question) {
        return [
            '', // Category column (empty for questions)
            question.text,
            question.employeeAnswer,
            question.managerAnswer,
            question.gap !== null ? question.gap : '-'
        ];
    }
}

// Summary Generator for Comparison View
class SurveySummaryGenerator {
    constructor(surveyData) {
        this.surveyData = surveyData;
        this.comparisonHandler = new ComparisonReportHandler(surveyData);
    }

    generateSummary() {
        const summary = {
            averages: this.calculateAverages(),
            significantGaps: this.findSignificantGaps()
        };

        return this.formatSummaryHTML(summary);
    }

    calculateAverages() {
        const averages = {};
        Object.entries(SURVEY_CONFIG.categories).forEach(([categoryId, category]) => {
            const categoryQuestions = this.getNumericAnswers(categoryId);
            if (categoryQuestions.length > 0) {
                averages[categoryId] = this.calculateCategoryAverages(category, categoryQuestions);
            }
        });
        return averages;
    }

    calculateCategoryAverages(category, questions) {
        const employeeAvg = this.calculateAverage(questions.map(q => q.employeeAnswer));
        const managerAvg = this.calculateAverage(questions.map(q => q.managerAnswer));
        
        return {
            title: category.title,
            employee: employeeAvg,
            manager: managerAvg,
            gap: employeeAvg - managerAvg
        };
    }

    getNumericAnswers(categoryId) {
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
            const questions = this.getNumericAnswers(categoryId);
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
                ${this.generateAveragesSection(summary.averages)}
                ${this.generateGapsSection(summary.significantGaps)}
            </div>
        `;
    }

    generateAveragesSection(averages) {
        return `
            <div class="mb-6">
                <h3 class="text-lg font-semibold mb-3">ממוצעים לפי קטגוריה</h3>
                <div class="grid grid-cols-1 gap-4">
                    ${Object.entries(averages).map(([_, data]) => this.generateAverageCard(data)).join('')}
                </div>
            </div>
        `;
    }

    generateAverageCard(data) {
        return `
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
        `;
    }

    generateGapsSection(gaps) {
        if (!gaps.length) return '';

        return `
            <div class="mb-6">
                <h3 class="text-lg font-semibold mb-3">פערים משמעותיים</h3>
                <div class="space-y-4">
                    ${gaps.map(gap => this.generateGapCard(gap)).join('')}
                </div>
            </div>
        `;
    }

    generateGapCard(gap) {
        return `
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
        `;
    }
}

// Initialize global handlers
window.ComparisonReportHandler = ComparisonReportHandler;
window.SurveySummaryGenerator = SurveySummaryGenerator;

// Global download handler
window.downloadExcel = async function() {
    if (!window.surveyData) {
        utils.showError('Survey data not available');
        return;
    }
    
    const handler = new ComparisonReportHandler(window.surveyData);
    await handler.downloadExcel();
};