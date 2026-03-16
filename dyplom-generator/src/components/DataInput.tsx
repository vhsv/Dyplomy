type DataInputProps ={
    selectedFields: string[]
    bulkData: string
    setBulkData: React.Dispatch<React.SetStateAction<string>>;
    setStep: React.Dispatch<React.SetStateAction<number>>;
    parseBulkData: () => void
}

function DataInput({selectedFields,bulkData, setBulkData,setStep, parseBulkData} : DataInputProps)
{
    return(
        <div className="data-input">
            <h2>Krok 3: Wprowadź dane</h2>
            
            <div className="fields-summary">
              <p>Pola do wypełnienia:</p>
              <div className="fields-list">
                {selectedFields.map((field, index) => (
                  <span key={index} className="field-tag">
                    {field}
                  </span>
                ))}
              </div>
            </div>

            <textarea 
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              placeholder={
                selectedFields.length === 1 
                  ? `Wprowadź dane dla pola "${selectedFields[0]}"\nKażda linia = jeden dyplom\n\nPrzykład:\nJan Kowalski\nAnna Nowak\nPiotr Wiśniewski`
                  : `Wprowadź dane w formacie: ${selectedFields.join(', ')}\nKażda linia = jeden dyplom\n\nPrzykład:\nJan, Kowalski\nAnna, Nowak\nPiotr, Wiśniewski`
              }
              rows={10}
              className="data-textarea"
            />

            <div className="actions">
              <button onClick={() => setStep(2)} className="btn-secondary">
                ← Wstecz
              </button>
              <button 
                onClick={parseBulkData} 
                className="btn-primary"
                disabled={!bulkData.trim()}
              >
                Przetwórz dane →
              </button>
            </div>
          </div>
    )
}
export default DataInput