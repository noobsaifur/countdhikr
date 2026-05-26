import { useState } from 'react';
import { X } from 'lucide-react';

interface AddDhikrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, target: number) => void;
}

export function AddDhikrModal({ isOpen, onClose, onSave }: AddDhikrModalProps) {
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('33');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(title.trim(), parseInt(target) || 33);
    setTitle('');
    setTarget('33');
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
          <h3 className="font-bold text-foreground text-lg">Add New Dhikr</h3>
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
              Title / English Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Subhan Allah"
              className="w-full mt-1 p-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase">
              Target Count
            </label>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. 33"
              className="w-full mt-1 p-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 bg-foreground text-background rounded-xl font-bold shadow-lg hover:opacity-90 transition-all"
          >
            Save Dhikr
          </button>
        </div>
      </div>
    </div>
  );
}
