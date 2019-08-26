import React from 'react';

const CSVReader = ({
  onFileLoaded,
  onError
}) => {
  let fileContent = undefined;

  const handleChangeFile = e => {
    try {
      let reader = new FileReader();
      const filename = e.target.files[0].name;

      reader.onload = event => {
        const csvData = PapaParse.parse(
          event.target.result,
          Object.assign(parserOptions, {
            error: onError
          })
        );
        onFileLoaded(csvData.data, filename);
      };

      reader.readAsText(e.target.files[0]);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <input
        type="file"
        id={inputId}
        accept=".csv, text/csv"
        onChange={e => handleChangeFile(e)}
      />
    </div>
  );
};

CSVReader.propTypes = {
  cssClass: string,
  cssInputClass: string,
  label: oneOfType([string, element]),
  onFileLoaded: func.isRequired,
  onError: func,
  inputId: string
};

export default CSVReader;
