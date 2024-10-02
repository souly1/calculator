// Force the page to scroll to the top on reload or load
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/calculator/sw.js')
            .then(registration => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    });
}
window.addEventListener('load', function() {
    this.setTimeout(() => {
        window.scrollTo(0, 0); // Scroll to the top of the page
        this.setTimeout(() => {
            window.addEventListener('scroll', function() {
                if (window.scrollY > window.innerHeight / 2) {
                    window.removeEventListener('scroll', arguments.callee);
                    this.setTimeout(() => {
                        document.body.classList.add('no-scroll');
                        document.documentElement.classList.add('no-scroll');
                    }, 1000);                 
                }
            });
        }, 10);
    }, 100);

    let equalsClickCount = 0;
    let lastSum = 0;
    let lastOperator = null;
    let isNumberClickedLast = false;
    let numOfRulerClicked = 0;
    let numOfAdvancedClicked = 0;
    const numberButtons = document.querySelectorAll('.number-button');
    const operationButtons = document.querySelectorAll('.operation-button');
    const deleteButton = document.getElementById('icon-delete');
    const equalsButton = document.getElementById('button-equals');
    const plusMinusButton = document.getElementById('button-plus-minus');
    const dotButton = document.getElementById('button-dot');
    const clearButton = document.getElementById('button-clear');
    const percentButton = document.getElementById('button-percent');
    const fullscreenButton = document.getElementById('fullscreen-button');
    const iconAdvanced = document.getElementById('icon-advanced');
    const iconRuler = document.getElementById('icon-ruler');
    const advancedSettingsWindow = this.document.getElementById('advanced-settings');
    const advancedClearButton = document.getElementById('advanced-clear-button');
    const advancedCancelButton = document.getElementById('advanced-cancel-button');
    const advancedSaveButton = document.getElementById('advanced-save-button');
    const iterationInput = document.getElementById('iteration');
    const value1Input = document.getElementById('value-1');
    const value2Input = document.getElementById('value-2');
    const value3Input = document.getElementById('value-3');

    function enterFullscreen() {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) { // Firefox
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) { // Chrome, Safari, and Opera
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) { // IE/Edge
            document.documentElement.msRequestFullscreen();
        }

        fullscreenButton.classList.toggle('hidden');
    }
    
    fullscreenButton.addEventListener('click', enterFullscreen);

    // Select the output div where you want to display the clicked button value
    const result = document.getElementById('result');

    iconAdvanced.addEventListener('click', () => {
        numOfAdvancedClicked++;
        if (numOfAdvancedClicked > 3) {
            advancedSettingsWindow.classList.toggle('hidden');
        }
    });

    iconRuler.addEventListener('click', () => {
        numOfRulerClicked++;
        if (numOfRulerClicked === 3) {
            const curreText = [result.innerText];
            localStorage.setItem("nextResults", JSON.stringify(curreText));
            setForceInterval(1);
            result.innerText = '';
            numOfRulerClicked = 0;
        }
    });

    deleteButton.addEventListener('click', () => {
        result.innerText = result.innerText.slice(0, result.innerText.length-1);
        isNumberClickedLast = true;
        setIsFinalResult(false);
    });

    equalsButton.addEventListener('click', () => {
        equalsClickCount++;
        calculateLastOperation();
        isNumberClickedLast = false;
        checkForce();
        setIsFinalResult(true);
    });

    plusMinusButton.addEventListener('click', () => {
        result.innerText = result.innerText * -1;
        isNumberClickedLast = false;
        setIsFinalResult(false);
    });

    dotButton.addEventListener('click', () => {
        result.innerText = (+result.innerText).toString() + '.';
        isNumberClickedLast = true;
        setIsFinalResult(false);
    });

    clearButton.addEventListener('click', () => {
        numOfAdvancedClicked = 0;
        lastSum = 0;
        lastOperator = null;
        result.innerText = '';
        isNumberClickedLast = false;
        setIsFinalResult(false);
    });

    percentButton.addEventListener('click', () => {
        if (!!result.innerText) {
            result.innerText = result.innerText / 100;
        }
    });

    numberButtons.forEach(numberButton => {
        numberButton.addEventListener('click', function(elem) {
            numberClicked(+this.attributes.getNamedItem('value').value);
        });
    });

    operationButtons.forEach(operationButton => {
        operationButton.addEventListener('click', function() {
            // Get the button's value
            const operator = this.attributes.getNamedItem('value').value;
    
            operatorClicked(operator);
        });
    });

    const numberClicked = (clickedValue) => {
        if (isNumberClickedLast) {
            result.innerText = +(result.innerText.toString() + clickedValue.toString());
        } else {
            result.innerText = clickedValue;
        }
        isNumberClickedLast = true;
        setIsFinalResult(false);
    }

    const operatorClicked = (operator) => {
        calculateLastOperation();
        lastOperator = operator;
        isNumberClickedLast = false;
        setIsFinalResult(false);
    }

    const calculateLastOperation = () => {
        if (lastOperator) {
            switch (lastOperator) {
                case '/':
                    lastSum = +lastSum / (+result.innerText);
                    break;
                case '*':
                    lastSum = +lastSum * (+result.innerText);
                    break;
                case '+':
                    lastSum = +lastSum + (+result.innerText);
                    break;
                case '-':
                    lastSum = +lastSum - (+result.innerText);
                    break;
            }
            result.innerText = lastSum;
            lastOperator = null;
        } else {
            lastSum = result.innerText;
        }
    }

    const setIsFinalResult = (isFinal) => {
        if (isFinal) {
            result.classList.add('final');
        } else {
            result.classList.remove('final');
        }
    };

    const setForceInterval = (inter) => {
        this.localStorage.setItem("nextInterval", inter);
    }

    const checkForce = () => {
        const currInterval = +this.localStorage.getItem("nextInterval") ?? 1;
        if (equalsClickCount % currInterval === 0) {
            tryGetForceNumber();
        }
    }

    const tryGetForceNumber = () => {
        const nextResults = JSON.parse(localStorage.getItem("nextResults"));
        const valToSet = nextResults.pop();
        if (valToSet !== null && valToSet !== undefined) {
            result.innerText = valToSet;
            this.localStorage.setItem("nextResults", JSON.stringify(nextResults));
        }
    }


    advancedClearButton.addEventListener('click', () => {
        iterationInput.value = 2;
        value3Input.value = '';
        value2Input.value = '';
        value1Input.value = '';
    });

    advancedCancelButton.addEventListener('click', () => {
        advancedSettingsWindow.classList.toggle('hidden');
    });

    advancedSaveButton.addEventListener('click', () => {
        this.localStorage.setItem("nextInterval", iterationInput.value);
        const nextResults = [];
        if (value3Input.value !== undefined && value3Input.value !== null) {
            nextResults.push(+value3Input.value);
        }
        if (value2Input.value !== undefined && value2Input.value !== null) {
            nextResults.push(+value2Input.value);
        }
        if (value1Input.value !== undefined && value1Input.value !== null) {
            nextResults.push(+value1Input.value);
        }
        this.localStorage.setItem("nextResults", JSON.stringify(nextResults));

        advancedSettingsWindow.classList.toggle('hidden');
    });
});
