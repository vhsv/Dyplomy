type UploaderProps = {
    handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    loading: boolean;
    fileName: string;
};

function Uploader({handleFileUpload, loading, fileName} : UploaderProps)
{



    return(
        <div className="uploader">
            <h2>Krok 1: Wgraj szablon dyplomu</h2>
            
            <div className="file-input-container">
              <input 
                type="file" 
                onChange={handleFileUpload}
                accept=".docx,.txt"
                className="file-input"
                id="file-upload"
                disabled={loading}
              />
              <label htmlFor="file-upload" className="file-label">
                {loading ? ' Wczytywanie...' : 'Wybierz plik'}
              </label>
            </div>

            {fileName && (
              <div className="file-info">
                <p>Wybrano: {fileName}</p>
              </div>
            )}

            <div className="supported-formats">
              <h3>Obsługiwane formaty:</h3>
              <ul>
                <li> Microsoft Word (.docx) - z zachowaniem formatowania</li>
                <li>Tekstowy (.txt) - prosty tekst</li>
              </ul>
            </div>

            <div className="hint">
              <p> Wskazówka: W swoim szablonie użyj znaczników <code>{'{{nazwa_pola}}'}</code></p>
              <p className="example">Przykład: "Szanowny/a <strong>{'{{imie}} {{nazwisko}}'}</strong>"</p>
            </div>
          </div>
    )
}
export default Uploader