document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const validationMessage = document.getElementById('validationMessage');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const typeButtons = document.querySelectorAll('.type-btn');

    // Inicializar matrices
    function initializeMatrices() {
        const matrices = ['A', 'B', 'C', 'D'];
        matrices.forEach(matrix => {
            const rows = document.getElementById(`rows${matrix}`).value;
            const cols = document.getElementById(`cols${matrix}`).value;
            MatrixUtils.createMatrixInputs(`matrix${matrix}`, parseInt(rows), parseInt(cols));
        });
    }

    // Manejar cambios en tipo de operación
    typeButtons.forEach(button => {
        button.addEventListener('click', () => {
            typeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const newMode = button.getAttribute('data-type');
            MatrixUtils.NumberHandler.setMode(newMode);

            initializeMatrices();
        });
    });

    // Manejar cambios en dimensiones
    function handleDimensionChange() {
        const matrices = ['A', 'B', 'C', 'D'];
        matrices.forEach(matrix => {
            const rowsInput = document.getElementById(`rows${matrix}`);
            const colsInput = document.getElementById(`cols${matrix}`);
            
            [rowsInput, colsInput].forEach(input => {
                input.addEventListener('change', () => {
                    MatrixUtils.createMatrixInputs(
                        `matrix${matrix}`, 
                        parseInt(rowsInput.value), 
                        parseInt(colsInput.value)
                    );
                });
            });
        });
    }

    // Manejar tabs
    function setupTabs() {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                tabButtons.forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });

                button.classList.add('active');
                const tabId = button.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
            });
        });
    }

    // Calcular resultados
    function calculateResults() {
        try {
            // Obtener matrices
            const matrixA = MatrixUtils.getMatrixFromInputs('matrixA');
            const matrixB = MatrixUtils.getMatrixFromInputs('matrixB');
            const matrixC = MatrixUtils.getMatrixFromInputs('matrixC');
            const matrixD = MatrixUtils.getMatrixFromInputs('matrixD');

            // Obtener escalares
            const c1 = parseFloat(document.getElementById('c1').value);
            const c2 = parseFloat(document.getElementById('c2').value);
            const c3 = parseFloat(document.getElementById('c3').value);
            const c4 = parseFloat(document.getElementById('c4').value);

            // Validar dimensiones
            if (!MatrixUtils.validateSumDimensions(matrixB, matrixC)) {
                throw new Error("Las matrices B y C deben tener las mismas dimensiones");
            }

            // Calcular B + C
            const BplusC = MatrixUtils.addMatrices(matrixB, matrixC);

            // Calcular A(B+C)D
            const temp1 = MatrixUtils.multiplyMatrices(matrixA, BplusC);
            const ABCD = MatrixUtils.multiplyMatrices(temp1, matrixD);

            // Calcular (c₁A)((c₂B+c₃C))(c₄D)
            const c2B = MatrixUtils.multiplyByScalar(matrixB, c2);
            const c3C = MatrixUtils.multiplyByScalar(matrixC, c3);
            const c2Bc3C = MatrixUtils.addMatrices(c2B, c3C);
            const c1A = MatrixUtils.multiplyByScalar(matrixA, c1);
            const c4D = MatrixUtils.multiplyByScalar(matrixD, c4);
            const temp2 = MatrixUtils.multiplyMatrices(c1A, c2Bc3C);
            const scalarResult = MatrixUtils.multiplyMatrices(temp2, c4D);

            // Mostrar resultados
            showResults(matrixB, matrixC, BplusC, ABCD, scalarResult, {c1, c2, c3, c4});

            validationMessage.style.display = 'none';
        } catch (error) {
            validationMessage.textContent = error.message;
            validationMessage.style.display = 'block';
        }
    }

    // Mostrar resultados
    function showResults(B, C, BplusC, ABCD, scalarResult, scalars) {
        const mode = MatrixUtils.NumberHandler.currentMode;

        // Resultado de suma
        document.getElementById('sumBCResult').innerHTML = `
            <div class="math-step">
                <h4>Matrices originales:</h4>
                B = $${MatrixUtils.matrixToLatex(B)}$<br>
                C = $${MatrixUtils.matrixToLatex(C)}$
            </div>
            <div class="math-step">
                <h4>Resultado B + C:</h4>
                $${MatrixUtils.matrixToLatex(BplusC)}$
            </div>
        `;

        // Resultado de productos
        document.getElementById('productABCDResult').innerHTML = `
            <div class="math-step">
                <h4>Resultado A(B+C)D:</h4>
                $${MatrixUtils.matrixToLatex(ABCD)}$
            </div>
        `;

        document.getElementById('scalarProductResult').innerHTML = `
            <div class="math-step">
                <h4>Resultado (c₁A)((c₂B+c₃C))(c₄D):</h4>
                <p>Escalares: c₁=${scalars.c1}, c₂=${scalars.c2}, c₃=${scalars.c3}, c₄=${scalars.c4}</p>
                $${MatrixUtils.matrixToLatex(scalarResult)}$
            </div>
        `;

        // Actualizar MathJax
        MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
    }

    // Reiniciar valores
    function resetValues() {
        const matrices = ['A', 'B', 'C', 'D'];
        matrices.forEach(matrix => {
            document.getElementById(`rows${matrix}`).value = '2';
            document.getElementById(`cols${matrix}`).value = '2';
        });

        document.getElementById('c1').value = '1';
        document.getElementById('c2').value = '1';
        document.getElementById('c3').value = '1';
        document.getElementById('c4').value = '1';

        initializeMatrices();

        document.getElementById('sumBCResult').innerHTML = '';
        document.getElementById('productABCDResult').innerHTML = '';
        document.getElementById('scalarProductResult').innerHTML = '';
        validationMessage.style.display = 'none';
    }

    // Event listeners
    calculateBtn.addEventListener('click', calculateResults);
    resetBtn.addEventListener('click', resetValues);

    // Inicialización
    initializeMatrices();
    handleDimensionChange();
    setupTabs();
});