import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GradeSelector } from './components/GradeSelector.tsx';
import { SubjectPicker } from './components/SubjectPicker.tsx';
import { ChatInterface } from './components/ChatInterface.tsx';
import {Practice} from './components/Practice.tsx';

const SUBJECTS = ["mathematics", "chemistry", "biology", "physics", "english", "kiswahili"];

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
     <div className='text-3xl font-bold mb-4 text-center'>Kenya Edu Assistant</div>
     <div className='text-lg font-medium mb-8 text-center'>Bridging Education and Artificial Intelligence</div>

      {/* Practice Flashcards Button */}
      <Button
  onClick={() => navigate('/practice')}
  className="mb-8 flex items-center justify-center gap-2 rounded-md bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-900"
>
  Practice With Flashcards
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 animate-pulse group-hover:text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 5l7 7-7 7"
    />
  </svg>
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