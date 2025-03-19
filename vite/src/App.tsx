import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GradeSelector } from './components/GradeSelector.tsx';
import { SubjectPicker } from './components/SubjectPicker.tsx';
import { ChatInterface } from './components/ChatInterface.tsx';
import {Practice} from './components/Practice.tsx';

const SUBJECTS = ["mathematics", "chemistry", "biology", "physics", "english"];

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/practice" element={<Practice />} />
      </Routes>
    </Router>
  );
}

function HomePage() {
  const [grade, setGrade] = useState<'primary' | 'secondary'>();
  const [subject, setSubject] = useState<string>();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Kenya Edu Assistant</h1>

      {/* Practice Flashcards Button */}
      <Button 
        onClick={() => navigate('/practice')}
        className="mb-8"
      >
        Practice With Flashcards
      </Button>

      {/* Grade and Subject Selection */}
      <GradeSelector onSelect={setGrade} />
      
      {grade && (
        <div className="mb-6">
          <SubjectPicker subjects={SUBJECTS} onSelect={setSubject} />
        </div>
      )}

      {/* Chat Interface */}
      {subject && (
        <ChatInterface
          grade={grade}
          subject={subject}
          subjects={SUBJECTS}
        />
      )}
    </div>
  );
}