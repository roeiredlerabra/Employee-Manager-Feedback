// app.js

// QuestionGroup Component
const QuestionGroup = React.createClass({
    getInitialState() {
        return {
            showNotes: false,
            isAnimating: false
        };
    },

    toggleNotes() {
        this.setState(prevState => ({
            showNotes: !prevState.showNotes,
            isAnimating: true
        }));
        
        setTimeout(() => {
            this.setState({ isAnimating: false });
        }, Config.utils.constants.ANIMATION_DURATION);
    },

    render() {
        const { question, value, onRatingChange, onNoteChange, note } = this.props;
        const isFreeText = question.freeText;

        return (
            <div className={`question-group ${!value && !isFreeText ? 'unanswered' : ''}`}>
                <div className="question-header">
                    <label className="question-label">{question.text}</label>
                </div>
                {!isFreeText ? (
                    <div className="rating-group">
                        {Object.entries(Config.ratingScale).reverse().map(([rating, label]) => (
                            <button
                                key={rating}
                                className={`rating-btn ${value === parseInt(rating) ? 'selected' : ''}`}
                                onClick={() => onRatingChange(parseInt(rating))}
                                aria-pressed={value === parseInt(rating)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="notes-section">
                        <textarea
                            className="notes-textarea"
                            value={note || ''}
                            onChange={(e) => onNoteChange(e.target.value)}
                            placeholder="הוסף פירוט כאן..."
                            aria-label="שדה הערות"
                        />
                    </div>
                )}
                {!isFreeText && (
                    <div className="notes-section">
                        <button 
                            type="button" 
                            className="action-btn" 
                            onClick={this.toggleNotes}
                            aria-expanded={this.state.showNotes}
                        >
                            <i className={`fas fa-comment ${this.state.showNotes ? 'fa-rotate-180' : ''}`}></i>
                            {this.state.showNotes ? 'סגור הערה' : 'הוסף הערה'}
                        </button>
                        {this.state.showNotes && (
                            <textarea
                                className={`notes-textarea ${this.state.isAnimating ? 'animate__animated animate__fadeIn' : ''}`}
                                value={note || ''}
                                onChange={(e) => onNoteChange(e.target.value)}
                                placeholder="הוסף הערות כאן..."
                                aria-label="שדה הערות נוספות"
                            />
                        )}
                    </div>
                )}
            </div>
        );
    }
});

// CategorySection Component
const CategorySection = React.createClass({
    render() {
        const { category, responses, notes, onRatingChange, onNoteChange, selectedRole } = this.props;
        const filteredQuestions = Object.entries(category.questions)
            .filter(([_, question]) => question.roles.includes(selectedRole));

        if (filteredQuestions.length === 0) {
            return null;
        }

        return (
            <div className="category animate__animated animate__fadeIn">
                <h2>
                    <i className={category.icon}></i>
                    {category.title}
                </h2>
                <div className="category-content">
                    {filteredQuestions.map(([questionKey, question]) => (
                        <QuestionGroup
                            key={questionKey}
                            question={question}
                            value={responses[questionKey]}
                            note={notes[questionKey]}
                            onRatingChange={(value) => onRatingChange(questionKey, value)}
                            onNoteChange={(value) => onNoteChange(questionKey, value)}
                        />
                    ))}
                </div>
            </div>
        );
    }
});

// Header Component
const Header = React.createClass({
    render() {
        const { formData, onFormChange, isReadOnly } = this.props;
        
        return (
            <div className="header">
                <h1>
                    <i className="fas fa-clipboard-check"></i>
                    מערכת משוב הדדי
                </h1>
                <div className="form-header">
                    <div className="form-group">
                        <label>
                            <i className="fas fa-user-tag"></i>
                            תפקיד
                        </label>
                        <select 
                            value={formData.role}
                            onChange={(e) => onFormChange('role', e.target.value)}
                            required
                            disabled={isReadOnly}
                        >
                            <option value="">בחר תפקיד</option>
                            {Object.entries(Config.roles).map(([key, value]) => (
                                <option key={key} value={key}>{value}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>
                            <i className="fas fa-user"></i>
                            שם העובד
                        </label>
                        <input 
                            type="text" 
                            value={formData.employeeName}
                            onChange={(e) => onFormChange('employeeName', e.target.value)}
                            required
                            disabled={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>
                            <i className="fas fa-user-tie"></i>
                            שם המעריך
                        </label>
                        <input 
                            type="text" 
                            value={formData.evaluatorName}
                            onChange={(e) => onFormChange('evaluatorName', e.target.value)}
                            required
                            disabled={isReadOnly}
                        />
                    </div>
                    <div className="form-group">
                        <label>
                            <i className="fas fa-calendar-alt"></i>
                            תאריך תחילת עבודה
                        </label>
                        <input 
                            type="date" 
                            value={formData.startDate}
                            onChange={(e) => onFormChange('startDate', e.target.value)}
                            required
                            disabled={isReadOnly}
                        />
                    </div>
                </div>
            </div>
        );
    }
});
// ComparisonView Component
const ComparisonView = React.createClass({
    chartInstance: null,

    componentDidMount() {
        this.createChart();
        window.addEventListener('resize', this.handleResize);
    },

    componentWillUnmount() {
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }
        window.removeEventListener('resize', this.handleResize);
    },

    handleResize: debounce(function() {
        this.createChart();
    }, Config.utils.constants.DEBOUNCE_DELAY),

    createChart() {
        const { employeeResponses, managerResponses } = this.props;
        const ctx = document.getElementById('comparisonChart').getContext('2d');
        
        // Prepare data for chart
        const chartData = {
            labels: [],
            employeeData: [],
            managerData: []
        };

        // Group questions by category for the chart
        Object.entries(Config.categories).forEach(([categoryKey, category]) => {
            Object.entries(category.questions).forEach(([questionKey, question]) => {
                if (!question.freeText && question.roles.includes(this.props.formData.role)) {
                    chartData.labels.push(question.text.substring(0, 30) + '...');
                    chartData.employeeData.push(employeeResponses[questionKey] || 0);
                    chartData.managerData.push(managerResponses[questionKey] || 0);
                }
            });
        });

        if (this.chartInstance) {
            this.chartInstance.destroy();
        }

        this.chartInstance = new Chart(ctx, Config.utils.getChartConfig(
            chartData.employeeData,
            chartData.managerData,
            chartData.labels
        ));
    },

    render() {
        const { employeeResponses, managerResponses, employeeNotes, managerNotes, formData } = this.props;
        const categoryAverages = Config.utils.calculateCategoryAverages(employeeResponses, formData.role);
        const gaps = Config.utils.analysis.findSignificantGaps(employeeResponses, managerResponses);
        const analysis = Config.utils.analysis.analyzeStrengthsWeaknesses(employeeResponses);
        const recommendations = Config.utils.analysis.generateRecommendations(analysis.weaknesses);

        return (
            <div className="comparison-container animate__animated animate__fadeIn">
                {/* Summary Header */}
                <div className="comparison-header">
                    <h2>סיכום הערכות</h2>
                    <div className="employee-details">
                        <div><strong>שם העובד:</strong> {formData.employeeName}</div>
                        <div><strong>תפקיד:</strong> {Config.roles[formData.role]}</div>
                        <div><strong>שם המעריך:</strong> {formData.evaluatorName}</div>
                        <div><strong>תאריך תחילת עבודה:</strong> {Config.utils.formatDate(formData.startDate)}</div>
                    </div>
                </div>

                {/* Radar Chart */}
                <div className="chart-container">
                    <canvas id="comparisonChart"></canvas>
                </div>

                {/* Category Averages */}
                <div className="category-averages">
                    <h3>ממוצעים לפי קטגוריה</h3>
                    <div className="averages-grid">
                        {Object.entries(categoryAverages).map(([categoryKey, data]) => (
                            <div key={categoryKey} className="average-card">
                                <h4>{Config.categories[categoryKey].title}</h4>
                                <div className="average-values">
                                    <span>עובד: {data.employee}</span>
                                    <span>מנהל: {data.manager}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Significant Gaps */}
                {gaps.length > 0 && (
                    <div className="gaps-section">
                        <h3>פערים משמעותיים</h3>
                        <div className="gaps-grid">
                            {gaps.map((gap, index) => (
                                <div key={index} className="gap-card significant-gap">
                                    <h4>{Config.utils.getQuestionText(gap.questionKey)}</h4>
                                    <div className="gap-details">
                                        <span>הערכת עובד: {gap.employeeRating}</span>
                                        <span>הערכת מנהל: {gap.managerRating}</span>
                                        <span>פער: {gap.gap}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Strengths and Weaknesses */}
                <div className="analysis-section">
                    <h3>חוזקות וחולשות</h3>
                    <div className="analysis-grid">
                        <div className="strength-section">
                            <h4>חוזקות</h4>
                            <ul>
                                {analysis.strengths.map((strength, index) => (
                                    <li key={index}>
                                        {Config.utils.getQuestionText(strength.questionKey)}
                                        <span className="rating-badge success">
                                            {strength.rating}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="weakness-section">
                            <h4>תחומים לשיפור</h4>
                            <ul>
                                {analysis.weaknesses.map((weakness, index) => (
                                    <li key={index}>
                                        {Config.utils.getQuestionText(weakness.questionKey)}
                                        <span className="rating-badge warning">
                                            {weakness.rating}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Recommendations */}
                {recommendations.length > 0 && (
                    <div className="recommendations-section">
                        <h3>המלצות לשיפור</h3>
                        <ul className="recommendations-list">
                            {recommendations.map((recommendation, index) => (
                                <li key={index} className="recommendation-item">
                                    {recommendation}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Export Buttons */}
                <div className="export-section">
                    <button 
                        className="export-btn"
                        onClick={() => this.handleExport('pdf')}
                    >
                        <i className="fas fa-file-pdf"></i>
                        ייצא ל-PDF
                    </button>
                    <button 
                        className="export-btn"
                        onClick={() => this.handleExport('excel')}
                    >
                        <i className="fas fa-file-excel"></i>
                        ייצא ל-Excel
                    </button>
                </div>
            </div>
        );
    }
});
// InitialForm Component
const InitialForm = React.createClass({
    getInitialState() {
        return {
            employeeEmail: '',
            managerEmail: '',
            isLoadingEmployee: false,
            isLoadingManager: false,
            employeeDetails: null,
            managerDetails: null,
            startDate: '',
            position: '',
            error: null
        };
    },

    handleEmployeeEmailCheck() {
        if (!Config.utils.validateEmail(this.state.employeeEmail)) {
            this.setState({ error: Config.utils.errorMessages.INVALID_EMAIL });
            return;
        }

        this.setState({ 
            isLoadingEmployee: true,
            error: null
        });
        
        // Simulate API call
        setTimeout(() => {
            const mockEmployeeData = {
                name: 'ישראל ישראלי',
                role: 'מפתח תוכנה',
                company: 'חברת הייטק',
                directManager: {
                    email: 'manager@company.com',
                    name: 'יעקב המנהל',
                    position: 'מנהל צוות'}
                };
    
                this.setState({
                    isLoadingEmployee: false,
                    employeeDetails: mockEmployeeData,
                    managerEmail: mockEmployeeData.directManager.email,
                    managerDetails: mockEmployeeData.directManager
                });
            }, 1000);
        },
    
        handleManagerEmailCheck() {
            if (!Config.utils.validateEmail(this.state.managerEmail)) {
                this.setState({ error: Config.utils.errorMessages.INVALID_EMAIL });
                return;
            }
    
            this.setState({ 
                isLoadingManager: true,
                error: null
            });
            
            setTimeout(() => {
                const mockManagerData = {
                    name: 'יעקב המנהל',
                    position: 'מנהל צוות'
                };
    
                this.setState({
                    isLoadingManager: false,
                    managerDetails: mockManagerData
                });
            }, 1000);
        },
    
        handleSubmit() {
            const { employeeDetails, managerDetails, startDate, position } = this.state;
            
            if (!employeeDetails || !managerDetails || !startDate || !position) {
                this.setState({ error: Config.utils.errorMessages.INCOMPLETE_FORM });
                return;
            }
    
            this.props.onComplete({
                employeeName: employeeDetails.name,
                evaluatorName: managerDetails.name,
                startDate,
                role: position
            });
        },
    
        render() {
            const { 
                employeeEmail, managerEmail, employeeDetails, managerDetails,
                isLoadingEmployee, isLoadingManager, startDate, position, error 
            } = this.state;
    
            return (
                <div className="initial-form animate__animated animate__fadeIn">
                    <h1>
                        <i className="fas fa-clipboard-check"></i>
                        טופס משוב
                    </h1>
                    
                    {error && (
                        <div className="error-message animate__animated animate__shake">
                            <i className="fas fa-exclamation-circle"></i>
                            {error}
                        </div>
                    )}
    
                    {/* Employee Email Step */}
                    <div className="form-step">
                        <div className="step-icon">
                            <i className="fas fa-user"></i>
                        </div>
                        <div className="step-content">
                            <h3>פרטי עובד</h3>
                            <div className="email-input-group">
                                <input
                                    type="email"
                                    className="email-input"
                                    placeholder="כתובת אימייל של העובד"
                                    value={employeeEmail}
                                    onChange={(e) => this.setState({employeeEmail: e.target.value})}
                                />
                                <button
                                    className="check-button"
                                    onClick={this.handleEmployeeEmailCheck}
                                    disabled={!employeeEmail || isLoadingEmployee}
                                >
                                    {isLoadingEmployee ? (
                                        <div className="loading-spinner"></div>
                                    ) : (
                                        <i className="fas fa-check"></i>
                                    )}
                                    אימות
                                </button>
                            </div>
                            {employeeDetails && (
                                <div className="user-details visible">
                                    <div className="user-details-row">
                                        <span className="user-details-label">שם:</span>
                                        <span>{employeeDetails.name}</span>
                                    </div>
                                    <div className="user-details-row">
                                        <span className="user-details-label">תפקיד:</span>
                                        <span>{employeeDetails.role}</span>
                                    </div>
                                    <div className="user-details-row">
                                        <span className="user-details-label">חברה:</span>
                                        <span>{employeeDetails.company}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
    
                    {/* Manager Email Step */}
                    <div className="form-step">
                        <div className="step-icon">
                            <i className="fas fa-user-tie"></i>
                        </div>
                        <div className="step-content">
                            <h3>פרטי מנהל</h3>
                            <div className="email-input-group">
                                <input
                                    type="email"
                                    className="email-input"
                                    placeholder="כתובת אימייל של המנהל"
                                    value={managerEmail}
                                    onChange={(e) => this.setState({managerEmail: e.target.value})}
                                />
                                <button
                                    className="check-button"
                                    onClick={this.handleManagerEmailCheck}
                                    disabled={!managerEmail || isLoadingManager}
                                >
                                    {isLoadingManager ? (
                                        <div className="loading-spinner"></div>
                                    ) : (
                                        <i className="fas fa-check"></i>
                                    )}
                                    אימות
                                </button>
                            </div>
                            {managerDetails && (
                                <div className="user-details visible">
                                    <div className="user-details-row">
                                        <span className="user-details-label">שם:</span>
                                        <span>{managerDetails.name}</span>
                                    </div>
                                    <div className="user-details-row">
                                        <span className="user-details-label">תפקיד:</span>
                                        <span>{managerDetails.position}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
    
                    {/* Start Date Step */}
                    <div className="form-step">
                        <div className="step-icon">
                            <i className="fas fa-calendar"></i>
                        </div>
                        <div className="step-content">
                            <h3>תאריך תחילת עבודה</h3>
                            <div className="date-input-group">
                                <input
                                    type="date"
                                    className="date-input"
                                    value={startDate}
                                    onChange={(e) => this.setState({startDate: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>
    
                    {/* Position Selection Step */}
                    <div className="form-step">
                        <div className="step-icon">
                            <i className="fas fa-briefcase"></i>
                        </div>
                        <div className="step-content">
                            <h3>בחירת תפקיד</h3>
                            <div className="select-input-group">
                                <select
                                    className="position-select"
                                    value={position}
                                    onChange={(e) => this.setState({position: e.target.value})}
                                >
                                    <option value="">בחר תפקיד</option>
                                    {Object.entries(Config.roles).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
    
                    <button
                        className="submit-btn"
                        onClick={this.handleSubmit}
                        disabled={!employeeDetails || !managerDetails || !startDate || !position}
                    >
                        המשך למשוב
                        <i className="fas fa-arrow-left"></i>
                    </button>
                </div>
            );
        }
    });
    
    // Main FeedbackForm Component
    const FeedbackForm = React.createClass({
        getInitialState() {
            return {
                step: 'employee',
                employeeResponses: {},
                managerResponses: {},
                employeeNotes: {},
                managerNotes: {}
            };
        },
    
        handleRatingChange(questionKey, value) {
            const responsesKey = `${this.state.step}Responses`;
            this.setState({
                [responsesKey]: {
                    ...this.state[responsesKey],
                    [questionKey]: value
                }
            });
        },
    
        handleNoteChange(questionKey, value) {
            const notesKey = `${this.state.step}Notes`;
            this.setState({
                [notesKey]: {
                    ...this.state[notesKey],
                    [questionKey]: value
                }
            });
        },
    
        validateCurrentStep() {
            const { step } = this.state;
            const responses = this.state[`${step}Responses`];
            let isValid = true;
    
            Object.entries(Config.categories).forEach(([categoryKey, category]) => {
                Object.entries(category.questions).forEach(([questionKey, question]) => {
                    if (question.roles.includes(this.props.initialData.role)) {
                        if (!question.freeText && !responses[questionKey]) {
                            isValid = false;
                        }
                    }
                });
            });
    
            return isValid;
        },
    
        handleSubmit() {
            if (!this.validateCurrentStep()) {
                alert(Config.utils.errorMessages.INCOMPLETE_FORM);
                return;
            }
    
            if (this.state.step === 'employee') {
                this.setState({ step: 'manager' });
            } else if (this.state.step === 'manager') {
                this.setState({ step: 'comparison' });
            }
        },
    
        render() {
            const { step } = this.state;
            const { initialData } = this.props;
    
            return (
                <div className="container">
                    {/* Progress Indicator */}
                    <div className="step-indicator">
                        <div className={`step-item ${step === 'employee' ? 'active' : ''} ${step === 'manager' || step === 'comparison' ? 'completed' : ''}`}>
                            <span className="step-number">1</span>
                            <span>הערכת עובד</span>
                        </div>
                        <div className={`step-item ${step === 'manager' ? 'active' : ''} ${step === 'comparison' ? 'completed' : ''}`}>
                            <span className="step-number">2</span>
                            <span>הערכת מנהל</span>
                        </div>
                        <div className={`step-item ${step === 'comparison' ? 'active' : ''}`}>
                            <span className="step-number">3</span>
                            <span>השוואת הערכות</span>
                        </div>
                    </div>
    
                    {/* Header */}
                    <Header 
                        formData={initialData}
                        onFormChange={() => {}}
                        isReadOnly={true}
                    />
    
                    {/* Main Content */}
                    {step !== 'comparison' ? (
                        <div>
                            {Object.entries(Config.categories).map(([categoryKey, category]) => (
                                <CategorySection
                                    key={categoryKey}
                                    category={category}
                                    responses={this.state[`${step}Responses`]}
                                    notes={this.state[`${step}Notes`]}
                                    onRatingChange={this.handleRatingChange}
                                    onNoteChange={this.handleNoteChange}
                                    selectedRole={initialData.role}
                                />
                            ))}
                            
                            <button 
                                className="submit-btn"
                                onClick={this.handleSubmit}
                                disabled={!this.validateCurrentStep()}
                            >
                                {step === 'employee' ? 
                                    'המשך להערכת מנהל' : 
                                    'הצג השוואת הערכות'}
                            </button>
                        </div>
                    ) : (
                        <ComparisonView
                            employeeResponses={this.state.employeeResponses}
                            managerResponses={this.state.managerResponses}
                            employeeNotes={this.state.employeeNotes}
                            managerNotes={this.state.managerNotes}
                            formData={initialData}
                        />
                    )}
                </div>
            );
        }
    });
    
    // Main App Component
    const App = React.createClass({
        getInitialState() {
            return {
                currentView: 'initial',
                formData: null
            };
        },
    
        handleInitialFormComplete(formData) {
            this.setState({
                currentView: 'feedback',
                formData
            });
        },
    
        render() {
            return (
                <div className="app-container">
                    {this.state.currentView === 'initial' ? (
                        <InitialForm onComplete={this.handleInitialFormComplete} />
                    ) : (
                        <FeedbackForm initialData={this.state.formData} />
                    )}
                </div>
            );
        }
    });
    
    // Helper function for debouncing
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Initialize the app
    ReactDOM.render(<App />, document.getElementById('app'));