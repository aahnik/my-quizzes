import QuizSelector from "@/components/quiz-selector";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Quiz Player
        </h1>
        <QuizSelector quizzesDirectory="/quizzes" />
      </div>
    </main>
  );
}
