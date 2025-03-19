// App.tsx
import { useState } from 'react'
import { GradeSelector } from './components/GradeSelector.tsx'
import { SubjectPicker } from './components/SubjectPicker.tsx'
import { ChatInterface } from './components/ChatInterface.tsx'


const SUBJECTS = ["mathematics", "chemistry", "biology", "physics", "english"]

export default function App() {
  const [grade, setGrade] = useState<'primary' | 'secondary'>()
  const [subject, setSubject] = useState<string>()

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Kenya Edu Assistant</h1>
      
      <GradeSelector onSelect={setGrade} />
      
      {grade && (
        <div className="mb-6">
          <SubjectPicker subjects={SUBJECTS} onSelect={setSubject} />
        </div>
      )}

      {subject && (
        <ChatInterface
          grade={grade}
          subject={subject}
          subjects={SUBJECTS}
        />
      )}
    </div>
  )
}