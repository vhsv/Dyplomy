type PreviewProps = {
    fileContent: string
    setSelectedFields: React.Dispatch<React.SetStateAction<string[]>>;
    setStep: React.Dispatch<React.SetStateAction<number>>;
};

function Preview({fileContent, setSelectedFields,setStep} : PreviewProps)
{
    const findPlaceholders = (html: string): string[] => {
    const regex = /\{\{([^}]+)\}\}/g
    const matches = [...html.matchAll(regex)]
    return [...new Set(matches.map(match => match[1].trim()))]
  }

  const placeholders = findPlaceholders(fileContent)
    return(
        <div className="preview">
            <h2>Krok 2: Wykryte pola</h2>
            
            {placeholders.length > 0 ? (
              <div className="detected-fields">
                <h3>🔍 Znalezione pola w szablonie:</h3>
                <div className="fields-list">
                  {placeholders.map((field, index) => (
                    <span key={index} className="field-tag">
                      {field}
                    </span>
                  ))}
                </div>
                <button 
                  onClick={() => {
                    setSelectedFields(placeholders)
                    setStep(3)
                  }} 
                  className="btn-primary"
                  style={{ marginTop: '20px' }}
                >
                  Dalej - wprowadź dane →
                </button>
              </div>
            ) : (
              <div className="no-fields">
                <p>⚠️ Nie znaleziono pól w formacie {'{{nazwa}}'}</p>
                <p>Dodaj je ręcznie w szablonie lub wróć do kroku 1</p>
                <button onClick={() => setStep(1)} className="btn-secondary">
                  ← Wróć do kroku 1
                </button>
              </div>
            )}
        </div>
    )
}

export default Preview