import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { GradeSelector } from '../components/GradeSelector';
import { SubjectPicker } from '../components/SubjectPicker';
import axios from 'axios';

interface FlashCard {
  question: string;
  answer: string;
}

export function Practice() {
  const [grade, setGrade] = useState<'primary' | 'secondary'>();
  const [subject, setSubject] = useState<string>();
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // new states for animations
  const [cardAnimation, setCardAnimation] = useState('');
  const [flipAnimation, setFlipAnimation] = useState('');

  const navigate = useNavigate();

  const generateFlashcards = async () => {
    if (!grade || !subject) return;
    setIsLoading(true);
    // Clear any existing flashcards so that the previous card disappears.
    setFlashcards([]);
    
    try {
      const response = await axios.post('http://localhost:8000/generate-flashcards', {
        subject,
        grade_level: grade
      });
      
      setFlashcards(response.data.flashcards);
      setCurrentIndex(0);
      setShowAnswer(false);
    } catch (error) {
      console.error('Error generating flashcards:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    if (flashcards.length === 0) return;
    
    // Trigger fade-out animation
    setCardAnimation('fade-out');
    
    // After the animation duration, update the card index and reset animation
    setTimeout(() => {
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        alert('All flashcards completed! Recycling questions...');
        setCurrentIndex(0);
      }
      setShowAnswer(false);
      setCardAnimation(''); // reset animation state
    }, 300); // duration matches the CSS animation duration
  };

  const toggleShowAnswer = () => {
    // Trigger flip animation
    setFlipAnimation('flip');
    setTimeout(() => {
      setShowAnswer(prev => !prev);
      setFlipAnimation('');
    }, 300); // duration should match the CSS flip animation duration
  };

  return (
    <div className="min-h-screen p-8">
      <Button onClick={() => navigate('/')} className="mb-8">
        Back to Home
      </Button>

      <div className="max-w-2xl mx-auto">
        <div className='text-3xl font-bold mb-4 text-center'>Kenya Edu Assistant</div>
        <div className='text-lg font-medium mb-8 text-center'>Bridging Education and Artificial Intelligence</div>
        <Card>
          <CardHeader>
            <CardTitle>Practice with Flashcards</CardTitle>
            <CardDescription>Select a grade and subject to generate flashcards.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-8">
              <GradeSelector onSelect={setGrade} />
              {grade && (
                <SubjectPicker
                  subjects={["mathematics", "chemistry", "biology", "physics","kiswahili", "english"]}
                  onSelect={setSubject}
                />
              )}
            </div>

            <Button 
              onClick={generateFlashcards}
              disabled={!grade || !subject || isLoading}
              className="mb-8"
            >
              {isLoading ? 'Generating...' : 'Generate Flashcards'}
            </Button>

            {flashcards.length > 0 && (
              <Card className={`${cardAnimation}`}>
                <CardHeader>
                  <CardTitle>
                    Flashcard {currentIndex + 1} of {flashcards.length}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* In show mode, question is rendered in a smaller, lighter font */}
                  <p
                    className={`mb-4 transition-all duration-300 ${
                      showAnswer ? 'text-sm text-gray-500' : 'text-lg font-semibold'
                    } ${flipAnimation}`}
                  >
                    {flashcards[currentIndex].question}
                  </p>
                  {showAnswer && (
                    <p className="mt-4 text-xl font-bold text-gray-800 transition-all duration-300">
                      {flashcards[currentIndex].answer}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex gap-4 justify-end">
                  <Button
                    variant="destructive"
                    onClick={handleClear}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={toggleShowAnswer}
                  >
                    {showAnswer ? 'Hide' : 'Show'} Answer
                  </Button>
                </CardFooter>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
