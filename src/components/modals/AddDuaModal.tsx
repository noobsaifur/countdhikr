import { useState } from 'react';
import { X } from 'lucide-react';

interface AddDuaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (arabic: string, desc: string) => void;
}

export function AddDuaModal({ isOpen, onClose, onSave }: AddDuaModalProps) {
  const [arabic, setArabic] = useState('');
  const [desc, setDesc] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!arabic.trim() && !desc.trim()) return;
    onSave(arabic.trim(), desc.trim());
    setArabic('');
    setDesc('');
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-[60] flex items-center justify-center animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="bg-card w-11/12 max-w-sm rounded-3xl p-6 shadow-2xl animate-scale-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-foreground text-lg">Add New Dua</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-secondary text-muted-foreground flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase">
              Arabic (Optional)
            </label>
            <textarea
              value={arabic}
              onChange={(e) => setArabic(e.target.value)}
              placeholder="Arabic text here..."
              className="w-full mt-1 p-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground h-20 font-arabic text-right"
              dir="rtl"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase">
              Description / Translation
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Meaning or title..."
              className="w-full mt-1 p-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground h-20"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 bg-foreground text-background rounded-xl font-bold shadow-lg hover:opacity-90 transition-all"
          >
            Save Dua
          </button>
        </div>
      </div>
    </div>
  );
}
