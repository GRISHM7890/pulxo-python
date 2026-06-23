import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { ref, onValue, set, update } from 'firebase/database';
import { useAuth } from './AuthContext';

const GamificationContext = createContext();

export const ACHIEVEMENTS = {
    first_run: { id: 'first_run', title: 'First Run', desc: 'Execute your first program in the workspace!', rarity: 'common', xp: 50 },
    hello_world: { id: 'hello_world', title: 'Hello World Master', desc: 'Compile a script that outputs a Hello World greeting!', rarity: 'common', xp: 50 },
    bug_hunter: { id: 'bug_hunter', title: 'Bug Hunter', desc: 'Successfully apply a suggestion from the AI logic guard!', rarity: 'common', xp: 50 },
    syntax_survivor: { id: 'syntax_survivor', title: 'Syntax Survivor', desc: 'Compile code 5 times in a row without syntax errors!', rarity: 'rare', xp: 100 },
    infinite_loop_destroyer: { id: 'infinite_loop_destroyer', title: 'Infinite Loops Destroyer', desc: 'Correctly implement loop controls that terminate cleanly!', rarity: 'rare', xp: 100 },
    night_coder: { id: 'night_coder', title: 'Night Coder', desc: 'Burn the midnight oil! Compile code between 12 AM and 5 AM!', rarity: 'rare', xp: 100 },
    python_explorer: { id: 'python_explorer', title: 'Python Explorer', desc: 'Structure modular code using 3 or more custom functions!', rarity: 'rare', xp: 100 },
    ai_apprentice: { id: 'ai_apprentice', title: 'AI Apprentice', desc: 'Leverage logic audit tools to inspect your workspaces!', rarity: 'epic', xp: 250 },
    fast_debugger: { id: 'fast_debugger', title: 'Fast Debugger', desc: 'Fix a syntax error or warning within 30 seconds of run!', rarity: 'epic', xp: 250 },
    lines_1000: { id: 'lines_1000', title: '1000 Lines Written', desc: 'Compile a total of 1000 lines of functional code!', rarity: 'epic', xp: 250 },
    error_slayer: { id: 'error_slayer', title: 'Error Slayer', desc: 'Squash 3 or more bugs in a single workspace session!', rarity: 'legendary', xp: 500 },
    logic_master: { id: 'logic_master', title: 'Logic Master', desc: 'Define nested logic with zero compilation alerts!', rarity: 'legendary', xp: 500 }
};

export function useGamification() {
    return useContext(GamificationContext);
}

const calculateLevel = (xp) => {
    // Basic curve: Level 1 = 0 XP, Level 2 = 100 XP, Level 3 = 300 XP, Level 4 = 600 XP, Level N = 100 * (N*(N-1))/2
    return Math.floor((1 + Math.sqrt(1 + 8 * xp / 100)) / 2);
};

const xpForLevel = (level) => {
    return 100 * (level * (level - 1)) / 2;
};

const getRank = (level) => {
    if (level < 5) return 'Bronze Scripter';
    if (level < 10) return 'Silver Hacker';
    if (level < 20) return 'Gold Developer';
    if (level < 35) return 'Platinum Architect';
    if (level < 50) return 'Diamond Master';
    return 'Grandmaster';
};

