// API Configuration
const API_CONFIG = {
    ENDPOINT: 'https://prod-21.westeurope.logic.azure.com:443/workflows/d26e2247617c4275869b19725db4e15a/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=VOKIdhCJr-KZ3BYFPT0cwSUHL5Iqe2eR1gTX2dt0HIQ',
    CURRENT_YEAR: new Date().getFullYear().toString()
};

// Survey Configuration
const SURVEY_CONFIG = {
    // Roles Configuration
    roles: {
        'developer': 'מפתח',
        'analyst': 'מנתח / מיישם',
        'projectManager': 'מנהל פרויקטים',
        'teamLead': 'ר"צ'
    },

    // Rating Scale Configuration
    ratingScale: {
        4: 'מצטיין מעל לנדרש',
        3: 'עבודה ע"פ הנדרש',
        2: 'נדרש שיפור',
        1: 'לא רלוונטי לתפקיד',
        0: 'לא מתאים'
    },

    // Categories and Questions Configuration
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

    // Messages Configuration
    messages: {
        success: {
            1: {
                title: 'תודה על מילוי השאלון!',
                message: 'התשובות שלך נשמרו בהצלחה. המנהל שלך יקבל הודעה למילוי חלקו בשאלון.',
                icon: 'fas fa-check-circle'
            },
            2: {
                title: 'תודה על מילוי השאלון!',
                message: 'התשובות שלך נשמרו בהצלחה. כעת ניתן לצפות בדוח ההשוואה.',
                icon: 'fas fa-clipboard-check'
            },
            3: {
                title: 'תהליך ההערכה הושלם!',
                message: 'תודה על השתתפותך בתהליך ההערכה השנתי.',
                icon: 'fas fa-award'
            }
        },
        errors: {
            invalidEmail: 'נא להזין כתובת אימייל תקינה',
            sameEmail: 'לא ניתן להזין את אותה כתובת אימייל עבור העובד והמנהל',
            existingSubmission: 'כבר מילאת את השאלון לשנה זו',
            invalidRole: 'נא לבחור תפקיד מהרשימה',
            incompleteForm: 'נא למלא את כל השדות הנדרשים',
            submissionFailed: 'שגיאה בשמירת הנתונים, נא לנסות שוב'
        }
    }
};

// Utility function to populate position select
function populatePositionSelect() {
    const positionSelect = document.getElementById('position');
    if (positionSelect) {
        positionSelect.innerHTML = '<option value="">בחר תפקיד</option>';
        Object.entries(SURVEY_CONFIG.roles).forEach(([value, label]) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = label;
            positionSelect.appendChild(option);
        });
    }
}

// Export configurations
window.API_CONFIG = API_CONFIG;
window.SURVEY_CONFIG = SURVEY_CONFIG;
window.populatePositionSelect = populatePositionSelect;