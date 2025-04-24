import { Github } from 'lucide-react';

export default function Header() {
  return (
    <header className="w-full border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="font-semibold text-xl">My Quizzes</div>
        <a
          href="https://github.com/aahnik/my-quizzes"
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Github className="h-6 w-6" />
        </a>
      </div>
    </header>
  );
}
