export default function Footer() {
  return (
    <footer className="w-full border-t mt-auto">
      <div className="container mx-auto px-4 h-16 flex items-center justify-center">
        <p className="text-sm text-gray-600">
          Made with ❤️ by{' '}
          <a
            href="https://github.com/aahnik"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:underline"
          >
            aahnik
          </a>
        </p>
      </div>
    </footer>
  );
}
