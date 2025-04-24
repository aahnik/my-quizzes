"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Brain,
  Code,
  FlaskRound,
  History,
  Globe,
  Music,
  Film,
  Dumbbell,
} from "lucide-react";
import QuizPlayer from "./quiz-player";

interface QuizInfo {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface QuizSelectorProps {
  quizzesDirectory: string;
}

// Map of icon names to Lucide components
const iconMap: Record<string, React.ElementType> = {
  "book-open": BookOpen,
  brain: Brain,
  code: Code,
  flask: FlaskRound,
  history: History,
  globe: Globe,
  music: Music,
  film: Film,
  dumbbell: Dumbbell,
};

export default function QuizSelector({ quizzesDirectory }: QuizSelectorProps) {
  const [quizzes, setQuizzes] = useState<QuizInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);

  // Function to render the icon component based on icon name
  const renderIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Brain; // Default to Brain icon if not found
    return <IconComponent className="h-6 w-6" />;
  };

  useEffect(() => {
    async function loadQuizzes() {
      try {
        const response = await fetch("/all-quizzes.json");
        const data = await response.json();
        setQuizzes(data.quizzes);
      } catch (error) {
        console.error("Failed to load quizzes:", error);
      } finally {
        setLoading(false);
      }
    }

    loadQuizzes();
  }, []);

  const handleQuizSelect = (quizId: string) => {
    setSelectedQuiz(quizId);
  };

  const handleBackToQuizzes = () => {
    setSelectedQuiz(null);
  };

  if (selectedQuiz) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={handleBackToQuizzes}
          className="mb-4"
        >
          ← Back to Quizzes
        </Button>
        <QuizPlayer
          jsonPath={`${quizzesDirectory}/${selectedQuiz}.json`}
          onComplete={handleBackToQuizzes}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card
            key={i}
            className="cursor-pointer hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Select a Quiz</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quizzes.map((quiz) => (
          <Card
            key={quiz.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleQuizSelect(quiz.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-gray-100">
                  {renderIcon(quiz.icon)}
                </div>
                <CardTitle>{quiz.title}</CardTitle>
              </div>
              <CardDescription>{quiz.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="h-24 flex items-center justify-center text-gray-400 bg-gray-50 rounded-md">
                <p className="text-sm">Click to start quiz</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Start Quiz</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
