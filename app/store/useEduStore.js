'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useEduStore = create(
  persist(
    (set, get) => ({
      // ─── Identity ─────────────────────────────────────────
      studentUid: typeof window !== 'undefined'
        ? (localStorage.getItem('edubot_uid') || `student_${Date.now()}`)
        : `student_${Date.now()}`,

      // ─── Language & Subject ────────────────────────────────
      language: 'hi-IN',
      subject: 'Mathematics',
      currentTopic: '',

      // ─── Avatar ────────────────────────────────────────────
      avatarMood: 'idle', // idle | talking | thinking | happy | pointing | quiz

      // ─── Chat ─────────────────────────────────────────────
      chatHistory: [],
      isTyping: false,

      // ─── Quiz ─────────────────────────────────────────────
      quizState: {
        active: false,
        questions: [],
        currentIdx: 0,
        score: 0,
        answers: [],
      },

      // ─── Notes ────────────────────────────────────────────
      savedNotes: [],

      // ─── Settings ─────────────────────────────────────────
      voiceSpeed: 1.0,
      avatarSkin: 'default',
      soundEnabled: true,

      // ─── Actions ──────────────────────────────────────────
      setLanguage: (language) => set({ language }),
      setSubject: (subject) => set({ subject, currentTopic: '' }),
      setCurrentTopic: (currentTopic) => set({ currentTopic }),
      setAvatarMood: (avatarMood) => set({ avatarMood }),
      setIsTyping: (isTyping) => set({ isTyping }),

      addMessage: (role, content) => {
        const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        set((state) => ({
          chatHistory: [
            ...state.chatHistory,
            { role, content, timestamp: Date.now(), id },
          ],
        }));
      },

      updateLastMessage: (content) =>
        set((state) => {
          const history = [...state.chatHistory];
          if (history.length > 0) {
            history[history.length - 1] = { ...history[history.length - 1], content };
          }
          return { chatHistory: history };
        }),

      clearChat: () => set({ chatHistory: [] }),

      startQuiz: (questions) =>
        set({
          quizState: { active: true, questions, currentIdx: 0, score: 0, answers: [] },
          avatarMood: 'pointing',
        }),

      answerQuestion: (answer, correct) =>
        set((state) => ({
          quizState: {
            ...state.quizState,
            currentIdx: state.quizState.currentIdx + 1,
            score: correct ? state.quizState.score + 1 : state.quizState.score,
            answers: [...state.quizState.answers, { answer, correct }],
          },
          avatarMood: correct ? 'happy' : 'thinking',
        })),

      endQuiz: () =>
        set((state) => ({
          quizState: { ...state.quizState, active: false },
          avatarMood: 'happy',
        })),

      saveNote: (note) =>
        set((state) => ({
          savedNotes: [
            { ...note, id: `note_${Date.now()}`, savedAt: new Date().toISOString() },
            ...state.savedNotes,
          ],
        })),

      deleteNote: (id) =>
        set((state) => ({
          savedNotes: state.savedNotes.filter((n) => n.id !== id),
        })),

      setVoiceSpeed: (voiceSpeed) => set({ voiceSpeed }),
      setAvatarSkin: (avatarSkin) => set({ avatarSkin }),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
    }),
    {
      name: 'edubot-store',
      partialize: (state) => ({
        language: state.language,
        subject: state.subject,
        savedNotes: state.savedNotes,
        voiceSpeed: state.voiceSpeed,
        avatarSkin: state.avatarSkin,
        soundEnabled: state.soundEnabled,
        studentUid: state.studentUid,
      }),
    }
  )
);

export default useEduStore;
