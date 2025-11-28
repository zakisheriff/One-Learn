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
        lessons: 'Multiple lessons',

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

        // Common
        loading: 'Loading...'
    },
    Español: {
        // Navbar
        home: 'Inicio',
        myLearning: 'Mi aprendizaje',
        notifications: 'Notificaciones',
        browse: 'Navegar',
        searchPlaceholder: 'Buscar habilidades, temas o software',
        signIn: 'Iniciar sesión',
        joinNow: 'Únete ahora',
        me: 'Yo',
        settings: 'Ajustes y privacidad',
        helpCenter: 'Centro de ayuda',
        signOut: 'Cerrar sesión',

        // Categories
        business: 'Negocios',
        technology: 'Tecnología',
        creative: 'Creativo',
        webDev: 'Desarrollo Web',
        dataScience: 'Ciencia de Datos',
        programming: 'Programación',

        // Home Page
        heroTitle: 'Aprende las habilidades que necesitas para triunfar',
        heroSubtitle: 'Elige entre miles de cursos impartidos por expertos de la industria',
        exploreCourses: 'Explorar cursos',
        continueLearning: 'Continuar aprendiendo',
        recommended: 'Recomendado para ti',
        trending: 'Cursos en tendencia',
        seeAll: 'Ver todo',
        startLearning: 'Empieza a aprender hoy',
        enrollToSee: 'Inscríbete en un curso para ver tu progreso aquí',

        // Course Catalog
        catalogTitle: 'Aprende con FreeCodeCamp',
        catalogSubtitle: 'Domina la programación con cursos gratuitos y certificados',
        filterBy: 'Filtrar por',
        sortBy: 'Ordenar por',
        enrollFree: 'Inscribirse gratis',
        noCourses: 'No se encontraron cursos',
        adjustSearch: 'Intenta ajustar tus términos de búsqueda',
        hours: 'horas',
        lessons: 'Múltiples lecciones',

        // Dashboard
        inProgress: 'En progreso',
        completed: 'Completado',
        saved: 'Guardado',
        downloadCertificate: 'Descargar certificado',
        continue: 'Continuar',

        // Settings
        account: 'Cuenta',
        privacy: 'Privacidad',
        billing: 'Facturación y suscripción',
        language: 'Idioma',
        notificationsSettings: 'Notificaciones',
        saveChanges: 'Guardar cambios',

        // Course Detail
        about: 'Acerca de',
        syllabus: 'Temario',
        instructor: 'Instructor',
        enrollNow: 'Inscribirse ahora',
        resume: 'Reanudar',

        // Common
        loading: 'Cargando...'
    },
    Français: {
        // Navbar
        home: 'Accueil',
        myLearning: 'Mon apprentissage',
        notifications: 'Notifications',
        browse: 'Parcourir',
        searchPlaceholder: 'Rechercher des compétences, des sujets ou des logiciels',
        signIn: 'Se connecter',
        joinNow: 'Rejoindre maintenant',
        me: 'Moi',
        settings: 'Paramètres et confidentialité',
        helpCenter: 'Centre d\'aide',
        signOut: 'Se déconnecter',

        // Categories
        business: 'Affaires',
        technology: 'Technologie',
        creative: 'Créatif',
        webDev: 'Développement Web',
        dataScience: 'Science des Données',
        programming: 'Programmation',

        // Home Page
        heroTitle: 'Apprenez les compétences dont vous avez besoin pour réussir',
        heroSubtitle: 'Choisissez parmi des milliers de cours dispensés par des experts',
        exploreCourses: 'Explorer les cours',
        continueLearning: 'Continuer l\'apprentissage',
        recommended: 'Recommandé pour vous',
        trending: 'Cours tendance',
        seeAll: 'Tout voir',
        startLearning: 'Commencez à apprendre aujourd\'hui',
        enrollToSee: 'Inscrivez-vous à un cours pour voir vos progrès ici',

        // Course Catalog
        catalogTitle: 'Apprenez avec FreeCodeCamp',
        catalogSubtitle: 'Maîtrisez la programmation avec des cours gratuits et certifiés',
        filterBy: 'Filtrer par',
        sortBy: 'Trier par',
        enrollFree: 'S\'inscrire gratuitement',
        noCourses: 'Aucun cours trouvé',
        adjustSearch: 'Essayez d\'ajuster vos termes de recherche',
        hours: 'heures',
        lessons: 'Plusieurs leçons',

        // Dashboard
        inProgress: 'En cours',
        completed: 'Terminé',
        saved: 'Enregistré',
        downloadCertificate: 'Télécharger le certificat',
        continue: 'Continuer',

        // Settings
        account: 'Compte',
        privacy: 'Confidentialité',
        billing: 'Facturation et abonnement',
        language: 'Langue',
        notificationsSettings: 'Notifications',
        saveChanges: 'Enregistrer les modifications',

        // Course Detail
        about: 'À propos',
        syllabus: 'Programme',
        instructor: 'Instructeur',
        enrollNow: 'S\'inscrire maintenant',
        resume: 'Reprendre',

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
