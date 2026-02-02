export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-5xl font-bold text-gray-900">
          Bienvenue sur ScoutMe
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          La plateforme qui connecte les talents du football africain aux opportunités
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            Je suis un joueur
          </button>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Je suis un recruteur
          </button>
        </div>
      </div>
    </div>
  );
}
