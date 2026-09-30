/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  getUserProfile,
  saveUserProfile,
  getBiomarkerReadings,
  addBiomarkerReading,
  deleteBiomarkerReading,
  getLabDocuments,
  saveLabDocument,
  deleteLabDocument,
  getDailyBioLogs,
  saveDailyBioLog,
  logoutUser,
  getInitialDemoBiomarkers,
  getInitialDemoLabDocs,
  getInitialDemoDailyLogs
} from './lib/firebase';
import { UserProfile, BiomarkerReading, LabDocument, DailyBioLog, SystemScoreBreakdown, BioBalanceInsight } from './types';
import { calculateSystemScores, generateBalanceInsights } from './lib/balanceScore';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { BiomarkersView } from './components/BiomarkersView';
import { LabFilesView } from './components/LabFilesView';
import { DailyLogView } from './components/DailyLogView';
import { AdvisorView } from './components/AdvisorView';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { AddBiomarkerModal } from './components/AddBiomarkerModal';
import { UploadLabModal } from './components/UploadLabModal';
import { ShieldCheck, Heart } from 'lucide-react';

type AppTab = 'dashboard' | 'biomarkers' | 'lab_vault' | 'daily_log' | 'advisor';

const DEFAULT_TAB: AppTab = 'dashboard';
const APP_TABS = new Set<AppTab>(['dashboard', 'biomarkers', 'lab_vault', 'daily_log', 'advisor']);

