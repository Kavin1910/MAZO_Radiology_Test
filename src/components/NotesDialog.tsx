import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { type MedicalCase } from '@/hooks/useMedicalCases';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NotesDialogProps {
  case: MedicalCase;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateCase: (updatedCase: MedicalCase) => void;
}

interface Note {
  id: string;
  content: string;
  author: string;
  timestamp: string;
}

export const NotesDialog: React.FC<NotesDialogProps> = ({ 
  case: caseData, 
  open, 
  onOpenChange,
  onUpdateCase
}) => {
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load existing notes when dialog opens
  useEffect(() => {
    if (open && caseData) {
      loadExistingNotes();
    }
  }, [open, caseData.id]);

  const loadExistingNotes = () => {
    // Parse existing notes from the findings field or radiologist_notes
    const existingNotes: Note[] = [];
    
    // Add initial assessment if findings exist
    if (caseData.findings) {
      existingNotes.push({
        id: '1',
        content: caseData.findings,
        author: 'AI Analysis',
        timestamp: caseData.createdAt
      });
    }
    
    // Parse any existing radiologist notes that might contain multiple notes
    if (caseData.radiologistNotes) {
      const radiologistNotes = caseData.radiologistNotes;
      
      // Check if notes are in a structured format (look for [Voice Note] or timestamp patterns)
      const noteLines = radiologistNotes.split('\n\n');
      noteLines.forEach((line, index) => {
        if (line.trim()) {
          const isVoiceNote = line.includes('[Voice Note]');
          existingNotes.push({
            id: `note-${index + 2}`,
            content: line.replace('[Voice Note]: ', ''),
            author: isVoiceNote ? 'Voice Note' : 'Manual Note',
            timestamp: caseData.updatedAt
          });
        }
      });
    }
    
    setNotes(existingNotes);
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setIsLoading(true);
    
    try {
      const note: Note = {
        id: Date.now().toString(),
        content: newNote,
        author: 'Current User', // In a real app, this would come from auth
        timestamp: new Date().toISOString()
      };

      // Add note to local state immediately for better UX
      const updatedNotes = [note, ...notes];
      setNotes(updatedNotes);
      
      // Prepare the updated radiologist notes
      const allUserNotes = updatedNotes
        .filter(n => n.author !== 'AI Analysis') // Exclude AI findings
        .map(n => `[${n.author}]: ${n.content}`)
        .join('\n\n');
      
      // Update the case in the database
      const { error } = await supabase
        .from('medical_cases')
        .update({
          radiologist_notes: allUserNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', caseData.id);

      if (error) {
        console.error('Error saving note to database:', error);
        // Revert local state on error
        setNotes(notes);
        throw error;
      }

      // Update the case in the parent component
      const updatedCase: MedicalCase = {
        ...caseData,
        radiologistNotes: allUserNotes,
        updatedAt: new Date().toISOString(),
      };
      
      onUpdateCase(updatedCase);
      setNewNote('');
      
      toast({
        title: "Note Added",
        description: "Your note has been saved to the case.",
      });
      
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save note. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Notes - {caseData.patientName} ({caseData.patientId})</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Add New Note</label>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Enter your note here..."
              className="w-full p-3 border rounded-md resize-none"
              rows={4}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Previous Notes ({notes.length})</h4>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notes.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No notes added yet. Add your first note above.
                </div>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="p-3 border rounded-lg bg-slate-50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm text-slate-700">{note.author}</span>
                      <span className="text-xs text-slate-500">{formatDate(note.timestamp)}</span>
                    </div>
                    <p className="text-slate-600 whitespace-pre-wrap">{note.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button 
            onClick={handleAddNote} 
            disabled={!newNote.trim() || isLoading}
          >
            <Plus className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Add Note'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
