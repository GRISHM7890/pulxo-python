import React, { useState, useEffect, useMemo } from 'react';
import {
    Trophy, Zap, Flame, Calendar, Target,
    TrendingUp, Award, BarChart2, CheckCircle,
    ChevronRight, BookOpen, Clock, Activity,
    Rocket, Star, Shield, HelpCircle, Sparkles
} from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { PRACTICE_TOPICS, PROBLEMS } from '../data/problems';

const StudentDashboard = ({ onClose }) => {
    const { user } = useAuth();
    const [solvedIds, setSolvedIds] = useState([]);
    const [activity, setActivity] = useState({});
    const [savedProgramsCount, setSavedProgramsCount] = useState(0);

    useEffect(() => {
        if (!user) return;

        // Fetch solved problems
        const solvedRef = ref(db, `users/${user.uid}/progress/solved`);
        onValue(solvedRef, (snapshot) => {
            setSolvedIds(snapshot.val() || []);
        });

        // Fetch activity for heatmap
        const activityRef = ref(db, `users/${user.uid}/activity`);
        onValue(activityRef, (snapshot) => {
            setActivity(snapshot.val() || {});
        });

        // Fetch saved programs count
        const programsRef = ref(db, `users/${user.uid}/saved_programs`);
        onValue(programsRef, (snapshot) => {
            const data = snapshot.val();
            setSavedProgramsCount(data ? Object.keys(data).length : 0);
        });
    }, [user]);

    // Calculate Mastery per topic
    const topicMastery = useMemo(() => {
        return PRACTICE_TOPICS.map(topic => {
            const topicProblems = PROBLEMS[topic] || [];
            const solvedInTopic = topicProblems.filter(p => solvedIds.includes(p.id)).length;
            const percentage = topicProblems.length > 0
                ? Math.round((solvedInTopic / topicProblems.length) * 100)
                : 0;
            return { topic, solved: solvedInTopic, total: topicProblems.length, percentage };
        });
    }, [solvedIds]);

    // Calculate Streak
    const streakData = useMemo(() => {
        const dates = Object.keys(activity).sort().reverse();
        if (dates.length === 0) return { current: 0, max: 0 };

        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const yesterday = new Date(now.getTime() - 86400000).toISOString().split('T')[0];

        let current = 0;
        // Only count streak if active today or yesterday
        if (activity[today] || activity[yesterday]) {
            let checkDate = activity[today] ? today : yesterday;
            while (activity[checkDate]) {
                current++;
                let d = new Date(checkDate);
                d.setDate(d.getDate() - 1);
                checkDate = d.toISOString().split('T')[0];
            }
        }

        // Simple max calculation for demo
        return { current, max: Math.max(current, 7) };
    }, [activity]);

    // Heatmap Data (Last 6 months)
    const heatmapWeeks = useMemo(() => {
        const weeks = [];
        let curr = new Date();
        curr.setDate(curr.getDate() - (curr.getDay() || 7) + 1); // Start of current week (Monday)

        for (let i = 0; i < 24; i++) { // 24 weeks
            const week = [];
            for (let j = 0; j < 7; j++) {
                const date = new Date(curr);
                date.setDate(date.getDate() - ((23 - i) * 7 + (6 - j)));
                const dateStr = date.toISOString().split('T')[0];
                week.push({
                    date: dateStr,
                    active: activity[dateStr] || false
                });
            }
            weeks.push(week);
        }
        return weeks;
    }, [activity]);

    return (
        <div style={styles.container} className="fadeIn">
            <style>{`
                .stat-card { transition: transform 0.2s ease; }
                .stat-card:hover { transform: translateY(-4px); }
                .heat-cell { transition: opacity 0.2s ease; }
                .heat-cell:hover { outline: 1px solid var(--color-primary); z-index: 10; }
                .mastery-row:hover { background: var(--bg-tertiary); }
                @keyframes fillChart {
                    from { stroke-dasharray: 0 100; }
                }
            `}</style>

            <div style={styles.header}>
                <div style={styles.headerLeft}>
                    <div style={styles.titleIcon}>
                        <TrendingUp size={20} color="var(--color-primary)" />
                    </div>
                    <div>
                        <h1 style={styles.title}>Learning Progress</h1>
                        <p style={styles.subtitle}>Track your path to Python mastery</p>
                    </div>
                </div>
                <button style={styles.closeBtn} onClick={onClose}><ChevronRight size={24} /></button>
            </div>

            <div style={styles.scrollContent}>
                {/* Top Highlights */}
                <div style={styles.statsGrid}>
                    <div style={styles.statCard} className="stat-card">
                        <div style={styles.statIcon}><Award color="#fbbf24" /></div>
                        <div style={styles.statInfo}>
                            <span style={styles.statLabel}>XP Earned</span>
                            <span style={styles.statValue}>{solvedIds.length * 100 + savedProgramsCount * 50}</span>
                        </div>
                    </div>
                    <div style={styles.statCard} className="stat-card">
                        <div style={styles.statIcon}><CheckCircle color="#22c55e" /></div>
                        <div style={styles.statInfo}>
                            <span style={styles.statLabel}>Solved</span>
                            <span style={styles.statValue}>{solvedIds.length} <small style={{ fontSize: '12px', opacity: 0.5 }}>/ {topicMastery.reduce((a, b) => a + b.total, 0)}</small></span>
                        </div>
                    </div>
                    <div style={styles.statCard} className="stat-card">
                        <div style={styles.statIcon}><Flame color="#ef4444" /></div>
                        <div style={styles.statInfo}>
                            <span style={styles.statLabel}>Streak</span>
                            <span style={styles.statValue}>{streakData.current} Days</span>
                        </div>
                    </div>
                    <div style={styles.statCard} className="stat-card">
                        <div style={styles.statIcon}><Activity color="#3b82f6" /></div>
                        <div style={styles.statInfo}>
                            <span style={styles.statLabel}>Programs</span>
                            <span style={styles.statValue}>{savedProgramsCount}</span>
                        </div>
                    </div>
                </div>

                <div style={styles.mainLayout}>
                    {/* Left: Mastery & Topic Breakdown */}
                    <div style={styles.leftCol}>
                        <div style={styles.sectionHeader}>
                            <Target size={18} />
                            <h3>Topic Mastery</h3>
                        </div>
                        <div style={styles.masteryList}>
                            {topicMastery.map(m => (
                                <div key={m.topic} style={styles.masteryRow} className="mastery-row">
                                    <div style={styles.topicInfo}>
                                        <span style={styles.topicName}>{m.topic}</span>
                                        <span style={styles.topicSolveCount}>{m.solved}/{m.total}</span>
                                    </div>
                                    <div style={styles.progressTrack}>
                                        <div style={{
                                            ...styles.progressFill,
                                            width: `${m.percentage}%`,
                                            backgroundColor: m.percentage > 70 ? '#22c55e' : (m.percentage > 30 ? '#eab308' : '#3b82f6')
                                        }}></div>
                                    </div>
                                    <span style={styles.percentageText}>{m.percentage}%</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ ...styles.sectionHeader, marginTop: '32px' }}>
                            <Shield size={18} />
                            <h3>Achievements</h3>
                        </div>
                        <div style={styles.badgeGrid}>
                            <div style={streakData.current >= 7 ? styles.badge : styles.badgeLocked}>
                                <Flame size={20} />
                                <span>7 Day Fire</span>
                            </div>
                            <div style={solvedIds.length >= 10 ? styles.badge : styles.badgeLocked}>
                                <Trophy size={20} />
                                <span>Problem Solver</span>
                            </div>
                            <div style={topicMastery.some(m => m.percentage === 100) ? styles.badge : styles.badgeLocked}>
                                <Star size={20} />
                                <span>Topic King</span>
                            </div>
                            <div style={savedProgramsCount >= 5 ? styles.badge : styles.badgeLocked}>
                                <Rocket size={20} />
                                <span>Creator</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Activity Heatmap */}
                    <div style={styles.rightCol}>
                        <div style={styles.sectionHeader}>
                            <Calendar size={18} />
                            <h3>Skill Heatmap</h3>
                        </div>
                        <div style={styles.heatmapBox}>
                            <div style={styles.heatmapLabelRow}>
                                <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span><span>Jan</span><span>Feb</span>
                            </div>
                            <div style={styles.heatmapGrid}>
                                {heatmapWeeks.map((week, wi) => (
                                    <div key={wi} style={styles.heatmapWeek}>
                                        {week.map((day, di) => (
                                            <div
                                                key={di}
                                                className="heat-cell"
                                                style={{
                                                    ...styles.heatCell,
                                                    backgroundColor: day.active ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)',
                                                    opacity: day.active ? 1 : 0.4
                                                }}
                                                title={day.date}
                                            ></div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                            <div style={styles.heatmapLegend}>
                                <span>Less</span>
                                <div style={{ ...styles.heatCell, backgroundColor: 'rgba(255,255,255,0.05)', opacity: 0.4 }}></div>
                                <div style={{ ...styles.heatCell, backgroundColor: 'var(--color-primary)', opacity: 0.4 }}></div>
                                <div style={{ ...styles.heatCell, backgroundColor: 'var(--color-primary)', opacity: 0.7 }}></div>
                                <div style={{ ...styles.heatCell, backgroundColor: 'var(--color-primary)', opacity: 1 }}></div>
                                <span>More</span>
                            </div>
                        </div>

                        <div style={styles.proTip}>
                            <Sparkles size={20} color="#fbbf24" />
                            <div>
                                <h4 style={{ margin: 0, fontSize: '14px' }}>Next Goal: {topicMastery.find(m => m.percentage < 100)?.topic || 'All Topics Mastered!'}</h4>
                                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                                    Solving 2 more problems in this topic will unlock the <b>Logic Ninja</b> badge.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: { height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', overflow: 'hidden' },
    header: { padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' },
    headerLeft: { display: 'flex', alignItems: 'center', gap: '16px' },
    titleIcon: { width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' },
    title: { margin: 0, fontSize: '20px', fontWeight: '700' },
    subtitle: { margin: '2px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' },
    closeBtn: { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' },
    scrollContent: { flex: 1, overflowY: 'auto', padding: '32px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' },
    statCard: { backgroundColor: 'var(--bg-secondary)', padding: '20px', borderRadius: '20px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '20px' },
    statIcon: { width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    statInfo: { display: 'flex', flexDirection: 'column' },
    statLabel: { fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' },
    statValue: { fontSize: '24px', fontWeight: '800' },
    mainLayout: { display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px' },
    sectionHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', color: 'var(--text-primary)' },
    masteryList: { display: 'flex', flexDirection: 'column', gap: '12px' },
    masteryRow: { backgroundColor: 'var(--bg-secondary)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px', transition: 'all 0.2s' },
    topicInfo: { width: '120px' },
    topicName: { display: 'block', fontSize: '14px', fontWeight: '700' },
    topicSolveCount: { fontSize: '11px', color: 'var(--text-muted)' },
    progressTrack: { flex: 1, height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: '4px', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' },
    percentageText: { fontSize: '14px', fontWeight: '800', width: '45px', textAlign: 'right' },
    badgeGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' },
    badge: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '13px', fontWeight: '600', color: '#fbbf24' },
    badgeLocked: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', opacity: 0.5 },
    heatmapBox: { backgroundColor: 'var(--bg-secondary)', padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)' },
    heatmapLabelRow: { display: 'flex', justifyContent: 'space-between', padding: '0 4px', marginBottom: '12px', fontSize: '11px', color: 'var(--text-muted)' },
    heatmapGrid: { display: 'flex', gap: '4px' },
    heatmapWeek: { display: 'flex', flexDirection: 'column', gap: '4px' },
    heatCell: { width: '12px', height: '12px', borderRadius: '3px' },
    heatmapLegend: { display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', marginTop: '16px', fontSize: '11px', color: 'var(--text-muted)' },
    proTip: { marginTop: '32px', padding: '20px', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', gap: '16px', alignItems: 'center' }
};

export default StudentDashboard;
