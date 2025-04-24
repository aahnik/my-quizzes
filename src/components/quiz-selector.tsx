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
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
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
  questionCount: number;
  topics: string[];
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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredQuizzes = quizzes.filter((quiz) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      quiz.title.toLowerCase().includes(searchLower) ||
      quiz.description.toLowerCase().includes(searchLower) ||
      quiz.topics.some((topic) => topic.toLowerCase().includes(searchLower))
    );
  });

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
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-6 w-4" />
        <Input
          type="text"
          placeholder="Search quizzes by title, description or topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-8"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredQuizzes.map((quiz) => (
          <Card
            key={quiz.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleQuizSelect(quiz.id)}
          >
            <CardHeader className="pb-1">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-gray-100">
                  {renderIcon(quiz.icon)}
                </div>
                <CardTitle>{quiz.title}</CardTitle>
              </div>
              <CardDescription>{quiz.description}</CardDescription>
            </CardHeader>
            <CardContent className="">
              <div className="h-20 flex flex-col gap-1.5 p-1 bg-gray-50 rounded-md">
                <div className="text-md text-gray-600">
                  {quiz.questionCount} Questions
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {quiz.topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-0.5 text-sm rounded-full bg-gray-200 text-gray-700"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
            {/* <CardFooter>
              <Button className="w-full">Start Quiz</Button>
            </CardFooter> */}
          </Card>
        ))}
      </div>
    </div>
  );
}
