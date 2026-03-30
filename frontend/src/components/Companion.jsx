import { useState } from 'react';

const Companion = ({ companion, onDelete }) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div style={{ position: 'relative', border: '1px solid black', padding: '10px', margin: '10px', minHeight: '100px' }}>
      <h2>{companion.name}</h2>
      <p>Description: {companion.description}</p>

      {/* Hidden Info Section */}
      {showInfo && (
        <div style={{ 
            position: 'absolute', 
            top: '0', 
            right: '40px', 
            background: 'white', 
            border: '1px solid black', 
            padding: '5px', 
            zIndex: 10 
        }}>
          <p>Personality: {companion.personality}</p>
          <p>Style: {companion.communicationStyle}</p>
          <p>Expertise: {companion.expertise}</p>
        </div>
      )}

      {/* Info Icon */}
      <div 
        onMouseEnter={() => setShowInfo(true)}
        onMouseLeave={() => setShowInfo(false)}
        style={{ 
          position: 'absolute', 
          bottom: '10px', 
          right: '10px', 
          width: '20px', 
          height: '20px', 
          borderRadius: '50%', 
          border: '1px solid black', 
          textAlign: 'center', 
          cursor: 'help',
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
        i
      </div>

      <button 
        style={{ backgroundColor: 'red', color: 'white' }} 
        onClick={() => onDelete(companion._id)}
      >
        Delete Companion
      </button>
    </div>
  );
};

export default Companion;
