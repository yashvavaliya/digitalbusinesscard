import React from 'react'
import { Database, AlertCircle, ExternalLink } from 'lucide-react'

export default function SetupInstructions() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Database className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Setup Required</h1>
            <p className="text-gray-600">
              To use the Digital Business Card Builder, you need to set up Supabase first.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-amber-800 mb-2">Setup Instructions</h3>
                <ol className="text-amber-700 space-y-2 text-sm">
                  <li>1. Click the "Connect to Supabase" button in the top right corner</li>
                  <li>2. Follow the setup wizard to create your Supabase project</li>
                  <li>3. The database tables will be created automatically</li>
                  <li>4. Once connected, you can start creating business cards!</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="text-center">
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Learn More About Supabase
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}