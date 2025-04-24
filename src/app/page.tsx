import QuizSelector from "@/components/quiz-selector";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center p-4 bg-gray-50 flex-1">
      <div className="w-full max-w-3xl">
        <QuizSelector quizzesDirectory="/quizzes" />
      </div>
    </main>
  );
}