function getTabFromLocation(): AppTab {
  const rawTab = window.location.hash.replace(/^#/, '') as AppTab;
  return APP_TABS.has(rawTab) ? rawTab : DEFAULT_TAB;
}

export default function App() {
  // Route boot starts from the URL so a refresh preserves the current view.
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<AppTab>(() => getTabFromLocation());

  const [biomarkers, setBiomarkers] = useState<BiomarkerReading[]>([]);
  const [labDocs, setLabDocs] = useState<LabDocument[]>([]);
  const [dailyLogs, setDailyLogs] = useState<DailyBioLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAddReadingOpen, setIsAddReadingOpen] = useState(false);
  const [isUploadLabOpen, setIsUploadLabOpen] = useState(false);
  const [preselectedBioId, setPreselectedBioId] = useState<string | undefined>(undefined);

  // Browser back/forward and manually edited hashes update the rendered tab.
  useEffect(() => {
    const handleRouteChange = () => setActiveTab(getTabFromLocation());
    window.addEventListener('hashchange', handleRouteChange);
    return () => window.removeEventListener('hashchange', handleRouteChange);
  }, []);

  // All in-app navigation is reflected in the URL without adding duplicate history entries.
  useEffect(() => {
    const nextHash = `#${activeTab}`;
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, '', nextHash);
    }
  }, [activeTab]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await loadUserData(user.uid, user.email || '', user.displayName || '');
      } else {
        const defaultUid = 'demo_user_longevity_pro';
        const demoUser = {
          uid: defaultUid,
          email: 'alex.mercer@biobalance.health',
          displayName: 'Alex Mercer',
          isDemo: true
        };
        setCurrentUser(demoUser);
        await loadUserData(defaultUid, demoUser.email, demoUser.displayName);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUserData = async (uid: string, email: string, displayName: string) => {
    try {
      let userProf = await getUserProfile(uid);
      if (!userProf) {
        userProf = {
          uid,
          email,
          displayName: displayName || 'Alex Mercer',
          age: 34,
          biologicalSex: 'male',
          bloodType: 'O+',
          weightLbs: 172,
          heightInches: 70,
          primaryHealthGoal: 'Metabolic Longevity',
          unitSystem: 'standard',
          bioBalanceScore: 91,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        };
        await saveUserProfile(userProf);
      }
      setProfile(userProf);
      setBiomarkers(await getBiomarkerReadings(uid));
      setLabDocs(await getLabDocuments(uid));
      setDailyLogs(await getDailyBioLogs(uid));
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  const scoreBreakdown: SystemScoreBreakdown = calculateSystemScores(biomarkers, dailyLogs);
  const insights: BioBalanceInsight[] = generateBalanceInsights(biomarkers, dailyLogs);

  const handleAddBiomarker = async (reading: Omit<BiomarkerReading, 'id'>) => {
    const created = await addBiomarkerReading(reading);
    setBiomarkers(prev => [created, ...prev]);
  };

  const handleDeleteBiomarker = async (readingId: string) => {
    if (!currentUser) return;
    await deleteBiomarkerReading(currentUser.uid, readingId);
    setBiomarkers(prev => prev.filter(b => b.id !== readingId));
  };

  const handleSaveLabDoc = async (docData: Omit<LabDocument, 'id'>) => {
    const saved = await saveLabDocument(docData);
    setLabDocs(prev => [saved, ...prev]);
    return saved;
  };

  const handleDeleteLabDoc = async (docId: string) => {
    if (!currentUser) return;
    await deleteLabDocument(currentUser.uid, docId);
    setLabDocs(prev => prev.filter(d => d.id !== docId));
  };

  const handleSaveDailyLog = async (logData: Omit<DailyBioLog, 'id'>) => {
    const saved = await saveDailyBioLog(logData);
    setDailyLogs(prev => {
      const idx = prev.findIndex(l => l.date === saved.date);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [saved, ...prev];
    });
  };

  const handleBatchAddBiomarkers = async (newReadings: Array<Omit<BiomarkerReading, 'id'>>) => {
    const addedList: BiomarkerReading[] = [];
    for (const reading of newReadings) {
      addedList.push(await addBiomarkerReading(reading));
    }
    setBiomarkers(prev => [...addedList, ...prev]);
  };

  const handleLogout = async () => {
    await logoutUser();
    const defaultUid = 'demo_user_longevity_pro';
    const demoUser = {
      uid: defaultUid,
      email: 'alex.mercer@biobalance.health',
      displayName: 'Alex Mercer',
      isDemo: true
    };
    setCurrentUser(demoUser);
    await loadUserData(defaultUid, demoUser.email, demoUser.displayName);
    setActiveTab(DEFAULT_TAB);
  };

  const handleAuthSuccess = async (user: any) => {
    setCurrentUser(user);
    await loadUserData(user.uid, user.email || '', user.displayName || '');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center animate-pulse">
          <Heart className="w-6 h-6 text-emerald-400" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-base font-bold font-heading tracking-tight">BIO BALANCE</h2>
          <p className="text-xs text-slate-400">Calibrating biological algorithms & lab archives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={currentUser}
        profile={profile}
        scoreBreakdown={scoreBreakdown}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAddReading={() => {
          setPreselectedBioId(undefined);
          setIsAddReadingOpen(true);
        }}
        onOpenUploadLab={() => setIsUploadLabOpen(true)}
        onOpenDailyLog={() => setActiveTab('daily_log')}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            profile={profile}
            biomarkers={biomarkers}
            labDocs={labDocs}
            dailyLogs={dailyLogs}
            scoreBreakdown={scoreBreakdown}
            insights={insights}
            onNavigateTab={(tab) => setActiveTab(tab as AppTab)}
            onOpenAddReading={(bioId) => {
              setPreselectedBioId(bioId);
              setIsAddReadingOpen(true);
            }}
            onOpenUploadLab={() => setIsUploadLabOpen(true)}
            onOpenDailyLog={() => setActiveTab('daily_log')}
          />
        )}

        {activeTab === 'biomarkers' && (
          <BiomarkersView
            biomarkers={biomarkers}
            onOpenAddReading={(bioId) => {
              setPreselectedBioId(bioId);
              setIsAddReadingOpen(true);
            }}
            onDeleteReading={handleDeleteBiomarker}
          />
        )}

        {activeTab === 'lab_vault' && (
          <LabFilesView
            labDocs={labDocs}
            onOpenUploadLab={() => setIsUploadLabOpen(true)}
            onDeleteDocument={handleDeleteLabDoc}
            onBatchAddBiomarkers={handleBatchAddBiomarkers}
          />
        )}

        {activeTab === 'daily_log' && (
          <DailyLogView
            userId={currentUser?.uid || 'demo'}
            dailyLogs={dailyLogs}
            onSaveDailyLog={handleSaveDailyLog}
          />
        )}

        {activeTab === 'advisor' && (
          <AdvisorView
            insights={insights}
            biomarkers={biomarkers}
            profile={profile}
            onOpenAddReading={(bioId) => {
              setPreselectedBioId(bioId);
              setIsAddReadingOpen(true);
            }}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-emerald-600 flex items-center justify-center text-white text-[10px] font-black">B</div>
            <span className="font-bold text-slate-800">BIO BALANCE</span>
            <span>• Personal Biomarker & Health Intelligence</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-700 font-bold"><ShieldCheck className="w-4 h-4" /><span>Patient Data Partitioned & Encrypted</span></span>
            <span>v2.4.0</span>
          </div>
        </div>
      </footer>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onSuccess={handleAuthSuccess} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} profile={profile} onUpdateProfile={(updated) => setProfile(updated)} allBiomarkers={biomarkers} allDocs={labDocs} allLogs={dailyLogs} />
      <AddBiomarkerModal isOpen={isAddReadingOpen} onClose={() => setIsAddReadingOpen(false)} userId={currentUser?.uid || 'demo'} onAddReading={handleAddBiomarker} availableDocs={labDocs} preselectedBiomarkerId={preselectedBioId} />
      <UploadLabModal isOpen={isUploadLabOpen} onClose={() => setIsUploadLabOpen(false)} userId={currentUser?.uid || 'demo'} onSaveLabDocument={handleSaveLabDoc} onBatchAddBiomarkers={handleBatchAddBiomarkers} />
    </div>
  );
}
