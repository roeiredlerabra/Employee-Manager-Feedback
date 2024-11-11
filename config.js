// config.js
const Config = {
    // Roles configuration
    roles: {
        'developer': 'מפתח',
        'analyst': 'מנתח / מיישם',
        'projectManager': 'מנהל פרויקטים',
        'teamLead': 'ר"צ'
    },

    // Rating scale configuration
    ratingScale: {
        4: 'מצטיין מעל לנדרש',
        3: 'עבודה ע"פ הנדרש',
        2: 'נדרש שיפור',
        1: 'לא רלוונטי לתפקיד',
        0: 'לא מתאים'
    },

    // Categories and questions configuration
    categories: {
        professionalKnowledge: {
            title: 'ידע מקצועי',
            icon: 'fas fa-brain',
            questions: {
                productProficiency: {
                    text: 'בקיאות במוצר – עד כמה העובד מבין לעומק את המוצר, כולל רכיבים טכניים ותפעוליים?',
                    roles: ['developer', 'analyst', 'projectManager', 'teamLead']
                },
                methodology: {
                    text: 'הכרות עם מתודולוגיות הפרויקט – כיצד העובד מיישם את שיטות העבודה המתודולוגיות בפרויקטים השונים?',
                    roles: ['developer', 'analyst', 'projectManager', 'teamLead']
                },
                clientEnvironment: {
                    text: 'הכרות מקצועית עם סביבת הלקוחות – עד כמה העובד מבין את הצרכים העסקיים של הלקוחות ומתאים את הפתרונות בהתאם?',
                    roles: ['developer', 'analyst', 'projectManager', 'teamLead']
                },
                opportunityIdentification: {
                    text: 'זיהוי הזדמנויות אצל הלקוח – האם העובד מזהה אפשרויות להרחבת פתרונות ושירותים קיימים?',
                    roles: ['developer', 'analyst', 'projectManager', 'teamLead']
                },
                professionalDevelopment: {
                    text: 'השתתפות בוובינרים / העשרות מקצועיות – כיצד העובד משתתף בלמידה והעשרה מתמשכת?',
                    roles: ['developer', 'analyst', 'projectManager', 'teamLead']
                },
                complementaryProducts: {
                    text: 'הכרות עם מוצרים משלימים – עד כמה העובד מכיר מוצרים רלוונטיים נוספים?',
                    roles: ['developer', 'analyst', 'projectManager', 'teamLead']
                }
            }
        },
        workSkills: {
            title: 'מיומנויות עבודה',
            icon: 'fas fa-tools',
            questions: {
                selfManagement: {
                    text: 'יכולת ניהול עצמי – האם העובד מצליח לעבוד בצורה עצמאית תוך ייזום פתרונות?',
                    roles: ['developer', 'analyst', 'projectManager', 'teamLead']
                },
                pressureHandling: {
                    text: 'יכולת עבודה תחת לחץ – כיצד העובד מתמודד עם משימות דחופות או תחת עומס?',
                    roles: ['developer', 'analyst', 'projectManager', 'teamLead']
                },
                responsibility: {
                    text: 'אחריות מקצועית – האם העובד לוקח אחריות מלאה על המשימות שלו?',
                    roles: ['developer', 'analyst', 'projectManager', 'teamLead']
                },
                teamwork: {
                    text: 'שיתוף פעולה ועבודת צוות – באיזו מידה העובד משתף פעולה ומכבד דעות שונות בצוות?',
                    roles: ['developer', 'analyst', 'projectManager', 'teamLead']
                },
                proceduresAdherence: {
                    text: 'הקפדה על נהלים – באיזו מידה העובד מקפיד על נהלי העבודה?',
                    roles: ['developer', 'analyst', 'projectManager', 'teamLead']
                },
                communication: {
                    text: 'תקשורת אפקטיבית – כיצד העובד מנהל תקשורת עם צוותים אחרים?',
                    roles: ['developer', 'analyst', 'projectManager', 'teamLead']
                }
            }
        },
        attitudeAndMotivation: {
            title: 'גישה ומוטיבציה',
            icon: 'fas fa-chart-line',
            questions: {
                socialInvolvement: {
                    text: 'מעורבות חברתית – עד כמה העובד תורם לאווירה החברתית והמקצועית בצוות?',
                    roles: ['developer', 'analyst', 'projectManager', 'teamLead']
                },
                feedbackReception: {
                    text: 'קבלת ביקורת – כיצד העובד מתמודד עם ביקורות ומשובים?',
                    roles: ['developer', 'analyst', 'projectManager', 'teamLead']
                },
                improvementMotivation: {
                    text: 'מוטיבציה לייעול ושיפור – באיזו מידה העובד מעלה רעיונות חדשים?',
                    roles: ['developer', 'analyst', 'projectManager', 'teamLead']
                },
                selfLearning: {
                    text: 'למידה עצמאית – האם העובד מראה יוזמה ללמידה מתמשכת?',
                    roles: ['developer', 'analyst', 'projectManager', 'teamLead']
                }
            }
        },
        workStyle: {
            title: 'סגנון עבודה',
            icon: 'fas fa-tasks',
            questions: {
                organization: {
                    text: 'סדר וארגון בעבודה – עד כמה העובד שומר על סביבת עבודה מאורגנת ומסודרת?',
                    roles: ['developer', 'analyst', 'projectManager', 'teamLead']
                },
                timeManagement: {
                    text: 'עמידה בזמנים – באיזו מידה העובד מקפיד על עמידה בלוחות זמנים?',
                    roles: ['developer', 'analyst', 'projectManager', 'teamLead']
                },
                projectManagement: {
                    text: 'ניהול פרויקטים – האם העובד מצליח לנהל פרויקטים תוך שמירה על יעדים ברורים?',
                    roles: ['projectManager', 'teamLead']
                }
            }
        },
        selfAssessment: {
            title: 'מדידה עצמית',
            icon: 'fas fa-clipboard-check',
            questions: {
                performanceSatisfaction: {
                    text: 'רמת שביעות רצון מהביצועים – כיצד את/ה מדרג את שביעות הרצון הכללית שלך מהביצועים האישיים?',
                    roles: ['developer', 'analyst', 'projectManager', 'teamLead']
                },
                improvementAreas: {
                    text: 'תחומים לשיפור – אילו תחומים את/ה מזהה שבהם תוכל/י להשתפר?',
                    roles: ['developer', 'analyst', 'projectManager', 'teamLead'],
                    freeText: true
                },
                achievements: {
                    text: 'הישגים בולטים – מהם ההישגים המרכזיים שהשגת בתקופה האחרונה?',
                    roles: ['developer', 'analyst', 'projectManager', 'teamLead'],
                    freeText: true
                }
            }
        },
        managerialSkills: {
            title: 'מיומנויות ניהוליות',
            icon: 'fas fa-users-cog',
            questions: {
                decisionMaking: {
                    text: 'קבלת החלטות – קבלת החלטות במהירות ובביטחון, תוך הערכה נכונה של המצב',
                    roles: ['projectManager', 'teamLead']
                },
                timeAndPriorities: {
                    text: 'ניהול זמן וסדר עדיפויות – ניהול זמן/משימות אפקטיבי של הצוות',
                    roles: ['projectManager', 'teamLead']
                },
                flexibility: {
                    text: 'גמישות והתאמה לשינויים – יכולת הסתגלות והתמודדות עם שינויים בפרויקטים',
                    roles: ['projectManager', 'teamLead']
                },
                goalSetting: {
                    text: 'הצבת יעדים ברורים – באיזו מידה המנהל מציב לעובדיו יעדים ברורים ומדידים?',
                    roles: ['projectManager', 'teamLead']
                },
                motivation: {
                    text: 'יכולת להניע את העובדים לביצועים מיטביים',
                    roles: ['projectManager', 'teamLead']
                },
                resourceManagement: {
                    text: 'ניצול משאבים – האם המנהל מנצל את המשאבים העומדים לרשותו באופן אפקטיבי?',
                    roles: ['projectManager', 'teamLead']
                },
                employeeDevelopment: {
                    text: 'קידום ופיתוח עובדים – באיזו מידה המנהל מצליח לקדם את עובדיו מקצועית ואישית?',
                    roles: ['projectManager', 'teamLead']
                },
                lessonsLearned: {
                    text: 'למידה מלקחים – האם המנהל לומד מהצלחות ואי-הצלחות ומיישם את הלקחים?',
                    roles: ['projectManager', 'teamLead']
                }
            }
        }
    },

    // Utility functions
    utils: {
        getQuestionText: (questionKey) => {
            for (const [categoryKey, category] of Object.entries(Config.categories)) {
                if (category.questions[questionKey]) {
                    return {
                        text: category.questions[questionKey].text,
                        category: category.title,
                        categoryKey: categoryKey
                    };
                }
            }
            return {
                text: 'שאלה לא נמצאה',
                category: '',
                categoryKey: ''
            };
        },
        // Form validation
        validateForm: (formData) => {
            const requiredFields = ['role', 'employeeName', 'evaluatorName', 'startDate'];
            return requiredFields.every(field => formData[field] && formData[field].trim() !== '');
        },

        validateEmail: (email) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },

        // Format date to local string
        formatDate: (date) => {
            return new Date(date).toLocaleDateString('he-IL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        },

        // Calculate category averages
        calculateCategoryAverages: (responses, role) => {
            const averages = {};
            Object.entries(Config.categories).forEach(([categoryKey, category]) => {
                let sum = 0;
                let count = 0;

                Object.entries(category.questions).forEach(([questionKey, question]) => {
                    if (!question.freeText && question.roles.includes(role) && responses[questionKey]) {
                        sum += responses[questionKey];
                        count++;
                    }
                });

                if (count > 0) {
                    averages[categoryKey] = {
                        average: (sum / count).toFixed(1),
                        questionsCount: count
                    };
                }
            });
            return averages;
        },

        // Get radar chart configuration
        getChartConfig: (employeeData, managerData, labels) => {
            return {
                type: 'radar',
                data: {
                    labels,
                    datasets: [
                        {
                            label: 'הערכת עובד',
                            data: employeeData,
                            backgroundColor: 'rgba(37, 99, 235, 0.2)',
                            borderColor: 'rgba(37, 99, 235, 1)',
                            pointBackgroundColor: 'rgba(37, 99, 235, 1)',
                            borderWidth: 2,
                        },
                        {
                            label: 'הערכת מנהל',
                            data: managerData,
                            backgroundColor: 'rgba(100, 116, 139, 0.2)',
                            borderColor: 'rgba(100, 116, 139, 1)',
                            pointBackgroundColor: 'rgba(100, 116, 139, 1)',
                            borderWidth: 2,
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 4,
                            min: 0,
                            ticks: {
                                stepSize: 1,
                                callback: function(value) {
                                    return Config.ratingScale[value];
                                }
                            },
                            pointLabels: {
                                font: {
                                    size: 12
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const value = context.raw;
                                    return `${context.dataset.label}: ${value} - ${Config.ratingScale[Math.round(value)]}`;
                                }
                            }
                        }
                    }
                }
            };
        },

        // Calculate rating gap classification
        getRatingGapClass: (employeeRating, managerRating) => {
            if (!employeeRating || !managerRating) return '';
            const diff = Math.abs(employeeRating - managerRating);
            // Continue from getRatingGapClass
            if (diff === 0) return 'match';
            if (diff >= 2) return 'significant-gap';
            return 'minor-gap';
        },

        // Get filtered questions for role
        getQuestionsForRole: (role) => {
            const roleQuestions = {};
            Object.entries(Config.categories).forEach(([categoryKey, category]) => {
                const filteredQuestions = Object.entries(category.questions)
                    .filter(([_, question]) => question.roles.includes(role));
                if (filteredQuestions.length > 0) {
                    roleQuestions[categoryKey] = {
                        ...category,
                        questions: Object.fromEntries(filteredQuestions)
                    };
                }
            });
            return roleQuestions;
        },

        // Calculate overall score
        calculateOverallScore: (responses) => {
            let sum = 0;
            let count = 0;
            Object.values(responses).forEach(rating => {
                if (typeof rating === 'number') {
                    sum += rating;
                    count++;
                }
            });
            return count > 0 ? (sum / count).toFixed(2) : 0;
        },

        // Generate PDF configuration
        pdfConfig: {
            pageSize: 'A4',
            pageOrientation: 'portrait',
            pageMargins: [40, 60, 40, 60],
            defaultStyle: {
                direction: 'rtl',
                font: 'Roboto'
            },
            footer: (currentPage, pageCount) => ({
                text: `עמוד ${currentPage} מתוך ${pageCount}`,
                alignment: 'center',
                margin: [0, 20]
            })
        },

        // Export data functions
        exportFunctions: {
            toJSON: (data) => {
                return JSON.stringify(data, null, 2);
            },
            toCSV: (data) => {
                // CSV export implementation
                const headers = ['קטגוריה', 'שאלה', 'הערכת עובד', 'הערכת מנהל', 'פער'];
                const rows = [];
                
                Object.entries(Config.categories).forEach(([categoryKey, category]) => {
                    Object.entries(category.questions).forEach(([questionKey, question]) => {
                        if (data.employeeResponses[questionKey] || data.managerResponses[questionKey]) {
                            rows.push([
                                category.title,
                                question.text,
                                data.employeeResponses[questionKey] || '',
                                data.managerResponses[questionKey] || '',
                                Math.abs((data.employeeResponses[questionKey] || 0) - 
                                       (data.managerResponses[questionKey] || 0))
                            ]);
                        }
                    });
                });

                return [headers, ...rows]
                    .map(row => row.join(','))
                    .join('\n');
            }
        },

        // Feedback analysis functions
        analysis: {
            // Identify significant gaps
            findSignificantGaps: (employeeResponses, managerResponses) => {
                const gaps = [];
                Object.entries(employeeResponses).forEach(([questionKey, employeeRating]) => {
                    const managerRating = managerResponses[questionKey];
                    if (Math.abs(employeeRating - managerRating) >= 2) {
                        gaps.push({
                            questionKey,
                            employeeRating,
                            managerRating,
                            gap: Math.abs(employeeRating - managerRating)
                        });
                    }
                });
                return gaps.sort((a, b) => b.gap - a.gap);
            },

            // Calculate strengths and weaknesses
            analyzeStrengthsWeaknesses: (responses) => {
                const analysis = {
                    strengths: [],
                    weaknesses: []
                };

                Object.entries(responses).forEach(([questionKey, rating]) => {
                    if (typeof rating === 'number') {
                        const category = Object.entries(Config.categories).find(([_, cat]) => 
                            Object.keys(cat.questions).includes(questionKey)
                        );

                        if (rating >= 4) {
                            analysis.strengths.push({
                                questionKey,
                                rating,
                                category: category[1].title
                            });
                        } else if (rating <= 2) {
                            analysis.weaknesses.push({
                                questionKey,
                                rating,
                                category: category[1].title
                            });
                        }
                    }
                });

                return analysis;
            },

            // Generate development recommendations
            generateRecommendations: (weaknesses) => {
                const recommendations = new Set();
                weaknesses.forEach(weakness => {
                    switch(weakness.category) {
                        case 'ידע מקצועי':
                            recommendations.add('השתתפות בהכשרות מקצועיות והעשרה טכנית');
                            break;
                        case 'מיומנויות עבודה':
                            recommendations.add('שיפור מיומנויות ניהול זמן ותעדוף משימות');
                            break;
                        case 'גישה ומוטיבציה':
                            recommendations.add('השתתפות בסדנאות פיתוח אישי ומקצועי');
                            break;
                        case 'סגנון עבודה':
                            recommendations.add('פיתוח כישורי ניהול וארגון');
                            break;
                        case 'מיומנויות ניהוליות':
                            recommendations.add('השתתפות בתוכנית פיתוח מנהלים');
                            break;
                    }
                });
                return Array.from(recommendations);
            }
        },

        // Constants
        constants: {
            MIN_RATING: 0,
            MAX_RATING: 4,
            SIGNIFICANT_GAP_THRESHOLD: 2,
            MIN_QUESTIONS_FOR_VALID_AVERAGE: 3,
            DEFAULT_CHART_HEIGHT: 400,
            MOBILE_CHART_HEIGHT: 300,
            ANIMATION_DURATION: 500,
            DEBOUNCE_DELAY: 250,
            DATE_FORMAT: 'DD/MM/YYYY',
            LOCAL_STORAGE_KEY: 'feedbackFormData'
        },

        // Error messages
        errorMessages: {
            INVALID_EMAIL: 'כתובת אימייל לא תקינה',
            REQUIRED_FIELD: 'שדה חובה',
            INVALID_DATE: 'תאריך לא תקין',
            NETWORK_ERROR: 'שגיאת תקשורת, נסה שנית',
            INVALID_ROLE: 'יש לבחור תפקיד',
            INCOMPLETE_FORM: 'יש למלא את כל השדות הנדרשים',
            INVALID_RATING: 'דירוג לא תקין',
            SAVE_ERROR: 'שגיאה בשמירת הנתונים'
        }
    }
};

// Export the configuration
window.Config = Config;