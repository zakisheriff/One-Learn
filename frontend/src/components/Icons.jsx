// LinkedIn Learning Style SVG Icons
import React from 'react';

export const HomeIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 22V12H15V22M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const BookIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20M4 19.5C4 20.163 4.26339 20.7989 4.73223 21.2678C5.20107 21.7366 5.83696 22 6.5 22H20V2H6.5C5.83696 2 5.20107 2.26339 4.73223 2.73223C4.26339 3.20107 4 3.83696 4 4.5V19.5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const SearchIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const UserIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const DashboardIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const LogoutIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const ClockIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 6V12L16 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const StarIcon = ({ size = 20, color = 'currentColor', filled = false }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const PlayIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 3L19 12L5 21V3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const CheckIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6L9 17L4 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const ArrowRightIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const MenuIcon = ({ size = 24, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12H21M3 6H21M3 18H21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
export const GlobeIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 12H22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const LessonIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 3H22V21H2V3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 3V21" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 8H12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 13H12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 18H12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 8H22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 13H22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 18H22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
export const BrowseIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 6H20M4 12H20M4 18H20" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const NotificationIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const ChevronDownIcon = ({ size = 16, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9L12 15L18 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
export const LockIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const CreditCardIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 4H3C1.89543 4 1 4.89543 1 6V18C1 19.1046 1.89543 20 3 20H21C22.1046 20 23 19.1046 23 18V6C23 4.89543 22.1046 4 21 4Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M1 10H23" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const CoffeeIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 8H19C20.1046 8 21.1634 8.43883 21.9445 9.21989C22.7256 10.001 23.1644 11.0602 23.1644 12.1648C23.1644 13.2694 22.7256 14.3286 21.9445 15.1097C21.1634 15.8907 20.1046 16.3296 19 16.3296H18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 8H18V14C18 15.0609 17.5786 16.0783 16.8284 16.8284C16.0783 17.5786 15.0609 18 14 18H6C4.93913 18 3.92172 17.5786 3.17157 16.8284C2.42143 16.0783 2 15.0609 2 14V8Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 1V4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 1V4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 1V4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const ChevronRightIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 18L15 12L9 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const ChevronLeftIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18L9 12L15 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
export const LinkedInIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 9H2V21H6V9Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 6C5.10457 6 6 5.10457 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const TwitterIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M23 3C22.0424 3.67548 20.9821 4.19211 19.86 4.53C19.2577 3.83751 18.4573 3.34675 17.567 3.12398C16.6767 2.90121 15.7395 2.95725 14.8821 3.28451C14.0247 3.61177 13.2884 4.19446 12.773 4.95377C12.2575 5.71309 11.9877 6.61239 12 7.53V8.53C10.2426 8.57557 8.50127 8.18581 6.93101 7.39545C5.36074 6.60508 4.01032 5.43864 3 4C3 4 -1 13 8 17C5.94053 18.398 3.48716 19.0989 1 19C10 24 21 19 21 7.5C20.9991 7.22145 20.9723 6.94359 20.92 6.67C21.9406 5.66349 22.6608 4.39271 23 3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const InstagramIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17 2H7C4.23858 2 2 4.23858 2 7V17C2 19.7614 4.23858 22 7 22H17C19.7614 22 22 19.7614 22 17V7C22 4.23858 19.7614 2 17 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17.5 6.5H17.51" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const GitHubIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 19C9 19 9.00001 16.0589 9 14.1765C9 13.1176 9.6 12.5294 10.2 12.2353C7.2 11.8824 4.2 10.8235 4.2 6.11765C4.2 4.82353 4.8 3.64706 5.7 2.82353C5.7 2.82353 5.4 1.64706 6 0.470588C6 0.470588 7.2 0.117647 9.6 1.76471C10.8 1.41176 12 1.41176 13.2 1.76471C15.6 0.117647 16.8 0.470588 16.8 0.470588C17.4 1.64706 17.1 2.82353 17.1 2.82353C18 3.64706 18.6 4.82353 18.6 6.11765C18.6 10.8235 15.6 11.8824 12.6 12.2353C13.2 12.8235 13.8 13.7647 13.8 15.2941C13.8 17.4706 13.8 19 13.8 19" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
export const CodeIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 18L22 12L16 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 6L2 12L8 18" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const ChartBarIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 20V10" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 20V4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 20V14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const PenToolIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 19L19 12L22 15L15 22L12 19Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 13L16.5 5.5L2 2L5.5 16.5L13 18L18 13Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 2L9.586 9.586" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11 13C11 13 11 13 11 13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const RocketIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.5 16.5C6.98528 16.5 9 14.4853 9 12C9 9.51472 6.98528 7.5 4.5 7.5C2.01472 7.5 0 9.51472 0 12C0 14.4853 2.01472 16.5 4.5 16.5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 15L9 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 15C12 15 13.5 15 15 13.5C16.5 12 16.5 10.5 16.5 10.5L21 6L18 3L13.5 7.5C13.5 7.5 12 7.5 10.5 9C9 10.5 9 12 9 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export const TargetIcon = ({ size = 20, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="2" fill={color} />
    </svg>
);
