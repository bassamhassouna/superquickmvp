import React, { useState } from 'react';
import PPTX from 'pptxjs';
import { saveAs } from 'file-saver';

function PowerPointParser() {
  const [slides, setSlides] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        // Initialize pptx.js
        const pptx = new PPTX();
        
        // Load the PowerPoint file
        await pptx.load(e.target.result);
        
        // Get all slides
        const slideData = [];
        for (let i = 0; i < pptx.getSlideCount(); i++) {
          const slide = pptx.getSlide(i);
          slideData.push({
            number: i + 1,
            text: slide.text, // Extract text
            notes: slide.notes, // Extract speaker notes if available
            // You can also extract images, shapes, etc.
          });
        }
        
        setSlides(slideData);
      } catch (error) {
        console.error('Error parsing PowerPoint:', error);
        alert('Error parsing PowerPoint file');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div>
      <h1>PowerPoint Parser</h1>
      <input type="file" accept=".pptx" onChange={handleFileUpload} />
      
      {slides.length > 0 && (
        <div>
          <h2>Slides:</h2>
          {slides.map((slide, index) => (
            <div key={index} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
              <h3>Slide {slide.number}</h3>
              <p>{slide.text}</p>
              {slide.notes && (
                <div style={{ marginTop: '10px', fontStyle: 'italic' }}>
                  <strong>Notes:</strong> {slide.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PowerPointParser;