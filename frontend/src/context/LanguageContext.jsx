import React, { createContext, useState, useContext } from 'react';

export const LanguageContext = createContext();

export const translations = {
    English: {
        // Navbar
        home: 'Home',
        myLearning: 'My Learning',
        notifications: 'Notifications',
        browse: 'Browse',
        searchPlaceholder: 'Search for skills, subjects or software',
        signIn: 'Sign In',
        joinNow: 'Join now',
        me: 'Me',
        settings: 'Settings & Privacy',
        helpCenter: 'Help Center',
        signOut: 'Sign Out',

        // Categories
        business: 'Business',
        technology: 'Technology',
        creative: 'Creative',
        webDev: 'Web Development',
        dataScience: 'Data Science',
        programming: 'Programming',

        // Home Page
        heroTitle: 'Learn the skills you need to succeed',
        heroSubtitle: 'Choose from thousands of courses taught by industry experts',
        exploreCourses: 'Explore Courses',
        continueLearning: 'Continue Learning',
        recommended: 'Recommended for You',
        trending: 'Trending Courses',
        seeAll: 'See all',
        startLearning: 'Start learning today',
        enrollToSee: 'Enroll in a course to see your progress here',

        // Course Catalog
        catalogTitle: 'Learn from FreeCodeCamp',
        catalogSubtitle: 'Master programming with free, certified courses from industry experts',
        filterBy: 'Filter by',
        sortBy: 'Sort by',
        enrollFree: 'Enroll Free',
        noCourses: 'No courses found',
        adjustSearch: 'Try adjusting your search terms',
        hours: 'hours',
        multipleLessons: 'Multiple lessons',

        // Dashboard
        inProgress: 'In Progress',
        completed: 'Completed',
        saved: 'Saved',
        downloadCertificate: 'Download Certificate',
        continue: 'Continue',

        // Settings
        account: 'Account',
        privacy: 'Privacy',
        billing: 'Billing & Subscription',
        language: 'Language',
        notificationsSettings: 'Notifications',
        saveChanges: 'Save Changes',

        // Course Detail
        about: 'About',
        syllabus: 'Syllabus',
        instructor: 'Instructor',
        enrollNow: 'Enroll Now',
        resume: 'Resume',
        alreadyEnrolled: 'You are already enrolled in this course',
        loginToAccess: "You'll need to sign in to access course content",
        courseSyllabus: 'Course Syllabus',
        module: 'Module',
        lesson: 'lesson',
        lessons: 'lessons',
        enrolling: 'Enrolling...',
        processing: 'Processing...',
        backToCourses: 'Back to courses',
        courseNotFound: 'Course not found',
        failedToLoadCourse: 'Failed to load course details',
        failedToEnroll: 'Failed to enroll',

        // Common
        loading: 'Loading...'
    },
    Español: {
        // ... (previous translations)

        // Course Detail
        about: 'Acerca de',
        syllabus: 'Temario',
        instructor: 'Instructor',
        enrollNow: 'Inscribirse ahora',
        resume: 'Reanudar',
        loginToAccess: 'Necesitarás iniciar sesión para acceder al contenido del curso',
        courseSyllabus: 'Temario del curso',
        module: 'Módulo',
        lesson: 'lección',
        lessons: 'lecciones',
        enrolling: 'Inscribiendo...',
        processing: 'Procesando...',
        continueLearning: 'Continuar aprendiendo',
        backToCourses: 'Volver a los cursos',
        courseNotFound: 'Curso no encontrado',
        failedToLoadCourse: 'Error al cargar los detalles del curso',
        failedToEnroll: 'Error al inscribirse',

        // Common
        loading: 'Cargando...'
    },
    Français: {
        // ... (previous translations)

        // Course Detail
        about: 'À propos',
        syllabus: 'Programme',
        instructor: 'Instructeur',
        enrollNow: 'S\'inscrire maintenant',
        resume: 'Reprendre',
        loginToAccess: 'Vous devrez vous connecter pour accéder au contenu du cours',
        courseSyllabus: 'Programme du cours',
        module: 'Module',
        lesson: 'leçon',
        lessons: 'leçons',
        enrolling: 'Inscription...',
        processing: 'Traitement...',
        continueLearning: 'Continuer l\'apprentissage',
        backToCourses: 'Retour aux cours',
        courseNotFound: 'Cours non trouvé',
        failedToLoadCourse: 'Échec du chargement des détails du cours',
        failedToEnroll: 'Échec de l\'inscription',

        // Common
        loading: 'Chargement...'
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('English');

    const t = (key) => {
        return translations[language]?.[key] || translations['English'][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
