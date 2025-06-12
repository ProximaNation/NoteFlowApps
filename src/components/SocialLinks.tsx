
import React from 'react';
import { Youtube, Instagram, ExternalLink } from 'lucide-react';

const SocialLinks = () => {
  return (
    <div className="flex items-center justify-center space-x-4 p-4">
      <a
        href="https://www.youtube.com/channel/UCi84fOMGApCB8xzbugtFElw?sub_confirmation=1"
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
      >
        <Youtube size={20} className="text-white" />
      </a>
      
      <a
        href="https://www.instagram.com/itx_decim/"
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
      >
        <Instagram size={20} className="text-white" />
      </a>
    </div>
  );
};

export default SocialLinks;
