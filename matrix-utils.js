const MatrixUtils = {
    NumberHandler: {
        currentMode: 'integer', // Por defecto

        setMode: function(mode) {
            this.currentMode = mode;
        },

        validateNumber: function(value, mode = this.currentMode) {
            switch(mode) {
                case 'integer':
                    return Number.isInteger(value);
                case 'rational':
                    return true; // Las fracciones siempre son válidas
                case 'real':
                    return !isNaN(value);
                default:
                    return false;
            }
        },

        formatNumber: function(value, mode = this.currentMode) {
            switch(mode) {
                case 'integer':
                    return Math.round(value);
                case 'rational':
                    return this.toFraction(value);
                case 'real':
                    return parseFloat(value.toFixed(4));
                default:
                    return value;
            }
        },

        toFraction: function(decimal) {
            const tolerance = 1.0E-10;
            let h1 = 1;
            let h2 = 0;
            let k1 = 0;
            let k2 = 1;
            let b = decimal;

            do {
                let a = Math.floor(b);
                let aux = h1;
                h1 = a * h1 + h2;
                h2 = aux;
                aux = k1;
                k1 = a * k1 + k2;
                k2 = aux;
                b = 1 / (b - a);
            } while (Math.abs(decimal - h1 / k1) > decimal * tolerance);

            return { numerator: h1, denominator: k1 };
        },

        fromFraction: function(numerator, denominator) {
            return numerator / denominator;
        }
    },

    createMatrix: function(rows, cols, defaultValue = 1) {
        return Array(rows).fill().map(() => Array(cols).fill(defaultValue));
    },

    createMatrixInputs: function(matrixId, rows, cols) {
        const matrixDiv = document.getElementById(matrixId);
        matrixDiv.innerHTML = '';
        const mode = this.NumberHandler.currentMode;

        for (let i = 0; i < rows; i++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'matrix-row';

            for (let j = 0; j < cols; j++) {
                const cellDiv = document.createElement('div');
                cellDiv.className = `matrix-cell-input ${mode}-mode`;

                if (mode === 'rational') {
                    // Entrada para fracción
                    const numInput = document.createElement('input');
                    numInput.type = 'number';
                    numInput.className = 'matrix-value numerator';
                    numInput.value = '1';
                    numInput.step = '1';

                    const line = document.createElement('hr');
                    line.className = 'fraction-line';

                    const denInput = document.createElement('input');
                    denInput.type = 'number';
                    denInput.className = 'matrix-value denominator';
                    denInput.value = '1';
                    denInput.min = '1';
                    denInput.step = '1';

                    cellDiv.appendChild(numInput);
                    cellDiv.appendChild(line);
                    cellDiv.appendChild(denInput);
                } else {
                    // Entrada para enteros o reales
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.className = 'matrix-value';
                    input.value = '1';
                    input.step = mode === 'integer' ? '1' : 'any';
                    cellDiv.appendChild(input);
                }

                rowDiv.appendChild(cellDiv);
            }
            matrixDiv.appendChild(rowDiv);
        }
    },

    getMatrixFromInputs: function(matrixId) {
        const matrixDiv = document.getElementById(matrixId);
        const rows = matrixDiv.children.length;
        const cols = matrixDiv.children[0].children.length;
        const matrix = [];
        const mode = this.NumberHandler.currentMode;

        for (let i = 0; i < rows; i++) {
            const row = [];
            for (let j = 0; j < cols; j++) {
                let value;
                const cell = matrixDiv.children[i].children[j];

                if (mode === 'rational') {
                    const num = parseInt(cell.querySelector('.numerator').value) || 0;
                    const den = parseInt(cell.querySelector('.denominator').value) || 1;
                    value = this.NumberHandler.fromFraction(num, den);
                } else {
                    value = parseFloat(cell.querySelector('.matrix-value').value) || 0;
                    if (mode === 'integer') {
                        value = Math.round(value);
                    }
                }
                row.push(value);
            }
            matrix.push(row);
        }

        return matrix;
    },

    validateDimensions: function(matrixA, matrixB) {
        return matrixA[0].length === matrixB.length;
    },

    validateSumDimensions: function(matrix1, matrix2) {
        return matrix1.length === matrix2.length && 
               matrix1[0].length === matrix2[0].length;
    },

    addMatrices: function(matrix1, matrix2) {
        if (!this.validateSumDimensions(matrix1, matrix2)) {
            throw new Error("Las dimensiones de las matrices no son compatibles para la suma");
        }
        return matrix1.map((row, i) => 
            row.map((val, j) => val + matrix2[i][j])
        );
    },

    multiplyByScalar: function(matrix, scalar) {
        return matrix.map(row => 
            row.map(val => val * scalar)
        );
    },

    multiplyMatrices: function(matrix1, matrix2) {
        if (!this.validateDimensions(matrix1, matrix2)) {
            throw new Error("Las dimensiones no son compatibles para la multiplicación");
        }

        const result = [];
        for (let i = 0; i < matrix1.length; i++) {
            result[i] = [];
            for (let j = 0; j < matrix2[0].length; j++) {
                result[i][j] = 0;
                for (let k = 0; k < matrix2.length; k++) {
                    result[i][j] += matrix1[i][k] * matrix2[k][j];
                }
            }
        }
        return result;
    },

    matrixToLatex: function(matrix) {
        const mode = this.NumberHandler.currentMode;
        const rows = matrix.map(row => 
            row.map(val => {
                if (mode === 'rational') {
                    const frac = this.NumberHandler.toFraction(val);
                    return `\\frac{${frac.numerator}}{${frac.denominator}}`;
                } else if (mode === 'integer') {
                    return Math.round(val).toString();
                } else {
                    return val.toFixed(2);
                }
            }).join(" & ")
        ).join(" \\\\ ");
        return "\\begin{bmatrix}" + rows + "\\end{bmatrix}";
    }
};