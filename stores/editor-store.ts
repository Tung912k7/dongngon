import { create } from 'zustand';

interface EditorState {
  workId: string | null;
  content: string;
  isSubmitting: boolean;
  error: string | null;
  warning: string | null;
  notification: {
    isOpen: boolean;
    message: string;
    type: "error" | "success" | "info";
    title?: string;
  };
  setWorkId: (workId: string | null) => void;
  setContent: (content: string) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setError: (error: string | null) => void;
  setWarning: (warning: string | null) => void;
  showNotification: (message: string, type?: "error" | "success" | "info", title?: string) => void;
  closeNotification: () => void;
  reset: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  workId: null,
  content: "",
  isSubmitting: false,
  error: null,
  warning: null,
  notification: {
    isOpen: false,
    message: "",
    type: "info",
  },
  setWorkId: (workId) => set({ workId }),
  setContent: (content) => set({ content }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  setError: (error) => set({ error }),
  setWarning: (warning) => set({ warning }),
  showNotification: (message, type = "info", title) => 
    set({ notification: { isOpen: true, message, type, title } }),
  closeNotification: () => 
    set((state) => ({ notification: { ...state.notification, isOpen: false } })),
  reset: () => set({ content: "", error: null, warning: null }),
}));
