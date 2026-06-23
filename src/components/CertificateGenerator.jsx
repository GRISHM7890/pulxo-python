import React, { useState, useEffect } from 'react';
import { Award, Printer, ArrowLeft, Sparkles, Calendar, User, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CertificateGenerator = ({ onClose }) => {
    const { user, profile } = useAuth();
    
    const [name, setName] = useState(profile?.name || user?.displayName || '');
    const [course, setCourse] = useState('CBSE 12th Python Programming');
    const [date, setDate] = useState(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    const [signer, setSigner] = useState('Dr. Higgsfield AI');
    const [template, setTemplate] = useState('orange'); // orange, waves, neon, wizard
    const [certId, setCertId] = useState('');

    // Auto-update signatory and course translation when template changes
    useEffect(() => {
        if (template === 'wizard') {
            setSigner('Albus Dumbledore, Headmaster');
        } else {
            setSigner('Dr. Higgsfield AI');
        }
    }, [template]);

    // Map courses to their Hogwarts/Magical equivalents
    const getMagicalCourse = (standardCourse) => {
        const magicMap = {
            'CBSE 12th Python Programming': 'Defence Against the Dark Arts (Python 3)',
            'SQL & DBMS Lab Mastery': 'Potions & Database Alchemy',
            'Advanced Algorithmic Logic': 'Ancient Runes & Arithmancy',
            'Artificial Intelligence & Neural Nets': 'Divination & Seer Networks',
            'Higgsfield Python Engine Sandbox': 'Care of Magical Code Engines'
        };
        return magicMap[standardCourse] || standardCourse;
    };

    // Generate a random certificate ID on mount/name change
    useEffect(() => {
        const randomId = 'HF-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        setCertId(randomId);
    }, [name, course]);

    // Handle printing
    const handlePrint = () => {
        window.print();
    };

    return (
        <div style={styles.container}>
            {/* Styles for print layout */}
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-certificate, #printable-certificate * {
                        visibility: visible;
                    }
                    #printable-certificate {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100vw;
                        height: 100vh;
                        max-width: 100%;
                        max-height: 100%;
                        margin: 0;
                        padding: 0;
                        transform: scale(1);
                        box-shadow: none !important;
                        border: none !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}} />

            {/* Header */}
            <div style={styles.header} className="no-print">
                <div style={styles.headerLeft}>
                    <button style={styles.backBtn} onClick={onClose}>
                        <ArrowLeft size={16} /> Back
                    </button>
                    <div>
                        <h2 style={styles.title}>Neural Certificate Authority</h2>
                        <p style={styles.subtitle}>Generate and customize your achievement certificate</p>
                    </div>
                </div>
                <div style={styles.headerRight}>
                    <button style={styles.printBtn} onClick={handlePrint}>
                        <Printer size={16} /> Print / Save PDF
                    </button>
                </div>
            </div>

            <div style={styles.contentLayout}>
                {/* Form Editor */}
                <div style={styles.editorPanel} className="no-print">
                    <h3 style={styles.panelTitle}>Certificate Details</h3>
                    
                    <div style={styles.formGroup}>
                        <label style={styles.label}><User size={14} /> Student Full Name</label>
                        <input 
                            type="text" 
                            style={styles.input} 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder="Enter full name"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}><Award size={14} /> Course / Topic</label>
                        <select 
                            style={styles.select} 
                            value={course} 
                            onChange={(e) => setCourse(e.target.value)}
                        >
                            <option value="CBSE 12th Python Programming">CBSE 12th Python Programming</option>
                            <option value="SQL & DBMS Lab Mastery">SQL & DBMS Lab Mastery</option>
                            <option value="Advanced Algorithmic Logic">Advanced Algorithmic Logic</option>
                            <option value="Artificial Intelligence & Neural Nets">Artificial Intelligence & Neural Nets</option>
                            <option value="Higgsfield Python Engine Sandbox">Higgsfield Python Engine Sandbox</option>
                        </select>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}><Calendar size={14} /> Date of Issue</label>
                        <input 
                            type="text" 
                            style={styles.input} 
                            value={date} 
                            onChange={(e) => setDate(e.target.value)} 
                            placeholder="Date"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}><Shield size={14} /> Authorized Signatory</label>
                        <input 
                            type="text" 
                            style={styles.input} 
                            value={signer} 
                            onChange={(e) => setSigner(e.target.value)} 
                            placeholder="Signatory"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Design Theme</label>
                        <div style={styles.themeRow}>
                            <button 
                                style={{
                                    ...styles.themeBtn, 
                                    border: template === 'orange' ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                                    backgroundColor: '#f9b828',
                                    color: '#2c1e4d'
                                }}
                                onClick={() => setTemplate('orange')}
                            >
                                <span style={{...styles.colorDot, background: 'linear-gradient(135deg, #f9b828, #3f2b6e)'}} />
                                Vibrant Orange
                            </button>
                            <button 
                                style={{
                                    ...styles.themeBtn, 
                                    border: template === 'wizard' ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                                    backgroundColor: '#fbf7eb',
                                    color: '#4a2c11'
                                }}
                                onClick={() => setTemplate('wizard')}
                            >
                                <span style={{...styles.colorDot, background: 'linear-gradient(135deg, #78350f, #e8dcb9)'}} />
                                ⚡ Wizarding Magic (Harry Potter)
                            </button>
                            <button 
                                style={{
                                    ...styles.themeBtn, 
                                    border: template === 'waves' ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                                    backgroundColor: '#ffffff',
                                    color: '#0f172a'
                                }}
                                onClick={() => setTemplate('waves')}
                            >
                                <span style={{...styles.colorDot, background: 'linear-gradient(135deg, #d97706, #fbbf24)'}} />
                                Elegant Gold Waves
                            </button>
                            <button 
                                style={{
                                    ...styles.themeBtn, 
                                    border: template === 'neon' ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                                    backgroundColor: '#0f172a',
                                    color: '#cbd5e1'
                                }}
                                onClick={() => setTemplate('neon')}
                            >
                                <span style={{...styles.colorDot, background: 'linear-gradient(135deg, #ec4899, #8b5cf6)'}} />
                                Cyber Neon
                            </button>
                        </div>
                    </div>
                </div>

                {/* Live Preview */}
                <div style={styles.previewPanel}>
                    <div id="printable-certificate" style={{
                        ...styles.certCard,
                        ...(template === 'orange' ? certStyles.orange : template === 'wizard' ? certStyles.wizard : template === 'waves' ? certStyles.waves : certStyles.neon)
                    }}>
                        {/* 1. Vector Graphics Background for Vibrant Orange Theme */}
                        {template === 'orange' && (
                            <svg viewBox="0 0 800 565" fill="none" xmlns="http://www.w3.org/2000/svg" style={styles.wavesSvg}>
                                <rect width="800" height="565" fill="#f9b828" />
                                <path d="M -10 -10 L 220 -10 C 200 90, 80 140, -10 120 Z" fill="#ffffff" />
                                <path d="M -10 100 C 60 110, 80 160, 40 200 C 0 240, -10 210, -10 200 Z" fill="#ffffff" opacity="0.7" />
                                <path d="M 810 575 L 580 575 C 600 475, 720 425, 810 445 Z" fill="#ffffff" />
                                <path d="M 810 400 C 740 390, 720 340, 760 300 C 800 260, 810 290, 810 300 Z" fill="#ffffff" opacity="0.7" />
                                <rect x="25" y="25" width="750" height="515" rx="20" stroke="#ffffff" strokeWidth="3.5" />
                                <path d="M 120 280 L 130 280 M 125 275 L 125 285" stroke="#3f2b6e" strokeWidth="2.5" />
                                <path d="M 150 140 L 156 140 M 153 137 L 153 143" stroke="#3f2b6e" strokeWidth="1.5" />
                                <path d="M 70 80 Q 80 80, 80 70 Q 80 80, 90 80 Q 80 80, 80 90 Q 80 80, 70 80 Z" fill="#3f2b6e" />
                                <path d="M 680 180 L 690 180 M 685 175 L 685 185" stroke="#3f2b6e" strokeWidth="2.5" />
                                <path d="M 650 330 L 656 330 M 653 327 L 653 333" stroke="#3f2b6e" strokeWidth="1.5" />
                                <path d="M 710 110 Q 720 110, 720 100 Q 720 110, 730 110 Q 720 110, 720 120 Q 720 110, 710 110 Z" fill="#ffffff" />
                                <path d="M 610 80 Q 615 80, 615 75 Q 615 80, 620 80 Q 615 80, 615 85 Q 615 80, 610 80 Z" fill="#ffffff" />
                                <path d="M 200 170 Q 180 185, 160 170" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                                <path d="M 200 180 Q 185 192, 170 182" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                                <path d="M 600 170 Q 620 185, 640 170" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                                <path d="M 600 180 Q 615 192, 630 182" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        )}

                        {/* 2. Vector Graphics Background for Classic Gold Waves Theme */}
                        {template === 'waves' && (
                            <svg viewBox="0 0 320 600" fill="none" xmlns="http://www.w3.org/2000/svg" style={styles.wavesSvg}>
                                <path d="M 0 0 C 130 110, 190 230, 90 420 C 50 500, 20 550, 0 600 Z" fill="url(#goldWaveGrad)" opacity="0.8" />
                                <path d="M 0 0 C 160 130, 220 270, 110 470 C 70 540, 30 580, 0 600 Z" fill="url(#goldWaveGradLight)" opacity="0.3" />
                                <path d="M 0 50 C 140 160, 200 290, 100 490" stroke="url(#goldStroke)" strokeWidth="2.5" />
                                <path d="M 0 120 C 120 210, 170 310, 80 540" stroke="#fef08a" strokeWidth="1" opacity="0.7" />
                                <path d="M 0 -20 C 170 90, 230 210, 130 390 C 90 450, 50 500, 0 550" stroke="url(#goldStroke)" strokeWidth="0.8" />
                                <defs>
                                    <linearGradient id="goldWaveGrad" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#ca8a04" stopOpacity="0.08"/>
                                        <stop offset="30%" stopColor="#d97706" stopOpacity="0.18"/>
                                        <stop offset="70%" stopColor="#f5b041" stopOpacity="0.22"/>
                                        <stop offset="100%" stopColor="#ffe066" stopOpacity="0.03"/>
                                    </linearGradient>
                                    <linearGradient id="goldWaveGradLight" x1="0" y1="0" x2="1" y2="1">
                                        <stop offset="0%" stopColor="#ffe066" stopOpacity="0.08"/>
                                        <stop offset="50%" stopColor="#fef08a" stopOpacity="0.12"/>
                                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
                                    </linearGradient>
                                    <linearGradient id="goldStroke" x1="0" y1="0" x2="0.5" y2="1">
                                        <stop offset="0%" stopColor="#b45309"/>
                                        <stop offset="50%" stopColor="#fbbf24"/>
                                        <stop offset="100%" stopColor="#ca8a04"/>
                                    </linearGradient>
                                </defs>
                            </svg>
                        )}

                        {/* 3. Detailed Vector Illustration of Harry Potter (Casting a spell) */}
                        {template === 'wizard' && (
                            <svg viewBox="0 0 120 180" style={styles.wizardFigure}>
                                {/* Cloak/Robe */}
                                <path d="M 30 110 C 25 110, 15 130, 10 180 L 110 180 C 105 130, 95 110, 90 110 Z" fill="#2d2d30" />
                                <path d="M 45 110 L 50 180 L 70 180 L 75 110 Z" fill="#b91c1c" /> {/* Red cloak lining */}
                                
                                {/* Gryffindor Scarf */}
                                <path d="M 32 100 C 32 100, 50 112, 60 112 C 70 112, 88 100, 88 100 C 88 100, 75 118, 60 118 C 45 118, 32 100, 32 100 Z" fill="#b91c1c" />
                                {/* Scarf Gold Stripes */}
                                <path d="M 40 104 L 45 109 L 43 113 L 38 107 Z" fill="#fbbf24" />
                                <path d="M 52 108 L 57 113 L 55 116 L 50 111 Z" fill="#fbbf24" />
                                <path d="M 68 111 L 70 116 L 65 116 L 63 111 Z" fill="#fbbf24" />
                                <path d="M 78 107 L 83 111 L 80 115 L 75 110 Z" fill="#fbbf24" />
                                {/* Scarf Tail with Tassels */}
                                <path d="M 72 112 L 82 150 L 92 148 L 82 112 Z" fill="#b91c1c" />
                                <path d="M 75 125 L 87 123" stroke="#fbbf24" strokeWidth="4" />
                                <path d="M 78 138 L 90 136" stroke="#fbbf24" strokeWidth="4" />
                                <path d="M 80 148 L 92 146" stroke="#fbbf24" strokeWidth="2" />

                                {/* Face & Neck */}
                                <rect x="52" y="85" width="16" height="20" fill="#ffedd5" />
                                <circle cx="60" cy="70" r="23" fill="#ffedd5" />
                                
                                {/* Messy Black Hair */}
                                <path d="M 33 66 C 30 50, 42 35, 60 35 C 78 35, 90 50, 87 66 C 92 64, 88 54, 84 50 C 82 42, 75 38, 68 38 C 62 38, 55 42, 52 38 C 45 42, 40 50, 38 58 C 34 60, 32 64, 33 66 Z" fill="#1e1b18" />
                                <path d="M 38 55 Q 48 50, 48 60" stroke="#1e1b18" strokeWidth="3" strokeLinecap="round" />
                                <path d="M 50 45 Q 60 52, 58 62" stroke="#1e1b18" strokeWidth="4" strokeLinecap="round" />
                                <path d="M 62 42 Q 72 50, 68 62" stroke="#1e1b18" strokeWidth="3" strokeLinecap="round" />
                                <path d="M 75 48 Q 80 55, 78 65" stroke="#1e1b18" strokeWidth="3" strokeLinecap="round" />

                                {/* Round Glasses */}
                                <circle cx="48" cy="72" r="10" stroke="#1e1b18" strokeWidth="2.2" fill="none" />
                                <circle cx="72" cy="72" r="10" stroke="#1e1b18" strokeWidth="2.2" fill="none" />
                                <path d="M 58 72 Q 60 70, 62 72" stroke="#1e1b18" strokeWidth="1.8" fill="none" />
                                <path d="M 38 72 L 35 70" stroke="#1e1b18" strokeWidth="1.5" />
                                <path d="M 82 72 L 85 70" stroke="#1e1b18" strokeWidth="1.5" />

                                {/* Eyes */}
                                <circle cx="48" cy="72" r="1.5" fill="#1e1b18" />
                                <circle cx="72" cy="72" r="1.5" fill="#1e1b18" />
                                
                                {/* Smiling mouth */}
                                <path d="M 56 82 Q 60 85, 64 82" stroke="#1e1b18" strokeWidth="1.5" strokeLinecap="round" fill="none" />

                                {/* Lightning Bolt Scar */}
                                <polygon points="56,46 51,54 55,54 50,62 58,53 54,53" fill="#fbbf24" />

                                {/* Hand holding magic wand */}
                                <circle cx="24" cy="120" r="5" fill="#ffedd5" />
                                <line x1="24" y1="120" x2="-2" y2="105" stroke="#5c4033" strokeWidth="3" strokeLinecap="round" />
                                {/* Sparkles shooting from wand */}
                                <circle cx="-2" cy="105" r="2.5" fill="#f59e0b" />
                                <path d="M -2 93 L -2 117 M -14 105 L 10 105" stroke="#fbbf24" strokeWidth="0.8" opacity="0.9" />
                                <circle cx="-10" cy="93" r="1" fill="#fef08a" />
                                <circle cx="6" cy="117" r="1.5" fill="#f59e0b" />
                                <circle cx="-16" cy="117" r="0.8" fill="#ffffff" />
                            </svg>
                        )}

                        {/* 4. Detailed Vector Illustration of Albus Dumbledore (Casting a spell) */}
                        {template === 'wizard' && (
                            <svg viewBox="0 0 120 180" style={styles.dumbledoreFigure}>
                                {/* Robe */}
                                <path d="M 30 110 C 25 110, 15 130, 10 180 L 110 180 C 105 130, 95 110, 90 110 Z" fill="#4c1d95" />
                                <path d="M 48 110 L 52 180 L 68 180 L 72 110 Z" fill="#d97706" /> {/* Gold lining */}
                                
                                {/* Neck */}
                                <rect x="52" y="85" width="16" height="20" fill="#ffedd5" />
                                
                                {/* Face */}
                                <circle cx="60" cy="70" r="21" fill="#ffedd5" />
                                
                                {/* Beard */}
                                <path d="M 40 75 C 38 100, 42 145, 60 155 C 78 145, 82 100, 80 75 Z" fill="#f1f5f9" />
                                <path d="M 48 95 C 47 115, 52 135, 60 142" stroke="#cbd5e1" strokeWidth="1.5" fill="none" />
                                <path d="M 72 95 C 73 115, 68 135, 60 142" stroke="#cbd5e1" strokeWidth="1.5" fill="none" />
                                <path d="M 60 85 L 60 130" stroke="#cbd5e1" strokeWidth="1" fill="none" />
                                
                                {/* Mustache */}
                                <path d="M 46 80 Q 60 83, 74 80 Q 60 90, 46 80 Z" fill="#cbd5e1" />
                                
                                {/* Long Silver Hair */}
                                <path d="M 39 70 C 35 70, 32 90, 30 130 C 35 130, 39 105, 41 85 Z" fill="#f1f5f9" />
                                <path d="M 81 70 C 85 70, 88 90, 90 130 C 85 130, 81 105, 79 85 Z" fill="#f1f5f9" />
                                
                                {/* Half-Moon Glasses */}
                                <path d="M 39 70 A 10 10 0 0 0 59 70 Z" stroke="#d97706" strokeWidth="1.8" fill="none" />
                                <path d="M 61 70 A 10 10 0 0 0 81 70 Z" stroke="#d97706" strokeWidth="1.8" fill="none" />
                                <path d="M 59 70 Q 60 68, 61 70" stroke="#d97706" strokeWidth="1.8" fill="none" />
                                <line x1="39" y1="70" x2="34" y2="68" stroke="#d97706" strokeWidth="1.5" />
                                <line x1="81" y1="70" x2="86" y2="68" stroke="#d97706" strokeWidth="1.5" />
                                
                                {/* Twinkling Blue Eyes */}
                                <circle cx="49" cy="73" r="1.5" fill="#3b82f6" />
                                <circle cx="71" cy="73" r="1.5" fill="#3b82f6" />
                                
                                {/* Crooked Nose */}
                                <path d="M 59 66 L 57 73 L 61 74" stroke="#d1a580" strokeWidth="1.5" fill="none" />
                                
                                {/* Wizard Hat */}
                                <path d="M 38 49 C 38 49, 45 10, 68 8 C 65 24, 78 36, 82 49 Z" fill="#4c1d95" /> {/* Point */}
                                <path d="M 38 49 Q 60 46, 82 49 L 81 52 Q 60 49, 39 52 Z" fill="#d97706" /> {/* Hat band */}
                                <path d="M 33 53 C 33 53, 60 48, 87 53 C 92 53, 94 48, 87 47 C 60 44, 33 47, 33 53 Z" fill="#311052" /> {/* Brim */}
                                
                                {/* Star details on hat */}
                                <path d="M 58 24 Q 60 24, 60 22 Q 60 24, 62 24 Q 60 24, 60 26 Q 60 24, 58 24 Z" fill="#fbbf24" />
                                <path d="M 64 34 Q 66 34, 66 32 Q 66 34, 68 34 Q 66 34, 66 36 Q 66 34, 64 34 Z" fill="#fbbf24" />
                                
                                {/* Hand holding Elder Wand */}
                                <circle cx="96" cy="120" r="5" fill="#ffedd5" />
                                <line x1="96" y1="120" x2="122" y2="105" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
                                {/* Elder Wand nodules */}
                                <circle cx="102" cy="116" r="3.2" fill="#78350f" />
                                <circle cx="108" cy="112" r="2.8" fill="#78350f" />
                                <circle cx="114" cy="109" r="2.4" fill="#78350f" />
                                
                                {/* Sparkles (blue/silver magical sparks) */}
                                <circle cx="122" cy="105" r="2.5" fill="#60a5fa" />
                                <path d="M 122 93 L 122 117 M 110 105 L 134 105" stroke="#93c5fd" strokeWidth="0.8" opacity="0.9" />
                                <circle cx="112" cy="93" r="1" fill="#93c5fd" />
                                <circle cx="130" cy="117" r="1.5" fill="#60a5fa" />
                                <circle cx="136" cy="98" r="0.8" fill="#ffffff" />
                            </svg>
                        )}

                        {/* Certificate Inner Container */}
                        <div style={{
                            ...styles.certBorder,
                            border: ['orange', 'waves', 'wizard'].includes(template) ? 'none' : '2px solid',
                            borderColor: template === 'neon' ? '#8b5cf6' : '#3b82f6',
                            padding: template === 'orange' ? '36px 48px' : template === 'wizard' ? '28px 36px' : '20px 24px'
                        }}>
                            {/* Corner Decors for non-waves/non-orange/non-wizard themes */}
                            {['neon', 'glass'].includes(template) && (
                                <>
                                    <div style={{...styles.corner, top: '10px', left: '10px', borderTop: '2px solid', borderLeft: '2px solid', borderColor: template === 'neon' ? '#ff00ff' : '#3b82f6'}} />
                                    <div style={{...styles.corner, top: '10px', right: '10px', borderTop: '2px solid', borderRight: '2px solid', borderColor: template === 'neon' ? '#ff00ff' : '#3b82f6'}} />
                                    <div style={{...styles.corner, bottom: '10px', left: '10px', borderBottom: '2px solid', borderLeft: '2px solid', borderColor: template === 'neon' ? '#ff00ff' : '#3b82f6'}} />
                                    <div style={{...styles.corner, bottom: '10px', right: '10px', borderBottom: '2px solid', borderRight: '2px solid', borderColor: template === 'neon' ? '#ff00ff' : '#3b82f6'}} />
                                </>
                            )}

                            {/* Header details */}
                            <div style={styles.certHeader}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '8px', zIndex: 5}}>
                                    {template === 'wizard' ? (
                                        /* Wizard crest */
                                        <svg viewBox="0 0 100 100" style={{width: '28px', height: '28px'}}>
                                            <path d="M 50 10 Q 75 10, 80 35 Q 80 65, 50 85 Q 20 65, 20 35 Q 25 10, 50 10 Z" fill="#78350f" stroke="#fbbf24" strokeWidth="2.5" />
                                            <path d="M 50 10 L 50 85" stroke="#fbbf24" strokeWidth="1.2" />
                                            <circle cx="50" cy="40" r="10" fill="#fbbf24" />
                                            <text x="50" y="44" fontFamily="'Cinzel Decorative', serif" fontSize="11" fontWeight="bold" fill="#78350f" textAnchor="middle">H</text>
                                        </svg>
                                    ) : (
                                        <Sparkles size={16} color={template === 'orange' ? '#3f2b6e' : template === 'neon' ? '#ff00ff' : '#d97706'} />
                                    )}
                                    <span style={{
                                        fontFamily: template === 'wizard' ? "'Cinzel Decorative', serif" : "'Space Grotesk', sans-serif",
                                        fontWeight: 'bold',
                                        fontSize: template === 'wizard' ? '12px' : '11px',
                                        letterSpacing: '2px',
                                        color: template === 'orange' ? '#3f2b6e' : template === 'wizard' ? '#4a2c11' : template === 'neon' ? '#ff00ff' : '#102a43'
                                    }}>
                                        {template === 'wizard' ? 'HIGGSFIELD ACADEMY OF WIZARDRY' : 'HIGGSFIELD ACADEMY'}
                                    </span>
                                </div>
                                <div style={{
                                    fontSize: '9px',
                                    fontFamily: 'monospace',
                                    color: template === 'orange' ? '#3f2b6e' : template === 'wizard' ? '#78350f' : template === 'neon' ? '#a78bfa' : '#627d98',
                                    zIndex: 5
                                }}>VERIFICATION ID: {certId}</div>
                            </div>

                            {/* Title & Body */}
                            <div style={styles.certBody}>
                                {template === 'orange' ? (
                                    <div style={{display: 'flex', flexDirection: 'column', gap: '2px'}}>
                                        <h1 style={{
                                            fontFamily: "'Plus Jakarta Sans', 'Space Grotesk', sans-serif",
                                            fontWeight: '900',
                                            fontSize: '34px',
                                            letterSpacing: '1.5px',
                                            color: '#3f2b6e',
                                            margin: 0,
                                            lineHeight: '1.1'
                                        }}>STUDENT</h1>
                                        <h1 style={{
                                            fontFamily: "'Plus Jakarta Sans', 'Space Grotesk', sans-serif",
                                            fontWeight: '900',
                                            fontSize: '34px',
                                            letterSpacing: '1.5px',
                                            color: '#3f2b6e',
                                            margin: 0,
                                            lineHeight: '1.1'
                                        }}>OF THE YEAR</h1>
                                    </div>
                                ) : template === 'wizard' ? (
                                    <h1 style={{
                                        fontFamily: "'Cinzel Decorative', serif",
                                        fontSize: '26px',
                                        fontWeight: 'bold',
                                        color: '#4a2c11',
                                        letterSpacing: '3px',
                                        margin: '12px 0 0 0',
                                        textShadow: '0px 1px 1px rgba(0,0,0,0.1)'
                                    }}>ORDER OF MERLIN</h1>
                                ) : (
                                    <h1 style={{
                                        ...styles.certTitle,
                                        fontFamily: template === 'waves' ? "'Cinzel', serif" : "'Space Grotesk', sans-serif",
                                        color: template === 'neon' ? '#fff' : '#102a43',
                                        textShadow: template === 'neon' ? '0 0 10px rgba(139, 92, 246, 0.5)' : 'none',
                                        fontSize: template === 'waves' ? '28px' : '22px',
                                        letterSpacing: template === 'waves' ? '5px' : '2px',
                                    }}>CERTIFICATE OF COMPLETION</h1>
                                )}
                                
                                <p style={{
                                    ...styles.certIntro,
                                    color: template === 'orange' ? '#3f2b6e' : template === 'wizard' ? '#78350f' : template === 'neon' ? '#94a3b8' : '#627d98',
                                    fontFamily: ['orange', 'wizard'].includes(template) ? "'Playfair Display', serif" : "'Inter', sans-serif",
                                    fontStyle: ['orange', 'wizard'].includes(template) ? 'italic' : 'normal',
                                    fontSize: ['orange', 'wizard'].includes(template) ? '12px' : '9px',
                                    margin: template === 'orange' ? '10px 0 2px 0' : '12px 0 0 0'
                                }}>
                                    {template === 'wizard' ? 'This is to certify that the wizarding scholar' : 'This certificate is presented to'}
                                </p>
                                
                                <h2 style={{
                                    ...styles.certName,
                                    fontFamily: ['waves', 'wizard'].includes(template) ? "'Alex Brush', cursive" : "'Plus Jakarta Sans', sans-serif",
                                    fontWeight: ['waves', 'wizard'].includes(template) ? 'normal' : '900',
                                    fontSize: template === 'orange' ? '40px' : template === 'wizard' ? '44px' : template === 'waves' ? '46px' : '32px',
                                    color: template === 'orange' ? '#ffffff' : template === 'wizard' ? '#4a2c11' : template === 'waves' ? '#102a43' : template === 'neon' ? '#ff00ff' : '#1e3a8a',
                                    textShadow: template === 'neon' ? '0 0 15px rgba(255, 0, 255, 0.4)' : 'none',
                                    margin: template === 'waves' ? '12px 0 16px 0' : template === 'orange' ? '2px 0 8px 0' : '4px 0',
                                    borderBottom: ['waves', 'wizard'].includes(template) ? '1px solid rgba(74, 44, 17, 0.15)' : 'none',
                                    paddingBottom: template === 'waves' ? '8px' : 0,
                                    width: template === 'waves' ? '60%' : 'auto',
                                    textAlign: 'center',
                                    textTransform: template === 'orange' ? 'uppercase' : 'none',
                                }}>{name || 'Student Name'}</h2>

                                {/* Custom decorative white underline with endpoints for Orange theme */}
                                {template === 'orange' && (
                                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '8px'}}>
                                        <div style={{width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ffffff'}} />
                                        <div style={{width: '180px', height: '3px', backgroundColor: '#ffffff', borderRadius: '2px'}} />
                                        <div style={{width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ffffff'}} />
                                    </div>
                                )}

                                {/* Glow magic wand separator for Wizard theme */}
                                {template === 'wizard' && (
                                    <svg viewBox="0 0 300 20" style={{width: '260px', height: '20px', margin: '4px auto 12px auto'}}>
                                        <line x1="20" y1="10" x2="260" y2="10" stroke="#4a2c11" strokeWidth="2.5" strokeLinecap="round" />
                                        <line x1="20" y1="10" x2="60" y2="10" stroke="#7c2d12" strokeWidth="4.5" strokeLinecap="round" />
                                        <circle cx="265" cy="10" r="1.5" fill="#f59e0b" />
                                        <path d="M 265 4 L 265 16 M 259 10 L 271 10" stroke="#f59e0b" strokeWidth="0.8" />
                                    </svg>
                                )}
                                
                                <p style={{
                                    ...styles.certText,
                                    fontFamily: ['waves', 'wizard'].includes(template) ? "'Playfair Display', 'Almendra', serif" : "'Space Grotesk', 'Inter', sans-serif",
                                    fontStyle: ['waves', 'wizard'].includes(template) ? 'italic' : 'normal',
                                    color: template === 'orange' ? '#3f2b6e' : template === 'wizard' ? '#4a2c11' : template === 'neon' ? '#cbd5e1' : '#627d98',
                                    fontWeight: template === 'orange' ? 'bold' : 'normal',
                                    fontSize: ['orange', 'wizard'].includes(template) ? '10px' : '11px',
                                    maxWidth: template === 'orange' ? '460px' : '440px',
                                    lineHeight: '1.6'
                                }}>
                                    {template === 'orange' ? (
                                        `Given this day of ${date} for achieving outstanding marks and demonstrating logical mastery in ${course} for the current academic session`
                                    ) : template === 'wizard' ? (
                                        `has successfully demonstrated extraordinary magical focus, wizarding diligence, and mastery over the arcane structures of code and algorithmic patterns in the specialized class`
                                    ) : (
                                        `for outstanding performance and successful completion of all curriculum metrics, practical examinations, and algorithmic lab challenges for the specialized training module`
                                    )}
                                </p>
                                
                                {template !== 'orange' && (
                                    <h3 style={{
                                        ...styles.certCourseName,
                                        fontFamily: ['waves', 'wizard'].includes(template) ? "'Cinzel', serif" : "'Space Grotesk', sans-serif",
                                        color: template === 'waves' ? '#d97706' : template === 'wizard' ? '#78350f' : template === 'neon' ? '#38bdf8' : '#0f172a',
                                        fontSize: template === 'wizard' ? '15px' : '14px',
                                        letterSpacing: template === 'wizard' ? '1.5px' : '1px',
                                        marginTop: template === 'wizard' ? '8px' : '4px'
                                    }}>
                                        {template === 'wizard' ? getMagicalCourse(course) : course}
                                    </h3>
                                )}
                            </div>

                            {/* Footer / Signatures / Seal */}
                            <div style={styles.certFooter}>
                                <div style={styles.signatureBlock}>
                                    <span style={{
                                        ...styles.signatureLine,
                                        borderColor: template === 'orange' ? '#ffffff' : template === 'wizard' ? '#78350f' : template === 'neon' ? '#475569' : '#cbd5e1',
                                        color: template === 'orange' ? '#3f2b6e' : template === 'wizard' ? '#4a2c11' : template === 'neon' ? '#a78bfa' : '#102a43',
                                        fontFamily: ['waves', 'orange', 'wizard'].includes(template) ? "'Alex Brush', cursive" : 'cursive',
                                        fontSize: ['waves', 'orange', 'wizard'].includes(template) ? '20px' : '13px',
                                    }}>{signer}</span>
                                    <span style={{
                                        ...styles.signatureTitle,
                                        color: template === 'orange' ? '#3f2b6e' : template === 'wizard' ? '#78350f' : 'var(--text-muted)'
                                    }}>
                                        {template === 'wizard' ? 'Headmaster of Hogwarts' : 'Director / Instructor'}
                                    </span>
                                </div>

                                <div style={styles.sealBlock}>
                                    {template === 'orange' ? (
                                        <svg viewBox="0 0 100 120" style={styles.crimsonSeal}>
                                            <path d="M 38 70 L 28 105 L 38 98 L 48 105 Z" fill="#b91c1c" />
                                            <path d="M 62 70 L 72 105 L 62 98 L 52 105 Z" fill="#991b1b" />
                                            <circle cx="50" cy="50" r="32" fill="#dc2626" stroke="#b91c1c" strokeWidth="1.5" />
                                            <circle cx="50" cy="50" r="28" fill="none" stroke="#fef08a" stroke-dasharray="3 2" strokeWidth="1" />
                                            <polygon points="50,38 53,46 62,47 55,53 58,62 50,56 42,62 45,53 38,47 47,46" fill="#fef08a" />
                                        </svg>
                                    ) : template === 'wizard' ? (
                                        /* 3D Embossed Crimson Wax Seal */
                                        <svg viewBox="0 0 100 100" style={styles.sunburstSeal}>
                                            <path d="M 50 10 C 66 7, 76 18, 86 21 C 93 34, 91 54, 86 69 C 79 87, 56 91, 41 87 C 23 83, 13 69, 16 49 C 13 29, 26 11, 50 10 Z" fill="#991b1b" stroke="#7f1d1d" strokeWidth="1" />
                                            <path d="M 50 14 C 61 13, 71 19, 79 27 C 85 37, 83 51, 79 64 C 73 77, 53 81, 43 77 C 29 73, 21 61, 23 45 C 21 31, 33 17, 50 14 Z" fill="#b91c1c" />
                                            <circle cx="50" cy="50" r="25" fill="none" stroke="#7f1d1d" strokeWidth="1" opacity="0.6" />
                                            <text x="50" y="60" fontFamily="'Cinzel Decorative', serif" fontSize="28" fontWeight="bold" fill="#7f1d1d" textAnchor="middle" opacity="0.85">H</text>
                                            <path d="M 32 32 Q 50 22, 68 32" stroke="#fecaca" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.25" />
                                        </svg>
                                    ) : template === 'waves' ? (
                                        <svg viewBox="0 0 120 120" style={styles.sunburstSeal}>
                                            <defs>
                                                <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
                                                    <stop offset="0%" stopColor="#ffe066" />
                                                    <stop offset="50%" stopColor="#f5b041" />
                                                    <stop offset="100%" stopColor="#b7950b" />
                                                </linearGradient>
                                            </defs>
                                            <path d="M60 8 L65 21 L78 15 L79 29 L92 27 L88 40 L99 43 L91 55 L99 62 L88 70 L93 83 L80 81 L81 95 L68 89 L65 102 L55 92 L48 103 L40 91 L30 99 L27 86 L15 90 L18 77 L7 77 L15 65 L8 55 L18 49 L15 36 L27 34 L28 20 L40 23 L45 10 L55 18 Z" fill="url(#goldGrad)" />
                                            <circle cx="60" cy="60" r="36" fill="#f5b041" stroke="#fcf3cf" strokeWidth="1.5" />
                                            <circle cx="60" cy="60" r="32" fill="none" stroke="#b7950b" stroke-dasharray="3 2" />
                                            <polygon points="60,37 66,50 80,51 69,60 73,74 60,66 47,74 51,60 40,51 54,50" fill="#78350f" />
                                        </svg>
                                    ) : (
                                        <div style={{
                                            ...styles.sealOuter,
                                            borderColor: template === 'neon' ? '#ff00ff' : '#3b82f6',
                                            boxShadow: template === 'neon' ? '0 0 15px rgba(255, 0, 255, 0.2)' : 'none'
                                        }}>
                                            <Award size={28} color={template === 'neon' ? '#ff00ff' : '#3b82f6'} />
                                        </div>
                                    )}
                                </div>

                                <div style={styles.signatureBlock}>
                                    <span style={{
                                        ...styles.signatureLine,
                                        borderColor: template === 'orange' ? '#ffffff' : template === 'wizard' ? '#78350f' : template === 'neon' ? '#475569' : '#cbd5e1',
                                        color: template === 'orange' ? '#3f2b6e' : template === 'wizard' ? '#4a2c11' : template === 'neon' ? '#cbd5e1' : '#102a43',
                                        fontFamily: template === 'orange' ? "'Plus Jakarta Sans', sans-serif" : 'inherit',
                                        fontWeight: template === 'orange' ? 'bold' : 'normal',
                                        fontSize: template === 'orange' ? '12px' : '13px'
                                    }}>{template === 'orange' ? 'Academic Board' : template === 'wizard' ? 'Minerva McGonagall' : date}</span>
                                    <span style={{
                                        ...styles.signatureTitle,
                                        color: template === 'orange' ? '#3f2b6e' : template === 'wizard' ? '#78350f' : 'var(--text-muted)'
                                    }}>{template === 'orange' ? 'Authority Partner' : template === 'wizard' ? 'Deputy Headmistress' : 'Date of Issue'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const certStyles = {
    orange: {
        background: '#f9b828',
        color: '#3f2b6e',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        border: 'none',
    },
    wizard: {
        background: 'radial-gradient(circle, #fbf7eb 60%, #e8dcb9 100%)',
        color: '#4a2c11',
        boxShadow: '0 10px 40px rgba(74, 44, 17, 0.15)',
        border: '8px double #4a2c11',
    },
    waves: {
        background: '#ffffff',
        color: '#1e293b',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.05)',
        border: 'none',
    },
    neon: {
        background: '#090d16',
        color: '#f8fafc',
        boxShadow: '0 10px 30px rgba(139, 92, 246, 0.2)',
        border: '6px solid #8b5cf6',
    }
};

const styles = {
    container: {
        height: '100%',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        padding: '16px 24px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--bg-secondary)',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    backBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'none',
        border: '1px solid var(--border-color)',
        padding: '6px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '13px',
        color: 'var(--text-secondary)',
    },
    title: {
        fontSize: '18px',
        fontWeight: 'bold',
        margin: 0,
    },
    subtitle: {
        fontSize: '12px',
        color: 'var(--text-muted)',
        margin: 0,
    },
    headerRight: {
        display: 'flex',
        alignItems: 'center',
    },
    printBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'var(--color-primary)',
        color: '#fff',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontWeight: 'bold',
        fontSize: '13px',
    },
    contentLayout: {
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        gap: '24px',
        padding: '24px',
    },
    editorPanel: {
        width: '320px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        flexShrink: 0,
        overflowY: 'auto',
    },
    panelTitle: {
        fontSize: '15px',
        fontWeight: 'bold',
        margin: '0 0 4px 0',
        color: 'var(--text-primary)',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        fontSize: '12px',
        fontWeight: '600',
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    input: {
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        outline: 'none',
        fontSize: '13px',
    },
    select: {
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        outline: 'none',
        fontSize: '13px',
        cursor: 'pointer',
    },
    themeRow: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    themeBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '600',
        textAlign: 'left',
        transition: 'all 0.2s',
    },
    colorDot: {
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        display: 'inline-block',
    },
    previewPanel: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '24px',
        overflow: 'auto',
    },
    certCard: {
        width: '100%',
        maxWidth: '800px',
        aspectRatio: '1.414', // Landscape A4 aspect ratio
        padding: '36px 40px',
        position: 'relative',
        boxSizing: 'border-box',
        overflow: 'hidden',
    },
    wavesSvg: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        height: '100%',
        width: 'auto',
        pointerEvents: 'none',
        zIndex: 1,
    },
    wizardFigure: {
        position: 'absolute',
        right: '4.375%',
        top: '21.238%',
        width: '13.125%',
        height: '27.964%',
        zIndex: 10,
        pointerEvents: 'none',
        filter: 'drop-shadow(0 4px 10px rgba(74, 44, 17, 0.25))',
    },
    dumbledoreFigure: {
        position: 'absolute',
        left: '4.375%',
        top: '21.238%',
        width: '13.125%',
        height: '27.964%',
        zIndex: 10,
        pointerEvents: 'none',
        filter: 'drop-shadow(0 4px 10px rgba(74, 44, 17, 0.25))',
    },
    certBorder: {
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px 24px',
        boxSizing: 'border-box',
        zIndex: 2,
    },
    corner: {
        position: 'absolute',
        width: '16px',
        height: '16px',
    },
    certHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    certBody: {
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
    },
    certTitle: {
        fontWeight: '800',
        margin: 0,
    },
    certIntro: {
        fontSize: '9px',
        letterSpacing: '2px',
        margin: '12px 0 0 0',
        fontWeight: '700',
    },
    certName: {
        margin: '4px 0',
    },
    certText: {
        fontSize: '11px',
        lineHeight: '1.6',
        maxWidth: '440px',
        margin: '0 auto',
        textAlign: 'center',
    },
    certCourseName: {
        fontSize: '14px',
        fontWeight: '800',
        margin: '4px 0',
        textTransform: 'uppercase',
        letterSpacing: '1px',
    },
    certFooter: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    signatureBlock: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '150px',
    },
    signatureLine: {
        borderBottom: '1px solid',
        width: '100%',
        textAlign: 'center',
        paddingBottom: '2px',
        fontSize: '13px',
        fontWeight: '600',
    },
    signatureTitle: {
        fontSize: '9px',
        color: 'var(--text-muted)',
        marginTop: '6px',
        textTransform: 'uppercase',
        fontWeight: '600',
        letterSpacing: '0.5px',
    },
    sealBlock: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100px',
        height: '100px',
    },
    sunburstSeal: {
        width: '80px',
        height: '80px',
        filter: 'drop-shadow(0 4px 10px rgba(180, 83, 9, 0.35))',
    },
    crimsonSeal: {
        width: '75px',
        height: '95px',
        filter: 'drop-shadow(0 4px 8px rgba(185, 28, 28, 0.35))',
    },
    sealOuter: {
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        border: '3px double',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    }
};

export default CertificateGenerator;
