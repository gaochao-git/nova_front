import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-blue-100">
      {/* Header */}
      <header className="flex justify-between items-center p-4">
        <div className="flex items-center">
          <Image
            src="/svg/logo.svg" // 更新为您的 logo 路径
            alt="Your Logo"
            width={120}
            height={30}
            className="mr-2"
          />
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="text-gray-600 hover:text-gray-900">API Documentation</a>
          <a href="#" className="text-gray-600 hover:text-gray-900">English</a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-blue-500 mb-4">基础设施智能运维平台</h1>
        </div>

        <div className="flex justify-center max-w-4xl w-full">
          <a href="/chat" className="bg-white rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow" style={{ minWidth: '320px', minHeight: '160px' }}>
            <h3 className="text-2xl font-semibold text-gray-800">开始体验</h3>
          </a>
        </div>
      </main>

      {/* Background wave effect - can be added with a background SVG */}
      <div className="h-40 bg-contain bg-bottom bg-no-repeat" 
           style={{ backgroundImage: "url('/wave.svg')" }}>
      </div>
    </div>
  );
}
