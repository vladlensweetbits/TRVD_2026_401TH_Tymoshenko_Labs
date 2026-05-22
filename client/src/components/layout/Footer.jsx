import React from 'react';
import { useLanguage } from '../../store/context/LanguageContext';

const Footer = () => {
    const { t } = useLanguage();

    const socials = [
        {
            name: 'Instagram',
            href: '#',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <circle cx="12" cy="12" r="4"/>
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
                </svg>
            ),
        },
        {
            name: 'TikTok',
            href: '#',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
                </svg>
            ),
        },
        {
            name: 'Facebook',
            href: '#',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
            ),
        },
        {
            name: 'X',
            href: '#',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4l16 16M4 20L20 4"/>
                </svg>
            ),
        },
    ];

    return (
        <footer className="footer">
            <div className="footer-inner">
                <div className="footer-brand">ComTech</div>
                <div className="footer-socials">
                    {socials.map((social) => (
                    <a
                        key={social.name}
                        href={social.href}
                        title={social.name}
                        className="footer-social-link"
                        >
                    {social.icon}
                        </a>
                        ))}
                </div>
                <div className="footer-copy">
                    © {new Date().getFullYear()} ComTech. {t('footer_rights')}
                </div>
            </div>
        </footer>
    );
};

export default Footer;