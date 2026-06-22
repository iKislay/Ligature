import React from 'react';

export function SkylinePreview({ username = 'iKislay' }: { username?: string }) {
  return (
    <div className="w-full flex flex-col items-center justify-center p-6 bg-neutral-900 rounded-xl border border-neutral-800 shadow-xl overflow-hidden my-8">
      <div className="w-full flex justify-between items-center mb-4 px-2">
        <div className="text-white font-semibold flex items-center gap-2">
          <svg height="24" viewBox="0 0 16 16" version="1.1" width="24" className="fill-current text-white"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path></svg>
          {username}'s GitHub Skyline
        </div>
        <div className="text-xs text-neutral-400 bg-neutral-800 px-2 py-1 rounded-md">{new Date().getFullYear()}</div>
      </div>
      <img 
        src="https://github.com/user-attachments/assets/ed0fe34e-6825-4eb2-91d7-a0834966dc3a" 
        alt={`${username}'s Skyline Preview`}
        className="w-full max-w-[600px] rounded-lg shadow-2xl opacity-90 hover:opacity-100 transition-opacity object-cover"
      />
      <div className="w-full mt-6 flex gap-4 text-xs text-neutral-400 justify-center">
        <span>Generated via GitHub Actions</span>
        <span>•</span>
        <span>STL format</span>
      </div>
    </div>
  );
}