export function GamificationProvider({ children }) {
    const { user } = useAuth();
    const [gamificationData, setGamificationData] = useState({
        xp: 0,
        level: 1,
        rank: 'Bronze Scripter',
        streak: 0,
        lastCodingDate: null,
        streakFreezes: 1,
        dailyGoalCompleted: false,
        streakBoostActive: false,
        comebackBonusEligible: false,
        completedMissions: {},
        unlockedAchievements: {},
        totalRuns: 0,
        successfulRuns: 0,
        fixesApplied: 0,
        totalLinesWritten: 0,
        showLevelUp: false,
        levelUpData: null
    });

    const [previousLevel, setPreviousLevel] = useState(null);
    const [activeToast, setActiveToast] = useState(null);

    // XP needed for current to next level
    const currentLevelXP = xpForLevel(gamificationData.level);
    const nextLevelXP = xpForLevel(gamificationData.level + 1);
    const xpProgress = gamificationData.xp - currentLevelXP;
    const xpRequired = nextLevelXP - currentLevelXP;
    const progressPercent = Math.min(100, Math.max(0, (xpProgress / xpRequired) * 100));

    useEffect(() => {
        if (!user) return;

        const gRef = ref(db, `users/${user.uid}/gamification`);
        const unsubscribe = onValue(gRef, (snap) => {
            if (snap.exists()) {
                const data = snap.val();
                const level = calculateLevel(data.xp || 0);
                const rank = getRank(level);
                
                const today = new Date().toDateString();
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toDateString();

                let streak = data.streak || 0;
                let lastCodingDate = data.lastCodingDate || null;
                let streakFreezes = data.streakFreezes !== undefined ? data.streakFreezes : 1;
                let comebackBonusEligible = data.comebackBonusEligible || false;
                let dailyGoalCompleted = lastCodingDate === today;

                // Handle streak expiration or freeze protection
                if (lastCodingDate && lastCodingDate !== today && lastCodingDate !== yesterdayStr) {
                    // Missed coding day!
                    if (streakFreezes > 0 && streak > 0) {
                        // Protect streak!
                        streakFreezes -= 1;
                        lastCodingDate = yesterdayStr; // Pretend they coded yesterday, keeping the streak alive!
                        // Update DB quietly
                        update(gRef, { streakFreezes, lastCodingDate: yesterdayStr });
                    } else if (streak > 0) {
                        // Reset streak but trigger comeback bonus opportunity
                        streak = 0;
                        comebackBonusEligible = true;
                        update(gRef, { streak: 0, comebackBonusEligible: true });
                    }
                }

                // Periodic freeze grant (give 1 free freeze if they have 0 and it's been a week)
                let lastFreezeGrant = data.lastFreezeGrant || null;
                const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
                if (!lastFreezeGrant || (Date.now() - lastFreezeGrant > oneWeekMs)) {
                    if (streakFreezes < 2) {
                        streakFreezes = Math.min(2, streakFreezes + 1);
                        update(gRef, { streakFreezes, lastFreezeGrant: Date.now() });
                    }
                }

                const streakBoostActive = streak >= 3;

                let showLevelUp = gamificationData.showLevelUp;
                let levelUpData = gamificationData.levelUpData;

                if (previousLevel !== null && level > previousLevel) {
                    showLevelUp = true;
                    levelUpData = level;
                }
                
                if (previousLevel === null || level !== previousLevel) {
                    setPreviousLevel(level);
                }

                setGamificationData(prev => ({
                    ...data,
                    level,
                    rank,
                    streak,
                    lastCodingDate,
                    streakFreezes,
                    dailyGoalCompleted,
                    streakBoostActive,
                    comebackBonusEligible,
                    unlockedAchievements: data.unlockedAchievements || {},
                    totalRuns: data.totalRuns || 0,
                    successfulRuns: data.successfulRuns || 0,
                    fixesApplied: data.fixesApplied || 0,
                    totalLinesWritten: data.totalLinesWritten || 0,
                    pythonRuns: data.pythonRuns || 0,
                    pythonSuccessfulRuns: data.pythonSuccessfulRuns || 0,
                    pythonLinesWritten: data.pythonLinesWritten || 0,
                    sqlRuns: data.sqlRuns || 0,
                    sqlSuccessfulRuns: data.sqlSuccessfulRuns || 0,
                    sqlLinesWritten: data.sqlLinesWritten || 0,
                    fastestDebugTime: data.fastestDebugTime !== undefined ? data.fastestDebugTime : null,
                    xp: data.xp || 0,
                    showLevelUp,
                    levelUpData
                }));
            } else {
                // Initialize
                set(gRef, {
                    xp: 0,
                    streak: 0,
                    lastCodingDate: null,
                    streakFreezes: 1,
                    comebackBonusEligible: false,
                    lastFreezeGrant: Date.now(),
                    completedMissions: {},
                    unlockedAchievements: {},
                    totalRuns: 0,
                    successfulRuns: 0,
                    fixesApplied: 0,
                    totalLinesWritten: 0,
                    pythonRuns: 0,
                    pythonSuccessfulRuns: 0,
                    pythonLinesWritten: 0,
                    sqlRuns: 0,
                    sqlSuccessfulRuns: 0,
                    sqlLinesWritten: 0,
                    fastestDebugTime: null
                });
            }
        });

        return () => unsubscribe();
    }, [user]);

    const addXP = async (amount) => {
        if (!user) return;
        let finalAmount = amount;
        if (gamificationData.streakBoostActive) {
            finalAmount = Math.round(amount * 1.2); // +20% Streak Boost!
        }
        const newXp = (gamificationData.xp || 0) + finalAmount;
        await update(ref(db, `users/${user.uid}/gamification`), { xp: newXp });
    };

    const completeDailyGoal = async () => {
        if (!user || gamificationData.dailyGoalCompleted) return;

        const today = new Date().toDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        let newStreak = gamificationData.streak || 0;
        let xpReward = 15; // Base Daily coding XP
        let showComebackToast = false;

        // Calculate new streak
        if (gamificationData.lastCodingDate === yesterdayStr || gamificationData.lastCodingDate === null) {
            newStreak += 1;
        }

        // Apply Comeback Bonus
        if (gamificationData.comebackBonusEligible) {
            xpReward += 50; // +50 Comeback XP!
            showComebackToast = true;
        }

        const updates = {
            streak: newStreak,
            lastCodingDate: today,
            comebackBonusEligible: false
        };

        await update(ref(db, `users/${user.uid}/gamification`), updates);
        await addXP(xpReward);

        return {
            streak: newStreak,
            xpEarned: xpReward,
            streakBoostActive: newStreak >= 3,
            comeback: showComebackToast
        };
    };

    const claimWeeklyReward = async () => {
        if (!user || gamificationData.streak < 7) return;
        // Grant a free streak freeze (up to 2 max) and +100 XP
        let freezes = gamificationData.streakFreezes || 0;
        freezes = Math.min(2, freezes + 1);
        
        await update(ref(db, `users/${user.uid}/gamification`), {
            streakFreezes: freezes
        });
        await addXP(100);
        alert("🎉 Huzzah! Hitting a 7-day coding streak unlocked +100 XP and a Streak Freeze! ❄️");
    };

    const claimMonthlyReward = async () => {
        if (!user || gamificationData.streak < 30) return;
        await addXP(500);
        alert("🪐 Incredible! Monthly coder milestone reached! +500 XP granted!");
    };

    const unlockAchievement = async (id) => {
        if (!user) return;
        
        // Prevent duplicate unlocking
        if (gamificationData.unlockedAchievements && gamificationData.unlockedAchievements[id]) return;

        const ach = ACHIEVEMENTS[id];
        if (!ach) return;

        const updates = {};
        updates[`unlockedAchievements/${id}`] = true;
        
        await update(ref(db, `users/${user.uid}/gamification`), updates);
        await addXP(ach.xp);
        
        // Trigger local toast overlay
        setActiveToast(ach);
    };

    const incrementStat = async (statName, incrementValue = 1) => {
        if (!user) return;
        const currentVal = gamificationData[statName] || 0;
        const newVal = currentVal + incrementValue;
        
        const updates = {};
        updates[statName] = newVal;
        await update(ref(db, `users/${user.uid}/gamification`), updates);
        return newVal;
    };

    const updateFastestDebugTime = async (duration) => {
        if (!user) return;
        const current = gamificationData.fastestDebugTime || null;
        if (current === null || duration < current) {
            await update(ref(db, `users/${user.uid}/gamification`), { fastestDebugTime: duration });
        }
    };

    const completeMission = async (missionId, xpReward) => {
        if (!user) return;
        const updates = {};
        updates[`completedMissions/${missionId}`] = true;
        updates[`xp`] = (gamificationData.xp || 0) + xpReward;
        await update(ref(db, `users/${user.uid}/gamification`), updates);
    };

    const dismissLevelUp = () => {
        setGamificationData(prev => ({ ...prev, showLevelUp: false, levelUpData: null }));
    };

    const value = {
        ...gamificationData,
        currentLevelXP,
        nextLevelXP,
        progressPercent,
        addXP,
        completeDailyGoal,
        claimWeeklyReward,
        claimMonthlyReward,
        unlockAchievement,
        incrementStat,
        completeMission,
        updateFastestDebugTime,
        dismissLevelUp,
        activeToast,
        setActiveToast
    };

    return (
        <GamificationContext.Provider value={value}>
            {children}
        </GamificationContext.Provider>
    );
}
