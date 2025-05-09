"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup } from "@/components/ui/radio-group";
import { CheckCircle, XCircle, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface QuizQuestion {
  question: string;
  answers: string[];
  correct_key: number[]; // This is required and will always be an array
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  icon: string;
  questions: QuizQuestion[];
}

interface QuizResult {
  quizId: string;
  quizTitle: string;
  date: string;
  score: number;
  totalQuestions: number;
  percentage: number;
}

interface QuizPlayerProps {
  jsonPath: string;
  onComplete?: () => void;
}

export default function QuizPlayer({ jsonPath, onComplete }: QuizPlayerProps) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizComplete, setQuizComplete] = useState(false);
  const [previousResults, setPreviousResults] = useState<QuizResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Extract quiz ID from the path
  const quizId = jsonPath.split("/").pop()?.replace(".json", "") || "";

  // Load previous results from localStorage
  useEffect(() => {
    const storedResults = localStorage.getItem("quizResults");
    if (storedResults) {
      setPreviousResults(JSON.parse(storedResults));
    }
  }, []);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        // For development purposes, we'll use a mock quiz if the fetch fails
        // This helps with development in environments where the JSON files might not be accessible

        // Try to fetch the quiz from the JSON file
        const response = await fetch(jsonPath);

        // If the fetch fails, use the mock quiz
        // if (!response.ok) {
        //   console.warn(
        //     `Failed to fetch quiz from ${jsonPath}, using mock data instead`,
        //   );
        //   const mockQuiz = mockQuizzes[quizId as keyof typeof mockQuizzes];
        //   if (mockQuiz) {
        //     setQuiz(mockQuiz);
        //     setLoading(false);
        //     return;
        //   } else {
        //     throw new Error(`No mock quiz found for ID: ${quizId}`);
        //   }
        // }

        // If the fetch succeeds, use the fetched quiz
        const data = await response.json();
        setQuiz(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load quiz:", error);
        setError("Failed to load quiz. Please try another one.");
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [jsonPath, quizId]);

  const questions = quiz?.questions || [];
  const currentQuestion =
    !quizComplete && questions.length > 0
      ? questions[currentQuestionIndex]
      : null;
  const isMultipleChoice = currentQuestion
    ? currentQuestion.correct_key.length > 1
    : false;
  const progress =
    questions.length > 0 ? (currentQuestionIndex / questions.length) * 100 : 0;

  const handleSingleAnswerSelect = (index: number) => {
    setSelectedAnswers([index]);
  };

  const handleMultiAnswerSelect = (index: number) => {
    setSelectedAnswers((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const handleSubmit = () => {
    if (!hasSubmitted && currentQuestion) {
      const isCorrect =
        currentQuestion.correct_key.length === selectedAnswers.length &&
        currentQuestion.correct_key.every((key) =>
          selectedAnswers.includes(key),
        );

      if (isCorrect) {
        setScore(score + 1);
      }

      setHasSubmitted(true);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswers([]);
      setHasSubmitted(false);
    } else {
      // This is the last question, complete the quiz
      completeQuiz();
    }
  };

  const completeQuiz = () => {
    setQuizComplete(true);

    if (quiz) {
      // Save result to localStorage
      const result: QuizResult = {
        quizId,
        quizTitle: quiz.title,
        date: new Date().toLocaleString(),
        score: score,
        totalQuestions: questions.length,
        percentage: Math.round((score / questions.length) * 100),
      };

      const updatedResults = [...previousResults, result];
      localStorage.setItem("quizResults", JSON.stringify(updatedResults));
      setPreviousResults(updatedResults);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswers([]);
    setHasSubmitted(false);
    setQuizComplete(false);
  };

  const isAnswerCorrect = (index: number) => {
    return currentQuestion?.correct_key.includes(index) || false;
  };

  // Handle keyboard shortcuts
  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (quizComplete) return;

      const key = e.key.toLowerCase();

      // Handle option selection (a-d)
      if (!hasSubmitted && currentQuestion) {
        const optionIndex = key.charCodeAt(0) - "a".charCodeAt(0);
        if (optionIndex >= 0 && optionIndex < currentQuestion.answers.length) {
          if (isMultipleChoice) {
            handleMultiAnswerSelect(optionIndex);
          } else {
            handleSingleAnswerSelect(optionIndex);
          }
          return;
        }
      }

      // Handle enter for submit/next
      if (key === "enter") {
        if (!hasSubmitted && selectedAnswers.length > 0) {
          handleSubmit();
        } else if (hasSubmitted) {
          handleNext();
        }
        return;
      }

      // Handle escape to clear selection
      if (key === "escape" && !hasSubmitted) {
        setSelectedAnswers([]);
      }
    },
    [currentQuestion, hasSubmitted, selectedAnswers.length, isMultipleChoice],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);
  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-gray-600">
            <p className="mb-4">{error}</p>
            {onComplete && (
              <Button onClick={onComplete}>Back to Quiz Selection</Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!quiz) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-gray-600">
            No quiz found. Please check the JSON file path.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (quizComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    // Filter results for this specific quiz
    const quizResults = previousResults.filter(
      (result) => result.quizId === quizId,
    );

    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Trophy className="h-16 w-16 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {quiz.title} - Complete!
            </h2>
            <p className="text-gray-500 mb-6">{quiz.description}</p>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xl mb-2">
                Your score: {score} out of {questions.length}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className={`h-4 rounded-full ${
                    percentage >= 70
                      ? "bg-green-500"
                      : percentage >= 40
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
              <p className="text-lg font-medium">{percentage}%</p>
            </div>

            {quizResults.length > 1 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">
                  Your History with This Quiz
                </h3>
                <div className="max-h-40 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-2 text-left">Date</th>
                        <th className="p-2 text-right">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quizResults
                        .slice(0, -1)
                        .reverse()
                        .map((result, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{result.date}</td>
                            <td className="p-2 text-right">
                              {result.score}/{result.totalQuestions} (
                              {result.percentage}%)
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={restartQuiz} className="flex-1">
                Take Quiz Again
              </Button>
              {onComplete && (
                <Button
                  onClick={onComplete}
                  variant="outline"
                  className="flex-1"
                >
                  Back to Quiz Selection
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
        <div>
          <h2 className="text-xl font-semibold">{quiz.title}</h2>
          <p className="text-sm text-gray-500">{quiz.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-gray-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
          <div className="text-sm font-medium text-gray-500">
            Score: {score}
          </div>
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      <Card className="w-full">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-6">
            {currentQuestion?.question}
          </h2>

          {isMultipleChoice ? (
            <div className="space-y-2">
              {currentQuestion?.answers.map((answer, index) => (
                <div key={index}>
                  <button
                    type="button"
                    className={cn(
                      "w-full flex items-center px-4 py-2 rounded-lg transition-colors",
                      "border-2 hover:border-blue-400",
                      selectedAnswers.includes(index) &&
                        !hasSubmitted &&
                        "border-blue-500 bg-blue-50",
                      hasSubmitted &&
                        isAnswerCorrect(index) &&
                        "border-green-500 bg-green-50",
                      hasSubmitted &&
                        selectedAnswers.includes(index) &&
                        !isAnswerCorrect(index) &&
                        "border-red-500 bg-red-50",
                      "disabled:opacity-100",
                    )}
                    disabled={hasSubmitted}
                    onClick={() =>
                      !hasSubmitted && handleMultiAnswerSelect(index)
                    }
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center rounded-md w-8 h-8 mr-3 font-semibold",
                        "border-2",
                        selectedAnswers.includes(index) &&
                          !hasSubmitted &&
                          "border-blue-500 bg-blue-100",
                        hasSubmitted &&
                          isAnswerCorrect(index) &&
                          "border-green-500 bg-green-100",
                        hasSubmitted &&
                          selectedAnswers.includes(index) &&
                          !isAnswerCorrect(index) &&
                          "border-red-500 bg-red-100",
                      )}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-grow text-left">{answer}</span>
                    {hasSubmitted && isAnswerCorrect(index) && (
                      <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                    )}
                    {hasSubmitted &&
                      selectedAnswers.includes(index) &&
                      !isAnswerCorrect(index) && (
                        <XCircle className="h-5 w-5 text-red-500 ml-2" />
                      )}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <RadioGroup
              value={selectedAnswers[0]?.toString() || ""}
              onValueChange={(value) =>
                !hasSubmitted &&
                handleSingleAnswerSelect(Number.parseInt(value))
              }
              className="space-y-1"
              disabled={hasSubmitted}
            >
              {currentQuestion?.answers.map((answer, index) => (
                <div key={index}>
                  <button
                    type="button"
                    className={cn(
                      "w-full flex items-center px-4 py-2 rounded-lg transition-colors",
                      "border-2 hover:border-blue-400",
                      selectedAnswers.includes(index) &&
                        !hasSubmitted &&
                        "border-blue-500 bg-blue-50",
                      hasSubmitted &&
                        isAnswerCorrect(index) &&
                        "border-green-500 bg-green-50",
                      hasSubmitted &&
                        selectedAnswers.includes(index) &&
                        !isAnswerCorrect(index) &&
                        "border-red-500 bg-red-50",
                      "disabled:opacity-100",
                    )}
                    disabled={hasSubmitted}
                    onClick={() =>
                      !hasSubmitted && handleSingleAnswerSelect(index)
                    }
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center rounded-md w-8 h-8 mr-3 font-semibold",
                        "border-2",
                        selectedAnswers.includes(index) &&
                          !hasSubmitted &&
                          "border-blue-500 bg-blue-100",
                        hasSubmitted &&
                          isAnswerCorrect(index) &&
                          "border-green-500 bg-green-100",
                        hasSubmitted &&
                          selectedAnswers.includes(index) &&
                          !isAnswerCorrect(index) &&
                          "border-red-500 bg-red-100",
                      )}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="flex-grow text-left">{answer}</span>
                    {hasSubmitted && isAnswerCorrect(index) && (
                      <CheckCircle className="h-5 w-5 text-green-500 ml-2" />
                    )}
                    {hasSubmitted &&
                      selectedAnswers.includes(index) &&
                      !isAnswerCorrect(index) && (
                        <XCircle className="h-5 w-5 text-red-500 ml-2" />
                      )}
                  </button>
                </div>
              ))}
            </RadioGroup>
          )}

          <div className="mt-6 flex justify-between">
            {!hasSubmitted ? (
              <Button
                onClick={handleSubmit}
                disabled={selectedAnswers.length === 0}
                className="w-full"
              >
                Submit Answer
              </Button>
            ) : (
              <Button onClick={handleNext} className="w-full">
                {currentQuestionIndex < questions.length - 1
                  ? "Next Question"
                  : "See Results"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
