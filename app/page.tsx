import LeafDetector from "./component/LeafDetector";
import PlantHealthChecker from "./component/PlantHealthChecker";

export default function Home() {
  return (
    <div className="min-h-screen text-gray-800">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        {/* Header */}
        <header className="text-center mb-20">
          <div className="relative mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-3xl shadow-2xl mb-6 animate-bounce-slow">
              <span className="text-4xl drop-shadow-sm">🌿</span>
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-ping opacity-75"></div>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6 leading-tight">
            <span className="flex items-center justify-center gap-3 flex-wrap">
              Plant Disease 🌿
              <span className="text-3xl">•</span>
              Rice Disease 🌾
              <span className="text-3xl">•</span>
              AI Plant Health 🤖
            </span>
            <span className="block">Detector</span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8">
            Unreliable{" "}
            <span className="font-bold text-transparent bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text">AI-powered</span>{" "}
            plant disease detection using Popular{" "}
            <span className="font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-lg">YOLOv8s</span>{" "}
            models and{" "}
            <span className="font-semibold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg">Google Gemini AI</span>. 
            Detect diseases in crops and rice with exceptional accuracy — all processed{" "}
            <span className="underline decoration-green-500 decoration-2">directly in your browser</span>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-green-700 shadow-lg border border-green-200">
              <span className="text-lg">🔒</span>
              <span>Privacy-first: All processing happens locally</span>
            </div>
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-blue-700 shadow-lg border border-blue-200">
              <span className="text-lg">⚡</span>
              <span>Real-time analysis with instant results</span>
            </div>
          </div>
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse delay-100"></div>
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse delay-200"></div>
          </div>
        </header>

        {/* Main */}
        <main className="relative space-y-20">
          {/* Disease Detection Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 to-emerald-600/5 rounded-3xl blur-3xl"></div>
            <div className="relative bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl p-8 lg:p-12 max-w-5xl mx-auto border border-white/20 shadow-green-500/10">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
              </div>
              <LeafDetector />
            </div>
          </div>

                  <p className="text-center">
           <strong className="font-semibold">Took like 5 minutes to code this part :(</strong>
          </p>
          <p className="text-center">
           <strong className="font-semibold">Wasted 16 hours for training models for just this to beat me</strong>
          </p>
          {/* AI Health Checker Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 to-teal-600/5 rounded-3xl blur-3xl"></div>
            <div className="relative bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl p-8 lg:p-12 max-w-5xl mx-auto border border-white/20 shadow-emerald-500/10">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
              </div>
              <PlantHealthChecker />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative pt-16">
          <div className="absolute inset-0 bg-gradient-to-t from-white via-green-50/30 to-transparent"></div>
          <div className="relative max-w-6xl mx-auto">
            {/* Footer Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="group text-center p-8 rounded-2xl bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 border border-green-100/50 hover:border-green-200">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  📚
                </div>
                <h3 className="font-bold text-gray-900 mb-4 text-xl group-hover:text-green-700 transition-colors">
                  Documentation
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Comprehensive guides and tutorials to help you get the most out of our plant disease detection system
                </p>
                <a
                  href="https://github.com/Thonjen/plant-disease-detector-yolov8s/wiki"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-green-700 hover:text-green-900 text-sm font-medium"
                >
                  <span>View Docs</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>

              <div className="group text-center p-8 rounded-2xl bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 border border-blue-100/50 hover:border-blue-200">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  💻
                </div>
                <h3 className="font-bold text-gray-900 mb-4 text-xl group-hover:text-blue-700 transition-colors">
                  GitHub Repository
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Explore the source code, contribute to the project, and collaborate with the community
                </p>
                <a
                  href="https://github.com/Thonjen/plant-disease-detector-yolov8s"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 text-sm font-medium"
                >
                  <span>View on GitHub</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>

<div className="group text-center p-8 rounded-2xl bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 border border-purple-100/50 hover:border-purple-200">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  📧
                </div>
                <h3 className="font-bold text-gray-900 mb-4 text-xl group-hover:text-purple-700 transition-colors">
                  Contact Support
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Need help or have questions? We’re here to assist. I know its not the same as the other two
                </p>
                <a
                  href="https://imgflip.com/i/62yy6q"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-purple-700 hover:text-purple-900 text-sm font-medium"
                >
                  <span>Get Support</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="text-center pb-12">
              <div className="mb-12">
                <h4 className="text-lg font-semibold text-gray-700 mb-6">Powered by Popular technology</h4>
                <div className="flex flex-wrap justify-center items-center gap-4">
                  <div className="flex items-center gap-3 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-green-200/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse-slow"></div>
                    <span className="text-sm font-medium text-gray-700">YOLOv8s</span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-blue-200/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    <span className="text-sm font-medium text-gray-700">ONNX Runtime</span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-purple-200/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                    <span className="text-sm font-medium text-gray-700">Next.js</span>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-teal-200/50 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105">
                    <div className="w-3 h-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
                    <span className="text-sm font-medium text-gray-700">Tailwind CSS v4</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200/50 pt-8">
                <p className="text-sm text-gray-500 mb-2">
                  © 2025 Plant Disease Detector
                </p>
                <p className="text-xs text-gray-400">
                  Built with ❤️ for agricultural professionals and enthusiasts worldwide
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
