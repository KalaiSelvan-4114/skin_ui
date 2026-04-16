import React from 'react';

function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h4 className="font-bold text-lg mb-4">Derma Assist</h4>
            <p className="text-gray-400 text-sm">
              Skin health information portal with educational guidance
              and nearby dermatologist search.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Disclaimer</h4>
            <p className="text-gray-400 text-sm">
              This tool is for educational purposes only and does not
              provide diagnosis or treatment. Always consult a
              qualified dermatologist for medical advice.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-4">Technology</h4>
            <div className="flex flex-wrap gap-2">
              {['Flask', 'React', 'Tailwind', 'OpenStreetMap'].map((tech) => (
                <span 
                  key={tech}
                  className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-xs"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-500 text-sm">
          © 2026 Derma Assist. Built with ❤️ using Deep Learning.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
